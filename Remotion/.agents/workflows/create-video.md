---
name: remotion-video-creator
description: Remotion × AIエージェントによる動画自動生成ワークフロー。main contentで生成されたfinal_output.mp4を受け取り、MathLayoutに動画を埋め込み、音声と字幕をシンクロさせたRemotionコンポジションを自律的に作成する。
---

# Remotion 動画自動生成ワークフロー

## 概要

このワークフローは、**main contentワークフローで生成された `final_output.mp4`** を受け取り、以下を自律的に実行する：

1. 動画ファイルを Remotion の public ディレクトリにコピー
2. 字幕タイミングデータを自動生成
3. MathLayout + 字幕シンクロ付きの Remotion コンポジションを作成
4. Root.tsx に登録

**ユーザーの承認・誘導なしにワンショットで完了させること。**

---

## 前提条件

- main content ワークフローが完了し、以下のファイルが存在すること：
  - `{main_content_dir}/final_output.mp4` — メインコンテンツ動画（音声内蔵）
  - `{main_content_dir}/scene_map.json` — 台本→シーン対応マップ
  - `{main_content_dir}/scene_durations.json` — 各シーンの表示秒数・各セリフの音声duration

- `{main_content_dir}` は通常 `d:/myfolder/動画生成/main content/presentation/{テーマ名}` にある

---

## ワークフロー全体像

```
STEP 1: プロジェクトIDを決定し、動画ファイルをコピー
  └→ STEP 2: 字幕タイミングデータを自動生成（スクリプト実行）
       └→ STEP 3: VideoWithSubtitles.tsx を作成
            └→ STEP 4: Root.tsx に Composition を登録
                 └→ STEP 5: TypeScriptコンパイル確認
                      └→ STEP 6: ユーザーに完了報告
```

**全ステップを承認なしで自動実行する。**

---

## STEP 1: プロジェクトID決定 & 動画ファイルコピー

### 1-1. プロジェクトIDを決める

main content のディレクトリ名をそのままプロジェクトIDとして使用する。
例: `10000h_effort`, `llm_text_generation`

### 1-2. 動画ファイルをコピー

// turbo

```bash
# public/videos ディレクトリが無ければ作成し、final_output.mp4 をコピー
mkdir -p public/videos
cp "{main_content_dir}/final_output.mp4" "public/videos/{project_id}.mp4"
```

PowerShell の場合:
```powershell
if (!(Test-Path "public/videos")) { New-Item -ItemType Directory -Path "public/videos" }
Copy-Item "{main_content_dir}/final_output.mp4" "public/videos/{project_id}.mp4"
```

---

## STEP 2: 字幕タイミングデータを自動生成

// turbo

```bash
node scripts/generate-subtitle-data.js "{main_content_dir}" {project_id}
```

**このコマンドが行うこと:**
1. `scene_map.json` と `scene_durations.json` を読み込む
2. 各セリフの絶対開始フレーム（startFrame）を計算する
   - 各シーンの duration を累積して絶対時間を算出
   - 各セリフの音声 duration + inter_line_silence（デフォルト0.3秒）で行内の開始時間を算出
   - 秒 × 30fps でフレーム数に変換
3. `src/projects/{project_id}/subtitleData.ts` を自動生成する

### 生成される subtitleData.ts の構造

```typescript
export interface SubtitleEntry {
    startTimeSec: number;    // セリフの絶対開始時間（秒）
    startFrame: number;      // セリフの絶対開始フレーム（30fps）
    durationSec: number;     // セリフの音声duration（秒）
    durationFrames: number;  // セリフの音声duration（フレーム）
    speaker: string;         // 話者名（"ずんだもん" or "めたん"）
    text: string;            // セリフテキスト
    speakerColor: string;    // 話者カラー
    sceneId: number;         // シーンID
    sceneTitle: string;      // シーンタイトル
}

export const FPS = 30;
export const TOTAL_DURATION_SEC = ...;
export const TOTAL_FRAMES = ...;
export const SUBTITLE_DATA: SubtitleEntry[] = [...];
```

### 完了確認

コマンド出力に以下が含まれることを確認：
- `✅ Generated:` — ファイルパス
- `Total subtitle entries:` — エントリ数（台本のセリフ数と概ね一致するはず）
- `Total duration:` — 動画の総時間

---

## STEP 3: VideoWithSubtitles.tsx を作成

`src/projects/{project_id}/VideoWithSubtitles.tsx` を以下のテンプレート通りに作成する。

**変更すべき箇所は2つだけ:**
1. `staticFile('videos/{project_id}.mp4')` — プロジェクトIDに合わせる
2. `headerTitle` のデフォルト値 — 動画のテーマに合わせた日本語タイトル

### テンプレート（そのままコピーして使う）

```tsx
import React from 'react';
import {
    OffthreadVideo,
    useCurrentFrame,
    staticFile,
} from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { SUBTITLE_DATA, TOTAL_FRAMES, SubtitleEntry } from './subtitleData';

// ============================================================
// 現在のフレームに対応する字幕エントリを取得
// ============================================================
function getCurrentSubtitle(
    frame: number,
    data: SubtitleEntry[]
): SubtitleEntry | null {
    let result: SubtitleEntry | null = null;
    for (const entry of data) {
        if (entry.startFrame <= frame) {
            result = entry;
        } else {
            break;
        }
    }

    // セリフ終了後（duration + 0.3s余裕）まで表示
    if (result) {
        const endFrame = result.startFrame + result.durationFrames + 9;
        if (frame > endFrame) {
            return null;
        }
    }

    return result;
}

// ============================================================
// メインコンポーネント
// ============================================================
export const VideoWithSubtitles: React.FC = () => {
    const frame = useCurrentFrame();

    const currentEntry = getCurrentSubtitle(frame, SUBTITLE_DATA);

    // 現在のシーンタイトルをヘッダーに表示
    // ★ デフォルト値を動画テーマに合わせて変更する ★
    const headerTitle = currentEntry?.sceneTitle ?? '{動画のテーマタイトル}';

    return (
        <MathLayout
            title={headerTitle}
            videoMode
            subtitle={
                currentEntry ? (
                    <Subtitle
                        speaker={currentEntry.speaker}
                        text={currentEntry.text}
                        speakerColor={currentEntry.speakerColor}
                        appearFrame={currentEntry.startFrame}
                    />
                ) : undefined
            }
        >
            {/* メインコンテンツ領域に動画をフル表示 */}
            <OffthreadVideo
                src={staticFile('videos/{project_id}.mp4')}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </MathLayout>
    );
};

export { TOTAL_FRAMES };
```

### コンポーネントの構造説明

```
┌─────────────────────────────────┬──────────┐
│  ヘッダー: シーンタイトル（動的）  │          │
├─────────────────────────────────┤ サイド    │
│                                 │ バー     │
│   ┌─────────────────────────┐   │          │
│   │                         │   │          │
│   │   final_output.mp4      │   │          │
│   │   (videoMode: 枠なし)    │   │          │
│   │                         │   │          │
│   └─────────────────────────┘   │          │
│                                 │          │
├─────────────────────────────────┴──────────┤
│  字幕: ずんだもん ▶ セリフテキスト...        │
└────────────────────────────────────────────┘
```

- **MathLayout の `videoMode` prop**: カードの背景・ボーダー・シャドウ・パディングを全て消し、動画がコンテンツ領域に自然に溶け込む
- **`objectFit: 'cover'`**: 動画がコンテンツ領域全体を覆うように表示（端が多少切れることがある）
- **ヘッダー**: `currentEntry?.sceneTitle` で現在のシーンタイトルが動的に切り替わる
- **字幕**: `Subtitle` コンポーネントが `startFrame` に基づいてフェードインアニメーション付きで表示

### 字幕シンクロの原理

`final_output.mp4` は `scene_durations.json` のタイミングに基づいて音声が合成されている。
同じ `scene_durations.json` から `subtitleData.ts` の `startFrame` を計算しているため、
**Remotion上のフレーム進行 = 動画の再生位置 = 字幕の表示タイミング** が自動的に同期する。

---

## STEP 4: Root.tsx に Composition を登録

`src/Root.tsx` を編集して、新しいコンポジションを登録する。

### 追加する import

```tsx
import { VideoWithSubtitles, TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES } from "./projects/{project_id}/VideoWithSubtitles";
```

**注意**: `TOTAL_FRAMES` の名前が既存のインポートと衝突する場合は、`as` でエイリアスを付けること。

### 追加する Composition（`<>` の中の先頭に追加する）

```tsx
<Composition
  id="{project_id}-video-subtitles"
  component={VideoWithSubtitles}
  durationInFrames={VIDEO_SUB_TOTAL_FRAMES}
  fps={30}
  width={1920}
  height={1080}
/>
```

- Composition の `id` はハイフン区切り（アンダースコアをハイフンに変換）
- `durationInFrames` は `subtitleData.ts` からエクスポートされた `TOTAL_FRAMES` を使用

---

## STEP 5: TypeScript コンパイル確認

// turbo

```bash
npx tsc --noEmit
```

エラーが出なければ成功。エラーが出た場合は修正する。

---

## STEP 6: ユーザーに完了報告

以下を報告する：

1. **作成されたファイル一覧**
2. **Composition ID** — Remotion Studio で選択するID
3. **確認方法** — `npm run dev` で Remotion Studio を開き、作成した Composition を選択してプレビュー
4. **レンダリングコマンド** （参考）

```bash
npx remotion render {project_id}-video-subtitles --output output/{project_id}.mp4
```

---

## 📂 生成されるファイル構成

```
Remotion/
├── public/
│   └── videos/
│       └── {project_id}.mp4          ← STEP 1 でコピー
├── scripts/
│   └── generate-subtitle-data.js     ← 既存（字幕データ生成スクリプト）
└── src/
    ├── Root.tsx                       ← STEP 4 で編集
    └── projects/
        └── {project_id}/
            ├── subtitleData.ts        ← STEP 2 で自動生成
            └── VideoWithSubtitles.tsx ← STEP 3 で作成
```

---

## 使用する既存コンポーネント

| コンポーネント | 場所 | 役割 |
|---|---|---|
| `MathLayout` | `components/layouts/MathLayout.tsx` | グラスモーフィズムのレイアウト。`videoMode` prop で動画埋め込みモード |
| `Subtitle` | `components/ui/Subtitle.tsx` | フッター領域の字幕表示。フェードインアニメーション付き |
| `OffthreadVideo` | `remotion` パッケージ | 動画のレンダリング。メインスレッドをブロックしない |

---

## MathLayout の `videoMode` について

`MathLayout` に `videoMode` prop（boolean、デフォルト `false`）を渡すと、カードコンテナのスタイルが以下のように変わる：

| プロパティ | 通常モード | videoMode |
|-----------|-----------|-----------|
| カード背景 | 半透明白 | 透明 |
| ボーダー | 白い枠線 | なし |
| ボックスシャドウ | ソフトシャドウ | なし |
| パディング | `44px 64px` | `0` |
| overflow | `visible` | `hidden`（動画が角丸でクリップ） |
| backdropFilter | `blur(20px)` | なし |
| フッター領域 | `subtitle` prop がある時だけ表示 | **常に表示**（字幕がない時間帯もフッターが残りレイアウトが安定） |

これにより、動画がレイアウトの背景グラデーションの上に自然に溶け込む。

**⚠️ 重要: フッター常時表示について**

`videoMode` が有効な場合、`subtitle` prop が `undefined`（セリフの間の無音区間）でもフッター領域（高さ100px）は常に描画される。これにより、字幕の出入りでメインコンテンツ領域のサイズが変わる「レイアウトジャンプ」を防止している。

---

## トラブルシューティング

| 問題 | 原因 | 対処法 |
|------|------|--------|
| 字幕のタイミングがずれる | `scene_durations.json` が古い、または main content で音声を再生成した | `generate-subtitle-data.js` を再実行して `subtitleData.ts` を再生成 |
| 動画が表示されない | `public/videos/` にファイルがない、またはパスが間違っている | `staticFile()` のパスと実際のファイル名が一致しているか確認 |
| 動画の端が切れる | `objectFit: 'cover'` の仕様 | `'contain'` に変更すると全体が見えるが余白が出る |
| TOTAL_FRAMES の import 衝突 | 複数プロジェクトから同名エクスポート | `as` でエイリアスを付ける（例: `TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES`） |
| ヘッダーのタイトルがundefined | セリフの間（無音区間）で `currentEntry` が null | デフォルト値 `?? 'タイトル'` を設定しているので通常は問題ない |
