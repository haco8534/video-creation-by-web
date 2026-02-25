---
description: テーマ入力→台本→メインコンテンツ動画→Remotion仕上げ→mp4出力の全自動動画生成ワークフロー
---

# 🎬 動画自動生成 マスターワークフロー

## 概要

ユーザーからの**テーマ入力のみ**で、YouTube解説動画（mp4）を自動生成する統合ワークフロー。

### インプット
- **テーマ名**（日本語）: 例「1万時間の法則」「マシュマロ実験」

### アウトプット
- **完成動画** (`Remotion/output/{project_id}.mp4`): 字幕・立ち絵・レイアウト付きの解説動画

### パイプライン全体図

```
ユーザー入力: テーマ名
       │
       ▼
 ╔═══════════════════════════════════╗
 ║  Phase A: 台本作成                 ║
 ║  (d:\myfolder\動画生成\台本作成)     ║
 ║                                   ║
 ║  → script.md / research.md 出力   ║
 ╚═══════════════╤═══════════════════╝
                 │ script.md
                 ▼
 ╔═══════════════════════════════════╗
 ║  Phase B: メインコンテンツ生成       ║
 ║  (d:\myfolder\動画生成\main content) ║
 ║                                   ║
 ║  B1. Webプレゼン生成               ║
 ║  B2. 音声生成 (VOICEVOX)           ║
 ║  B3. 録画 + 音声合成               ║
 ║                                   ║
 ║  → final_output.mp4 出力          ║
 ╚═══════════════╤═══════════════════╝
                 │ final_output.mp4 + scene_map.json + scene_durations.json
                 ▼
 ╔═══════════════════════════════════╗
 ║  Phase C: Remotion仕上げ           ║
 ║  (d:\myfolder\動画生成\Remotion)    ║
 ║                                   ║
 ║  C1. 動画コピー + 字幕データ生成    ║
 ║  C2. VideoWithSubtitles.tsx 作成   ║
 ║  C3. Root.tsx 登録 + レンダリング   ║
 ║                                   ║
 ║  → output/{project_id}.mp4 出力   ║
 ╚═══════════════════════════════════╝
       │
       ▼
  ✅ 完成動画
```

---

## 変数定義（最初に決定する）

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{テーマ名}` | ユーザー入力のテーマ（日本語） | `1万時間の法則` |
| `{project_id}` | テーマの英語スネークケースID | `10000h_effort` |
| `{台本DIR}` | `d:\myfolder\動画生成\台本作成\{テーマ名}` | |
| `{MC_DIR}` | `d:\myfolder\動画生成\main content\presentation\{project_id}` | |
| `{REMOTION_DIR}` | `d:\myfolder\動画生成\Remotion` | |

---

# Phase A: 台本作成

**作業ディレクトリ**: `d:\myfolder\動画生成\台本作成`

**参照**: `_agents/workflows/script_creation.md` のStep 1〜5をそのまま実行する。

### 実行手順

1. **テーマ名からプロジェクトディレクトリを作成**: `{台本DIR}` を作成
2. **Step 1**: テーマ設定＆核心メッセージ確定
3. **Step 2a/2b/2c（並列）**: マルチ視点リサーチ（各 `research_2a/b/c.md` を出力）
4. **Step 2d**: リサーチ統合 → `research.md` を出力
5. **Step 3**: 構成設計 → **⚠️ ユーザー承認ゲート**（唯一の承認ポイント）
6. **Step 4**: セクション別台本執筆
7. **Step 5**: 推敲・最終チェック → `script.md` を出力

### Phase A 完了条件

- [ ] `{台本DIR}/script.md` が存在する
- [ ] `{台本DIR}/research.md` が存在する
- [ ] script.md にシーン遷移マーカー（`<!-- SCENE: ... -->`）が含まれている
- [ ] セリフ総文字数が 6,000〜7,000文字

### Phase A → B への受け渡し

Phase B に渡すデータ:
- `{台本DIR}/script.md` — 台本（Phase Bの入力）

---

# Phase B: メインコンテンツ生成

**作業ディレクトリ**: `d:\myfolder\動画生成\main content`

**参照**: `.agents/skills/presentation_generator/SKILL.md` のPhase 1〜3をそのまま実行する。

### 前提条件
- VOICEVOXがローカルで起動中（`http://localhost:50021`）
- ffmpegがPATHに通っている
- `main content/node_modules` にpuppeteerがインストール済み

### 実行手順

#### B1. Webプレゼンテーション生成（SKILL.md Phase 1）

1. `{台本DIR}/script.md` を読み込む
2. **project_id を決定**（テーマ名の英語スネークケース）
3. シーン構成・デザインテーマを設計
4. `{MC_DIR}/index.html`, `style.css`, `script.js` を生成

**⚠️ 重要**: `window.goTo(index)` 関数を必ず実装すること（録画スクリプトが使用）

#### B2. 音声生成（SKILL.md Phase 2）

1. `{MC_DIR}/scene_map.json` を手動作成（台本のセリフ→シーン対応マップ）

// turbo
2. 音声生成を実行:
```powershell
node presentation/tools/generate_audio.js {project_id}
```

**確認**: `{MC_DIR}/scene_durations.json` が自動生成されたこと

#### B3. 録画 + 音声合成（SKILL.md Phase 3）

// turbo
1. 並列録画:
```powershell
node presentation/tools/record.js {project_id} 4 1920x1080
```

**確認**: `{MC_DIR}/recording.mp4` が生成され、長さが scene_durations.json の合計と一致すること:
```powershell
ffprobe -v error -show_entries format=duration -of csv=p=0 "presentation/{project_id}/recording.mp4"
```

// turbo
2. 音声+映像合成:
```powershell
node presentation/tools/merge_audio.js {project_id}
```

### Phase B 完了条件

- [ ] `{MC_DIR}/final_output.mp4` が存在する
- [ ] `{MC_DIR}/scene_map.json` が存在する
- [ ] `{MC_DIR}/scene_durations.json` が存在する
- [ ] final_output.mp4 の長さが期待通りである

### Phase B → C への受け渡し

Phase C に渡すデータ（すべて `{MC_DIR}` 内）:
- `final_output.mp4` — メインコンテンツ動画（音声付き）
- `scene_map.json` — セリフ→シーン対応マップ
- `scene_durations.json` — 各シーンの表示秒数・各セリフのduration

---

# Phase C: Remotion仕上げ

**作業ディレクトリ**: `d:\myfolder\動画生成\Remotion`

**参照**: `.agents/workflows/create-video.md` のSTEP 1〜6を実行する。

### 前提条件
- キャラクター画像が以下に存在すること:
  - `public/characters/zundamon/default.png`
  - `public/characters/metan/default.png`

### 実行手順

#### C1. 動画コピー + 字幕データ生成

// turbo
1. 動画ファイルをコピー:
```powershell
Copy-Item "{MC_DIR}/final_output.mp4" "public/videos/{project_id}.mp4"
```

// turbo
2. 字幕タイミングデータを生成:
```powershell
node scripts/generate-subtitle-data.js "{MC_DIR}" {project_id}
```

**確認**: `src/projects/{project_id}/subtitleData.ts` が生成されたこと

#### C2. VideoWithSubtitles.tsx を作成

`src/projects/{project_id}/VideoWithSubtitles.tsx` を作成する。

**テンプレートは `.agents/workflows/create-video.md` の STEP 3 に記載。**

変更箇所:
1. `staticFile('videos/{project_id}.mp4')` — project_id を実際の値に
2. `headerTitle` のデフォルト値 — テーマの日本語タイトルに
3. スピーカースワップ方式の立ち絵コンポーネントを使用（現在の10000h_effortの実装を参考に）

**⚠️ 重要**: 立ち絵はスピーカースワップ方式を使うこと。
- 喋っているキャラだけサイドバーに大きく表示
- 話者交代時にスライドで入れ替え
- 立ち絵はMathLayoutより背面に配置（`AbsoluteFill` で先にレンダリング）

現在の参考実装: `src/projects/10000h_effort/VideoWithSubtitles.tsx`

#### C3. Root.tsx 登録 + コンパイル確認

1. `src/Root.tsx` に新しい Composition を追加:
```tsx
import { VideoWithSubtitles, TOTAL_FRAMES } from "./projects/{project_id}/VideoWithSubtitles";

// <> 内に追加:
<Composition
  id="{project_id}-video-subtitles"
  component={VideoWithSubtitles}
  durationInFrames={TOTAL_FRAMES}
  fps={30}
  width={1920}
  height={1080}
/>
```

// turbo
2. TypeScriptコンパイル確認:
```powershell
npx tsc --noEmit
```

#### C4. Remotionレンダリング

// turbo
```powershell
npx remotion render {project_id}-video-subtitles --output output/{project_id}.mp4
```

### Phase C 完了条件

- [ ] `output/{project_id}.mp4` が生成された
- [ ] 動画の長さが期待通り

---

## ✅ 最終完了報告

以下をユーザーに報告する:

1. **生成されたファイル一覧**
   - `台本作成/{テーマ名}/script.md` — 台本
   - `台本作成/{テーマ名}/research.md` — リサーチ結果
   - `main content/presentation/{project_id}/final_output.mp4` — メインコンテンツ
   - `Remotion/output/{project_id}.mp4` — ★完成動画

2. **動画の仕様**
   - 解像度: 1920x1080
   - フレームレート: 30fps
   - 推定尺: 約20分
   - 内容: MathLayoutフレーム + メインコンテンツ動画 + 字幕 + 立ち絵

---

## 承認ゲートまとめ

パイプライン全体で**ユーザーの承認が必要なのは1箇所のみ**:

| フェーズ | ステップ | 承認内容 |
|---------|---------|---------|
| Phase A | Step 3（構成設計） | ブロック構成案の承認 |

それ以外は全て自動実行。

---

## トラブルシューティング

| 問題 | フェーズ | 対処法 |
|------|---------|--------|
| VOICEVOXに接続できない | B | `http://localhost:50021` が応答するか確認。VOICEVOXを起動する |
| 録画が途中で止まる | B | チャンクファイルを確認し、壊れたものを削除して再実行 |
| 字幕がずれる | C | `generate-subtitle-data.js` を再実行 |
| 立ち絵が表示されない | C | `public/characters/` に画像があるか確認 |
| TypeScriptエラー | C | `subtitleData.ts` の型と `VideoWithSubtitles.tsx` のimportが一致するか確認 |
| レンダリングが遅い | C | `--concurrency=4` オプションで並列レンダリング |
