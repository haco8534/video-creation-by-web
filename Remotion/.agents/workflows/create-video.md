---
name: remotion-video-creator
description: Remotion × AIエージェントによる動画自動生成ワークフロー。main contentで生成されたfinal_output.mp4を受け取り、MathLayoutに動画を埋め込み、音声と字幕をシンクロさせたRemotionコンポジションを自律的に作成する。
---

# Remotion 動画自動生成ワークフロー

## 概要

このワークフローは、**main contentワークフローで生成された `final_output.mp4`** を受け取り、以下を自律的に実行する：

1. 動画ファイルを Remotion の public ディレクトリにコピー
2. BGMファイルを配置
3. 字幕タイミングデータを自動生成
4. MathLayout + 字幕シンクロ + サイドバーUI + BGM付きの Remotion コンポジションを作成
5. Root.tsx に登録

**ユーザーの承認・誘導なしにワンショットで完了させること。**

---

## 前提条件

- main content ワークフローが完了し、以下のファイルが存在すること：
  - `{main_content_dir}/final_output.mp4` — メインコンテンツ動画（音声内蔵）
  - `{main_content_dir}/scene_map.json` — 台本→シーン対応マップ
  - `{main_content_dir}/scene_durations.json` — 各シーンの表示秒数・各セリフの音声duration

- `{main_content_dir}` は通常 `d:/myfolder/動画生成/main content/presentation/{テーマ名}` にある
- BGMファイルが `public/bgm/` に配置済みであること（デフォルト: `Mineral.mp3`）

---

## ワークフロー全体像

```
STEP 1: プロジェクトIDを決定し、動画ファイル・BGMをコピー
  └→ STEP 2: 字幕タイミングデータを自動生成（スクリプト実行）
       └→ STEP 3: VideoWithSubtitles.tsx を作成
            └→ STEP 4: Root.tsx に Composition を登録
                 └→ STEP 5: TypeScriptコンパイル確認
                      └→ STEP 6: ユーザーに完了報告
```

**全ステップを承認なしで自動実行する。**

---

## STEP 1: プロジェクトID決定 & ファイルコピー

### 1-1. プロジェクトIDを決める

main content のディレクトリ名をそのままプロジェクトIDとして使用する。
例: `10000h_effort`, `llm_text_generation`

### 1-2. 動画ファイルをコピー

// turbo

```powershell
if (!(Test-Path "public/videos")) { New-Item -ItemType Directory -Path "public/videos" }
Copy-Item "{main_content_dir}/final_output.mp4" "public/videos/{project_id}.mp4"
```

### 1-3. BGMファイルを確認

BGMは `public/bgm/Mineral.mp3` に配置済み（共通素材）。もし別のBGMを使う場合はここでコピーする。

---

## STEP 1.5: scene_map.json の title を検証（必須）

字幕データを生成する前に、`scene_map.json` の `title` フィールドにビジュアルパターン名が混入していないか**必ず**チェックする。

// turbo

```powershell
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('{main_content_dir}/scene_map.json','utf8')); const bad=['タイトルカード','数値インパクト','フロー図','テキスト強調','比較対照','段階的リスト','引用カード','タイムライン','脳のSVG','まとめ3ポイント','エンディング']; let errors=0; d.scenes.forEach(s=>{const found=bad.filter(b=>s.title.startsWith(b)||s.title.includes('「')); if(found.length>0){console.log('❌ Scene '+s.id+': \"'+s.title+'\" ← パターン名混入: '+found.join(', ')); errors++;} else {console.log('✅ Scene '+s.id+': \"'+s.title+'\"');}}); if(errors>0){console.log('\n🚨 '+errors+'件のtitleを修正してください'); process.exit(1);} else {console.log('\n✅ 全titleが正常です');}"
```

> 🚨 **エラーがある場合**: scene_map.json の title を修正してから STEP 2 に進むこと。
> `<!-- SCENE: ビジュアルパターン「コンテンツタイトル」 -->` の「コンテンツタイトル」部分のみを title に入れる。
> 括弧「」も除去すること。

---

## STEP 2: 字幕タイミングデータを自動生成

// turbo

```bash
node scripts/generate-subtitle-data.js "{main_content_dir}" {project_id}
```

**このコマンドが行うこと:**
1. `scene_map.json` と `scene_durations.json` を読み込む
2. 各セリフの絶対開始フレーム（startFrame）を計算する
3. `src/projects/{project_id}/subtitleData.ts` を自動生成する

### 生成される subtitleData.ts の構造

```typescript
export interface SubtitleEntry {
    startTimeSec: number;
    startFrame: number;
    durationSec: number;
    durationFrames: number;
    speaker: string;
    text: string;
    speakerColor: string;
    sceneId: number;
    sceneTitle: string;
}

export const FPS = 30;
export const TOTAL_DURATION_SEC = ...;
export const TOTAL_FRAMES = ...;
export const SUBTITLE_DATA: SubtitleEntry[] = [...];
```

### 完了確認

コマンド出力に以下が含まれることを確認：
- `✅ Generated:` — ファイルパス
- `Total subtitle entries:` — エントリ数
- `Total duration:` — 動画の総時間

---

## STEP 3: VideoWithSubtitles.tsx を作成

`src/projects/{project_id}/VideoWithSubtitles.tsx` を以下のテンプレート通りに作成する。

**変更すべき箇所（★マーク）:**
1. `staticFile('videos/{project_id}.mp4')` — プロジェクトIDに合わせる
2. `headerTitle` のデフォルト値 — 動画のテーマに合わせた日本語タイトル
3. サイドバーの `PSYCHOLOGY` — テーマのカテゴリーラベル（英語大文字）
4. サイドバーの `マシュマロ実験の真実` — テーマのタイトル
5. BGMのパスとボリューム（必要に応じて）

### 前提: アセットの配置

```
public/
├── characters/
│   ├── zundamon/
│   │   ├── normal2.png, normal3.png, normal4.png
│   └── metan/
│       ├── normal2.png, normal3.png, normal4.png
└── bgm/
    └── Mineral.mp3
```

### テンプレート（そのままコピーして★箇所を変更）

```tsx
import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Img,
    OffthreadVideo,
    useCurrentFrame,
    staticFile,
    interpolate,
} from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { SUBTITLE_DATA, TOTAL_FRAMES, SubtitleEntry } from './subtitleData';

// ============================================================
// BGM設定
// ============================================================
const BGM_VOLUME = 0.05;           // ★ BGM音量（0.0〜1.0）
const BGM_FADE_OUT_FRAMES = 90;    // フェードアウト（30fps × 3秒）

// ============================================================
// キャラクター設定
// ============================================================
const SIDEBAR_WIDTH = 380;

const CHARACTER_IMAGE_VARIANTS: Record<string, string[]> = {
    'ずんだもん': [
        'characters/zundamon/normal2.png',
        'characters/zundamon/normal3.png',
        'characters/zundamon/normal4.png',
    ],
    'めたん': [
        'characters/metan/normal2.png',
        'characters/metan/normal3.png',
        'characters/metan/normal4.png',
    ],
};

function getImageForEntry(speaker: string, entryIndex: number): string | null {
    const variants = CHARACTER_IMAGE_VARIANTS[speaker];
    if (!variants || variants.length === 0) return null;
    return variants[entryIndex % variants.length];
}

const ANIM = {
    swapFrames: 10,
    inactiveOpacity: 0.5,
    slideDistance: 80,
};

// ============================================================
// 字幕取得
// ============================================================
function getCurrentSubtitle(frame: number, data: SubtitleEntry[]): SubtitleEntry | null {
    let result: SubtitleEntry | null = null;
    for (const entry of data) {
        if (entry.startFrame <= frame) { result = entry; } else { break; }
    }
    if (result) {
        const endFrame = result.startFrame + result.durationFrames + 9;
        if (frame > endFrame) return null;
    }
    return result;
}

function getPreviousSubtitle(frame: number, currentEntry: SubtitleEntry | null, data: SubtitleEntry[]): SubtitleEntry | null {
    if (!currentEntry) return null;
    const currentIndex = data.indexOf(currentEntry);
    if (currentIndex <= 0) return null;
    return data[currentIndex - 1];
}

// ============================================================
// スピーカースワップ付きキャラクタースプライト
// ============================================================
const SpeakerSwapSprite: React.FC<{
    currentSpeaker: string | null;
    currentImagePath: string | null;
    previousSpeaker: string | null;
    previousImagePath: string | null;
    framesSinceSpeakerChange: number;
    frame: number;
}> = ({ currentSpeaker, currentImagePath, previousSpeaker, previousImagePath, framesSinceSpeakerChange }) => {
    const speakerChanged = currentSpeaker !== previousSpeaker;
    const isTransitioning = speakerChanged && framesSinceSpeakerChange < ANIM.swapFrames;
    return (
        <>
            {currentSpeaker && currentImagePath && (
                <CharacterLayer imagePath={currentImagePath}
                    phase={isTransitioning ? 'entering' : 'active'}
                    progress={isTransitioning ? framesSinceSpeakerChange / ANIM.swapFrames : 1}
                    zIndex={20} />
            )}
            {isTransitioning && previousSpeaker && previousImagePath && (
                <CharacterLayer imagePath={previousImagePath}
                    phase="exiting" progress={framesSinceSpeakerChange / ANIM.swapFrames}
                    zIndex={19} />
            )}
        </>
    );
};

const CharacterLayer: React.FC<{
    imagePath: string; phase: 'entering' | 'active' | 'exiting'; progress: number; zIndex: number;
}> = ({ imagePath, phase, progress, zIndex }) => {
    let opacity: number, translateY: number;
    switch (phase) {
        case 'entering':
            opacity = interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
            translateY = interpolate(progress, [0, 1], [ANIM.slideDistance, 0], { extrapolateRight: 'clamp' });
            break;
        case 'active': opacity = 1; translateY = 0; break;
        case 'exiting':
            opacity = interpolate(progress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
            translateY = interpolate(progress, [0, 1], [0, ANIM.slideDistance], { extrapolateRight: 'clamp' });
            break;
    }
    return (
        <div style={{
            position: 'absolute', bottom: -60, right: 10, width: SIDEBAR_WIDTH - 20,
            zIndex, opacity, transform: `translateY(${translateY}px)`,
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.25))', pointerEvents: 'none' as const,
        }}>
            <Img src={staticFile(imagePath)} style={{ width: '100%', height: 'auto', objectFit: 'contain' as const }} />
        </div>
    );
};

// ============================================================
// メインコンポーネント
// ============================================================
export const VideoWithSubtitles: React.FC = () => {
    const frame = useCurrentFrame();
    const currentEntry = getCurrentSubtitle(frame, SUBTITLE_DATA);
    const previousEntry = getPreviousSubtitle(frame, currentEntry, SUBTITLE_DATA);
    const headerTitle = currentEntry?.sceneTitle ?? '★動画のテーマタイトル★';

    const currentSpeaker = currentEntry?.speaker ?? null;
    const previousSpeaker = previousEntry?.speaker ?? null;

    const currentIndex = currentEntry ? SUBTITLE_DATA.indexOf(currentEntry) : 0;
    const previousIndex = previousEntry ? SUBTITLE_DATA.indexOf(previousEntry) : 0;
    const currentImagePath = currentSpeaker ? getImageForEntry(currentSpeaker, currentIndex) : null;
    const previousImagePath = previousSpeaker ? getImageForEntry(previousSpeaker, previousIndex) : null;

    const framesSinceSpeakerChange = currentEntry
        ? frame - currentEntry.startFrame
        : ANIM.swapFrames;

    // シーン進捗
    const currentSceneId = currentEntry?.sceneId ?? 0;
    const progressPercent = Math.round((frame / TOTAL_FRAMES) * 100);

    // チャプターリスト用
    const sceneList = React.useMemo(() => {
        const seen = new Set<number>();
        const list: { id: number; title: string; startFrame: number }[] = [];
        for (const entry of SUBTITLE_DATA) {
            if (!seen.has(entry.sceneId)) {
                seen.add(entry.sceneId);
                list.push({ id: entry.sceneId, title: entry.sceneTitle, startFrame: entry.startFrame });
            }
        }
        return list;
    }, []);

    const currentSceneIdx = sceneList.findIndex(s => s.id === currentSceneId);
    const CHAPTER_ITEM_HEIGHT = 44;
    const CHAPTER_ANIM_FRAMES = 15;

    const currentSceneStartFrame = currentSceneIdx >= 0 ? sceneList[currentSceneIdx].startFrame : 0;
    const framesSinceSceneChange = frame - currentSceneStartFrame;
    const animProgress = Math.min(framesSinceSceneChange / CHAPTER_ANIM_FRAMES, 1);
    const prevSceneIdx = currentSceneIdx > 0 ? currentSceneIdx - 1 : 0;
    const smoothIdx = interpolate(animProgress, [0, 1], [prevSceneIdx, currentSceneIdx], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill>
            {/* キャラクター立ち絵 */}
            <SpeakerSwapSprite
                currentSpeaker={currentSpeaker} currentImagePath={currentImagePath}
                previousSpeaker={previousSpeaker} previousImagePath={previousImagePath}
                framesSinceSpeakerChange={framesSinceSpeakerChange} frame={frame}
            />

            {/* ★ サイドバーオーバーレイ */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: SIDEBAR_WIDTH, height: '100%',
                zIndex: 15, pointerEvents: 'none', display: 'flex', flexDirection: 'column',
                padding: '28px 30px', boxSizing: 'border-box',
            }}>
                {/* テーマブランディング */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 700, letterSpacing: 4,
                        color: 'rgba(107, 114, 128, 0.7)', textTransform: 'uppercase' as const,
                        fontFamily: '"Inter", "Zen Maru Gothic", sans-serif',
                    }}>
                        ★CATEGORY★
                    </div>
                    <div style={{
                        fontSize: 24, fontWeight: 800, color: '#374151', lineHeight: 1.3,
                        fontFamily: '"Zen Maru Gothic", sans-serif',
                    }}>
                        ★テーマタイトル★
                    </div>
                    <div style={{
                        width: 50, height: 3, borderRadius: 2, marginTop: 2,
                        background: 'linear-gradient(90deg, rgba(167,139,250,0.6), rgba(96,165,250,0.4))',
                    }} />
                </div>

                {/* 進捗バー */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(107,114,128,0.6)', letterSpacing: 2, fontFamily: '"Inter", sans-serif' }}>PROGRESS</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(139,92,246,0.8)', fontFamily: '"Inter", sans-serif' }}>{progressPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #A78BFA, #60A5FA)', borderRadius: 3 }} />
                    </div>
                </div>

                {/* チャプターリスト（スライドアニメーション付き） */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(107,114,128,0.6)', letterSpacing: 2, fontFamily: '"Inter", sans-serif', marginBottom: 8 }}>CHAPTERS</span>
                    <div style={{
                        height: CHAPTER_ITEM_HEIGHT * 5, overflow: 'hidden', position: 'relative',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${(2 - smoothIdx) * CHAPTER_ITEM_HEIGHT}px)` }}>
                            {sceneList.map((scene, idx) => {
                                const isCurrent = idx === currentSceneIdx;
                                const distance = Math.abs(idx - currentSceneIdx);
                                const itemOpacity = isCurrent ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0.15;
                                return (
                                    <div key={scene.id} style={{ height: CHAPTER_ITEM_HEIGHT, display: 'flex', alignItems: 'center', gap: 10, opacity: itemOpacity, paddingLeft: isCurrent ? 4 : 0 }}>
                                        <div style={{
                                            width: isCurrent ? 8 : 5, height: isCurrent ? 8 : 5, borderRadius: '50%', flexShrink: 0,
                                            backgroundColor: isCurrent ? '#8B5CF6' : 'rgba(107,114,128,0.3)',
                                            boxShadow: isCurrent ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
                                        }} />
                                        <span style={{
                                            fontSize: isCurrent ? 15 : 13, fontWeight: isCurrent ? 800 : 500,
                                            color: isCurrent ? '#4338CA' : '#6B7280',
                                            fontFamily: '"Zen Maru Gothic", sans-serif', lineHeight: 1.3,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>{scene.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 話者インジケーター */}
                <div style={{ flex: 1 }} />
                {currentSpeaker && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
                        padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.45)',
                        borderRadius: 24, backdropFilter: 'blur(8px)', alignSelf: 'flex-start',
                        border: '1px solid rgba(255,255,255,0.5)',
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            backgroundColor: currentEntry?.speakerColor ?? '#A78BFA',
                            boxShadow: `0 0 8px ${currentEntry?.speakerColor ?? '#A78BFA'}`,
                        }} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#374151', fontFamily: '"Zen Maru Gothic", sans-serif' }}>
                            {currentSpeaker}
                        </span>
                    </div>
                )}
            </div>

            {/* レイアウト + 動画 + 字幕 */}
            <MathLayout title={headerTitle} videoMode
                subtitle={currentEntry ? (
                    <Subtitle speaker={currentEntry.speaker} text={currentEntry.text}
                        speakerColor={currentEntry.speakerColor} appearFrame={currentEntry.startFrame} />
                ) : undefined}
            >
                <OffthreadVideo
                    src={staticFile('videos/{project_id}.mp4')}  {/* ★ プロジェクトID */}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </MathLayout>

            {/* BGM（ループ再生 + 終了時フェードアウト） */}
            <Audio
                src={staticFile('bgm/Mineral.mp3')}
                loop
                volume={(f) => {
                    const fadeOutStart = TOTAL_FRAMES - BGM_FADE_OUT_FRAMES;
                    if (f >= fadeOutStart) {
                        return interpolate(f, [fadeOutStart, TOTAL_FRAMES], [BGM_VOLUME, 0], { extrapolateRight: 'clamp' });
                    }
                    return BGM_VOLUME;
                }}
            />
        </AbsoluteFill>
    );
};

export { TOTAL_FRAMES };
```

### サイドバーオーバーレイの機能

| 要素 | 説明 |
|------|------|
| **カテゴリーラベル** | 英語大文字のテーマカテゴリ（例: PSYCHOLOGY, TECHNOLOGY） |
| **テーマタイトル** | 日本語の動画タイトル（24px太字） |
| **進捗バー** | フレーム進行に連動する紫→青グラデーションのプログレスバー |
| **チャプターリスト** | スライドアニメーション付き。現在のチャプター強調、前後を薄く表示。上下フェードマスク付き |
| **話者バッジ** | 現在話している話者の名前とカラードット。キャラの真上に表示 |

### キャラクター立ち絵の仕様

- 各キャラに複数ポーズ画像をローテーション（セリフごとに切り替え）
- 話者交代時: スライドイン/アウトアニメーション（10フレーム）
- 同じキャラ連続: アニメーションなし（画像だけ切り替え）

### BGM仕様

- `<Audio>` コンポーネントで `loop` 再生
- デフォルト音量: `0.05`（★ `BGM_VOLUME` で調整可能）
- 動画終了3秒前からフェードアウト（★ `BGM_FADE_OUT_FRAMES` で調整可能）

---

## STEP 4: Root.tsx に Composition を登録

### 追加する import

```tsx
import { VideoWithSubtitles, TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES } from "./projects/{project_id}/VideoWithSubtitles";
```

### 追加する Composition

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

---

## STEP 5: TypeScript コンパイル確認

// turbo

```bash
npx tsc --noEmit
```

エラーが出なければ成功。エラーが出た場合は修正する。

---

## STEP 6: ユーザーに完了報告

1. **作成されたファイル一覧**
2. **Composition ID**
3. **確認方法** — `npm run dev` でプレビュー
4. **レンダリングコマンド**:

```bash
npx remotion render {project_id}-video-subtitles --output output/{project_id}.mp4
```

---

## 📂 生成されるファイル構成

```
Remotion/
├── public/
│   ├── bgm/
│   │   └── Mineral.mp3               ← BGM（共通）
│   ├── characters/
│   │   ├── zundamon/normal{2,3,4}.png
│   │   └── metan/normal{2,3,4}.png
│   └── videos/
│       └── {project_id}.mp4          ← STEP 1 でコピー
├── scripts/
│   └── generate-subtitle-data.js     ← 既存
└── src/
    ├── Root.tsx                       ← STEP 4 で編集
    └── projects/
        └── {project_id}/
            ├── subtitleData.ts        ← STEP 2 で自動生成
            └── VideoWithSubtitles.tsx ← STEP 3 で作成
```

---

## トラブルシューティング

| 問題 | 原因 | 対処法 |
|------|------|--------|
| 字幕のタイミングがずれる | `scene_durations.json` が古い | `generate-subtitle-data.js` を再実行 |
| 動画が表示されない | パスが間違っている | `staticFile()` のパスを確認 |
| BGMが大きすぎる/小さすぎる | 音量設定 | `BGM_VOLUME` を調整（0.05がデフォルト） |
| チャプターリストが表示されない | sceneIdが連番でない | subtitleDataのsceneIdを確認 |
| TOTAL_FRAMES の import 衝突 | 複数プロジェクト | `as` でエイリアスを付ける |
| キャラ画像が表示されない | パスが間違い | `public/characters/` の構成を確認 |
