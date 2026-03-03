---
description: テーマ入力→台本→メインコンテンツ動画→Remotionプロジェクト作成までの全自動動画生成ワークフロー
---

# 🎬 動画自動生成 マスターワークフロー

## 概要

ユーザーからの**テーマ入力のみ**で、YouTube解説動画のRemotionプロジェクトを自動生成する統合ワークフロー。

### インプット
- **テーマ名**（日本語）: 例「1万時間の法則」「マシュマロ実験」

### アウトプット
- **Remotionプロジェクト**: 字幕・立ち絵・レイアウト付きのコンポジションが登録された状態。Remotion Studioでプレビュー可能。
- レンダリング（mp4出力）はユーザーが手動で行う

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
 ║  C3. Root.tsx 登録 + コンパイル確認 ║
 ║                                   ║
 ║  → Remotionプロジェクト完成        ║
 ╚═══════════════╤═══════════════════╝
                 │ Remotion Studioでプレビュー → 手動レンダリング
                 ▼
 ╔═══════════════════════════════════╗
 ║  Phase D: 完成品整理               ║
 ║  (d:\myfolder\動画生成\完成品)      ║
 ║                                   ║
 ║  D1. フォルダ作成                  ║
 ║  D2. 最終成果物をコピー            ║
 ║                                   ║
 ║  → 完成品/{テーマ名}/ に集約       ║
 ╚═══════════════════════════════════╝
       │
       ▼
  ✅ YouTube投稿可能な状態
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
| `{完成品DIR}` | `d:\myfolder\動画生成\完成品\{テーマ名}` | |

---

# Phase A: 台本作成

**作業ディレクトリ**: `d:\myfolder\動画生成\台本作成`

**参照**: `_agents/workflows/script_creation.md` のStep 1〜5をそのまま実行する。

### 実行手順

1. **テーマ名からプロジェクトディレクトリを作成**: `{台本DIR}` を作成
2. **Step 1**: テーマ設定＆核心メッセージ確定
3. **Step 2a/2b/2c（並列）**: マルチ視点リサーチ（各 `research_2a/b/c.md` を出力）
4. **Step 2d**: リサーチ統合 → `research.md` を出力
5. **Step 3**: 構成設計（自動進行）
6. **Step 4**: セクション別台本執筆
7. **Step 5**: 推敲・最終チェック → `script.md` を出力

### ⚠️ セリフ文字数制限（必須）

台本のセリフは **1セリフあたり最大74文字** に収めること。

**理由**: Remotionの字幕フッター（高さ100px、フォント34px、lineHeight 1.45）では2行が上限。3行以上はフッターからはみ出す。

**ルール**:
- 1セリフの `text` フィールドが74文字を超えてはならない
- 超える場合は、意味の区切り（句読点・文の切れ目）で **複数セリフに分割** する
- 分割時はIDやインデックスが変わることを意識し、scene_map.json の lines 配列に正しく反映する
- Step 5（推敲）でスクリプトを使って全セリフの文字数を検証し、74文字超がゼロになることを確認する

**検証コマンド例**:
```
node -e "const d=JSON.parse(require('fs').readFileSync('scene_map.json','utf8')); let bad=0; d.scenes.forEach(s=>s.lines.forEach((l,i)=>{if(l.text.length>74){console.log('❌ Scene '+s.id+' line '+i+': '+l.text.length+'文字'); bad++;}})); console.log(bad?bad+'件超過':'✅ 全セリフ74文字以内');"
```

### Phase A 完了条件

- [ ] `{台本DIR}/script.md` が存在する
- [ ] `{台本DIR}/research.md` が存在する
- [ ] script.md にシーン遷移マーカー（`<!-- SCENE: ... -->`）が含まれている
- [ ] **script.md のメタデータ行（冒頭の箇条書き等）に `<!-- SCENE: ... -->` をそのまま記載していないこと**（バッククォート内でも正規表現でマッチし、ダミーシーンが生成される原因になる）
- [ ] セリフ総文字数が 6,000〜7,000文字
- [ ] 全セリフが74文字以内（字幕はみ出し防止）

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

**🚨 絶対ルール: シーンマーカー完全対応**

HTMLの `<section>` シーンと台本の `<!-- SCENE: ... -->` マーカーは **必ず1:1で対応** しなければならない。

- 台本にN個のSCENEマーカーがあれば、HTMLにもちょうどN個の `<section>` が必要
- HTMLのシーン順序は台本のSCENEマーカーの出現順序と完全に一致すること
- **以下はすべて禁止:**
  - 台本にないシーンの追加（例: 「テキスト強調 問いかけ」「タイトルカード まとめ」「エンディング」等の独自追加）
  - 台本の2つのSCENEを1つのHTMLシーンに統合
  - 台本のSCENEの順序変更

> 💡 **なぜ重要か**: scene_map.json は台本のSCENEマーカーからセリフを分割し、各HTMLシーンにマッピングする。HTMLのシーン数・順序が台本と一致しないと、映像と読み上げがズレて全体の再生成が必要になる。

#### B1.5. Webプレゼンテーション推敲（必須）

HTML/CSS/JSを生成した後、音声生成に進む前に以下のチェックを**すべて**実施し、問題があれば修正すること。
台本生成での推敲ステップと同様、ワンショット生成の品質限界を推敲で補う。

**0. 🚨 シーン対応検証（最優先・自動実行）**:

以下のスクリプトを実行して、HTMLシーンと台本SCENEマーカーの対応を検証する。**MISMATCHが1つでもあれば、B2に進んではならない。**

// turbo
```powershell
node -e "
const fs=require('fs');
const script=fs.readFileSync('{台本DIR}/script.md','utf8');
const html=fs.readFileSync('{MC_DIR}/index.html','utf8');
const scriptScenes=[];
let cur=null;
script.split('\n').forEach(l=>{
  if(l.includes('\x60')&&l.includes('SCENE:'))return;
  const m=l.match(/<!-- SCENE: (.+?) -->/);
  if(m){if(cur)scriptScenes.push(cur);cur={title:m[1]};return;}
});
if(cur)scriptScenes.push(cur);
const htmlComments=[];
const re=/<!-- Scene (\d+): (.+?) -->/g;
let cm;
while((cm=re.exec(html))!==null)htmlComments.push({id:+cm[1],desc:cm[2]});
console.log('台本SCENE: '+scriptScenes.length+' / HTML: '+htmlComments.length);
if(scriptScenes.length!==htmlComments.length){console.log('🚨 シーン数不一致! 台本='+scriptScenes.length+' HTML='+htmlComments.length);process.exit(1);}
let ok=true;
for(let i=0;i<scriptScenes.length;i++){
  const st=scriptScenes[i].title.split('|').pop().trim().substring(0,15);
  const ht=htmlComments[i]?.desc.substring(0,20)||'MISSING';
  const match=ht.includes(st.substring(0,8))||st.includes(ht.substring(0,8));
  console.log((match?'✅':'❌')+' Scene '+i+': 台本=['+scriptScenes[i].title+'] HTML=['+htmlComments[i]?.desc+']');
  if(!match)ok=false;
}
if(!ok){console.log('\n🚨 MISMATCHあり! HTMLのシーン順序を台本に合わせて修正すること');process.exit(1);}
console.log('\n✅ 全シーン対応OK');
"
```

> **MISMATCHの典型原因と修正方法:**
> - **HTMLに余分なシーンがある**: 台本にない「オープニング問いかけ」「まとめタイトルカード」「エンディング」等を削除
> - **HTMLにシーンが足りない**: 台本のSCENEマーカーに対応するビジュアルを追加
> - **シーンの順序が違う**: HTMLの `<section>` の順序を台本のSCENEマーカーの出現順に合わせる
> - 修正後はIDを0からの連番に振り直し、再度このスクリプトを実行して全OKを確認する

**1. 構造・レイアウトチェック**:
- [ ] 全シーンが `.scene` クラス（または `class="scene dark-scene"` 等）で定義されているか
- [ ] `id="scene-0"` から連番で抜けがないか
- [ ] 各シーンの高さが `100vh` で統一されているか
- [ ] `window.goTo(index)` 関数が正しく実装され、全シーンにジャンプできるか
- [ ] シーン数が台本の `<!-- SCENE: ... -->` マーカーの数と一致しているか（= ステップ0で検証済み）

**2. ビジュアル品質チェック**:
- [ ] 各シーンのビジュアルが台本のSCENEマーカーの意図（数値インパクト、比較対照、フロー図等）に対応しているか
- [ ] テキストが見切れたり重なったりしていないか（特に長いテキスト）
- [ ] アニメーションが過剰すぎず、内容の理解を助けているか
- [ ] 配色が統一されており、一貫したデザインテーマになっているか
- [ ] フォントサイズが十分に大きく、1920x1080の動画内で読めるか

**3. コンテンツ精度チェック**:
- [ ] 台本中の**数値・統計データ**がHTMLに正確に反映されているか（台本と照合）
- [ ] 人名・研究名・年号が台本と一致しているか
- [ ] 誤字・脱字がないか
- [ ] 比較・対照を示すシーンで、項目の順序や対応が正しいか

**4. 技術的チェック**:
- [ ] CSS `zoom` に依存せず、100%表示で意図通りに見えるか
- [ ] SVGやCanvas要素が正しくレンダリングされるか
- [ ] 使用していないCSSルールが大量に残っていないか
- [ ] JavaScriptコンソールエラーがないか

> 🚨 **全項目を確認してから B2 に進むこと。** 録画後にWebページの問題が見つかると、再録画が必要になり大幅な手戻りが発生する。

#### B2. 音声生成（SKILL.md Phase 2）

// turbo
1. `{MC_DIR}/scene_map.json` を自動生成（SKILL.md Step 3「自動生成スクリプト」を使用）:
```powershell
node -e "
const fs = require('fs'), path = require('path');
const SCRIPT_PATH = path.resolve('{台本DIR}/script.md');
const PROJECT_DIR = path.resolve('{MC_DIR}');
const HTML_PATH = path.join(PROJECT_DIR, 'index.html');
const OUT_PATH = path.join(PROJECT_DIR, 'scene_map.json');
const script = fs.readFileSync(SCRIPT_PATH, 'utf8');
const lines = script.split('\n');
const allDialogue = lines.filter(l => /^(ずんだもん|めたん)：/.test(l)).map(l => { const [name, ...rest] = l.split('：'); return { speaker: name, text: rest.join('：') }; });
const sceneMarkers = []; let dialogueIdx = 0, currentTitle = null, currentLines = [];
lines.forEach(l => {
  if (l.includes('`') && l.includes('SCENE:')) return;
  const sm = l.match(/<!-- SCENE: (.+?) -->/);
  if (sm) { if (currentTitle !== null) sceneMarkers.push({ title: currentTitle, lines: [...currentLines] }); currentTitle = sm[1]; currentLines = []; return; }
  if (/^(ずんだもん|めたん)：/.test(l)) { dialogueIdx++; currentLines.push(dialogueIdx); }
});
if (currentTitle !== null) sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });
const html = fs.readFileSync(HTML_PATH, 'utf8');
const htmlSceneCount = (html.match(/id=\"scene-\d+\"/g) || []).length;
function extractTitle(t) { if (t.includes('|')) return t.split('|').slice(1).join('|').trim(); const m = t.match(/[「](.+?)[」]/); return m ? m[1] : t; }
const scenes = sceneMarkers.map((s, i) => ({ id: i, title: extractTitle(s.title), lines: s.lines.map(ln => allDialogue[ln - 1]).filter(Boolean) }));
while (scenes.length < htmlSceneCount) { scenes.push({ id: scenes.length, title: 'エンディング', hold_sec: 3, lines: [] }); }
const map = { voicevox_url: 'http://localhost:50021', speakers: { 'ずんだもん': 3, 'めたん': 2 }, speed_scale: 1.14, inter_line_silence: 0.3, scene_end_padding: 0.5, scenes };
fs.writeFileSync(OUT_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log('scene_map: ' + scenes.length + ' scenes, ' + dialogueIdx + ' lines, HTML: ' + htmlSceneCount);
if (scenes.length !== htmlSceneCount) console.log('WARNING: mismatch!');
"
```

**確認**: 出力の `scene_map entries` と `HTML scenes` が一致すること

// turbo
2. **titleのビジュアルパターン名チェック**（SKILL.md「自動検証コマンド」参照）:
```powershell
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('{MC_DIR}/scene_map.json','utf8')); const bad=['タイトルカード','数値インパクト','フロー図','テキスト強調','比較対照','段階的リスト','引用カード','タイムライン','脳のSVG','まとめ3ポイント','エンディング']; let errors=0; d.scenes.forEach(s=>{const found=bad.filter(b=>s.title.startsWith(b)||s.title.includes('「')); if(found.length>0){console.log('❌ Scene '+s.id+': \"'+s.title+'\" ← パターン名混入: '+found.join(', ')); errors++;} else {console.log('✅ Scene '+s.id+': \"'+s.title+'\"');}}); if(errors>0){console.log('\n🚨 '+errors+'件のtitleを修正してください'); process.exit(1);} else {console.log('\n✅ 全titleが正常です');}"
```

> 🚨 **エラーがある場合**: scene_map.json の title を修正してから次のステップに進むこと。

// turbo
3. VOICEVOX辞書登録（英語・専門用語の読み間違え防止）:
```powershell
node presentation/tools/register_dict.js {project_id}
```

> 台本中の英語・専門用語を自動検出し、VOICEVOX のユーザー辞書に読みを登録する。
> プロジェクト固有の単語は `{MC_DIR}/.voicevox_dict.json` に追加可能。

// turbo
4. 音声生成を実行:
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

#### C1. 動画コピー（再エンコード）+ 字幕データ生成

// turbo
1. 動画ファイルを**ブラウザ互換H264で再エンコード**してコピー:
```powershell
ffmpeg -y -i "{MC_DIR}/final_output.mp4" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k "public/videos/{project_id}.mp4"
```

> ⚠️ **なぜ再エンコードが必要か**: 録画スクリプトが生成するmp4はブラウザ（特にFirefox/Remotion Studio）で再生できないH264プロファイルになることがある。`-movflags +faststart` と `-pix_fmt yuv420p` を指定することでブラウザ互換にする。単純な `Copy-Item` では `Code 3 - ConvertSampleToAVCC` エラーが発生する。

// turbo
2. 字幕タイミングデータを生成:
```powershell
node scripts/generate-subtitle-data.js "{MC_DIR}" {project_id}
```

**確認**: `src/projects/{project_id}/subtitleData.ts` が生成されたこと

#### C2. VideoWithSubtitles.tsx を作成

`src/projects/{project_id}/VideoWithSubtitles.tsx` を作成する。

**テンプレートは `.agents/workflows/create-video.md` の STEP 3 に記載。**

★変更箇所:
1. `staticFile('videos/{project_id}.mp4')` — project_id を実際の値に
2. `headerTitle` のデフォルト値 — テーマの日本語タイトルに
3. サイドバーの `★CATEGORY★` — テーマのカテゴリーラベル（英語大文字）
4. サイドバーの `★テーマタイトル★` — 動画の日本語タイトル

**テンプレートに含まれる機能:**
- スピーカースワップ方式の立ち絵（複数バリエーションローテーション）
- サイドバーオーバーレイ（テーマブランディング、進捗バー、チャプターリスト、話者インジケーター）
- チャプターリストのスライドアニメーション
- BGMループ再生 + 終了時フェードアウト

#### C2.5. Remotionプロジェクト推敲（必須）

VideoWithSubtitles.tsx を作成した後、Root.tsx登録に進む前に以下のチェックを**すべて**実施し、問題があれば修正すること。

**1. テンプレート準拠チェック**:
- [ ] 既存プロジェクト（例: `fake_news_spread`）と同じコンポーネント構成になっているか
- [ ] `MathLayout` の `videoMode` prop が設定されているか
- [ ] `Subtitle` コンポーネントに `speaker`, `text`, `speakerColor`, `appearFrame` が渡されているか
- [ ] `SpeakerSwapSprite` によるキャラクター立ち絵アニメーションが実装されているか
- [ ] `Audio` コンポーネントでBGMがループ再生 + フェードアウトされるか

**2. サイドバーUIチェック**:
- [ ] カテゴリーラベルがテーマに適した英語大文字（例: PSYCHOLOGY, NEUROSCIENCE）になっているか
- [ ] テーマタイトルが正しい日本語タイトルになっているか（台本のタイトルと一致）
- [ ] 進捗バーが `progressPercent` に連動しているか
- [ ] チャプターリストが `sceneList` から自動生成され、スライドアニメーションが付いているか
- [ ] 話者インジケーターが `currentSpeaker` に連動し、色が `speakerColor` と一致しているか

**3. subtitleData整合性チェック**:
- [ ] `SUBTITLE_DATA` の import パスが正しいか
- [ ] `TOTAL_FRAMES` が export されているか
- [ ] 動画ファイル名が `staticFile('videos/{project_id}.mp4')` と一致しているか
- [ ] BGMファイル名が `staticFile('bgm/Mineral.mp3')` と一致しているか
- [ ] `headerTitle` のデフォルト値がテーマの日本語タイトルになっているか

**4. 既存プロジェクトとの一貫性チェック**:
- [ ] `SIDEBAR_WIDTH` が `380` で他プロジェクトと統一されているか
- [ ] `BGM_VOLUME` が `0.05` で他プロジェクトと統一されているか
- [ ] `ANIM.swapFrames` が `10` で他プロジェクトと統一されているか
- [ ] キャラクター画像パス（`normal2.png`, `normal3.png`, `normal4.png`）が他プロジェクトと同じか

> 🚨 **全項目を確認してから C3 に進むこと。** レンダリング後に構成の問題が見つかると、再レンダリングが必要になり大幅な手戻りが発生する。

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

### Phase C 完了条件

- [ ] `src/projects/{project_id}/subtitleData.ts` が生成された
- [ ] `subtitleData.ts` のエクスポートが正しい形式（`SubtitleEntry` interface に `sceneId`, `sceneTitle`, `speakerColor`, `startFrame`, `durationFrames` が含まれる）
- [ ] `src/projects/{project_id}/VideoWithSubtitles.tsx` が作成された
- [ ] `VideoWithSubtitles.tsx` に以下の**必須要素**がすべて含まれている：
  - `MathLayout` コンポーネント（videoMode）
  - `Subtitle` コンポーネント
  - `SpeakerSwapSprite`（キャラクター立ち絵スワップ）
  - サイドバーオーバーレイ（テーマブランディング、進捗バー、チャプターリスト、話者インジケーター）
  - `Audio` コンポーネント（BGMループ再生 + フェードアウト）
- [ ] `public/bgm/Mineral.mp3` が存在する
- [ ] `src/Root.tsx` に Composition が登録された
- [ ] `npx tsc --noEmit` が正常終了した

> ⚠️ **レンダリングは自動実行しない。** Remotionのレンダリングは非常に時間がかかるため、ユーザーが自分の都合のいいタイミングで手動実行する。
> レンダリングコマンド（参考）:
> ```powershell
> npx remotion render {project_id}-video-subtitles output/{project_id}.mp4 --codec h264
> ```

---

# Phase D: 完成品整理

**作業ディレクトリ**: `d:\myfolder\動画生成\完成品`

### 前提条件
- Phase C が完了していること

### 完成品フォルダの構造

```
完成品/
└── {テーマ名}/
    ├── {テーマ名}.mp4       ← Remotionレンダリング済み動画（ユーザーが後でコピー）
    ├── 概要欄.md            ← YouTube概要欄テキスト
    ├── サムネイル.jpg        ← サムネイル画像（あれば）
    └── 台本.md              ← 完成台本
```

### 実行手順

#### D1. 完成品フォルダ作成

// turbo
1. フォルダを作成:
```powershell
New-Item -ItemType Directory -Force -Path "{完成品DIR}"
```

#### D2. 動画以外の成果物をコピー

// turbo
1. 台本をコピー:
```powershell
Copy-Item "{台本DIR}/script.md" "{完成品DIR}/台本.md"
```

// turbo
2. YouTube概要欄テキストをコピー:
```powershell
Copy-Item "{台本DIR}/description.md" "{完成品DIR}/概要欄.md"
```

3. サムネイル画像をコピー（存在する場合）:
```powershell
# サムネイル画像のパスはテーマによって異なるため、ユーザーに確認する
# 例: Copy-Item "path/to/thumbnail.jpg" "{完成品DIR}/サムネイル.jpg"
```

> ⚠️ **動画ファイルはユーザーがレンダリング完了後に手動でコピーする:**
> ```powershell
> Copy-Item "{REMOTION_DIR}/output/{project_id}.mp4" "{完成品DIR}/{テーマ名}.mp4"
> ```

### Phase D 完了条件

- [ ] `{完成品DIR}/` フォルダが存在する
- [ ] `{完成品DIR}/台本.md` が存在する
- [ ] `{完成品DIR}/概要欄.md` が存在する
- [ ] タイムスタンプ更新スクリプト（`/update-timestamps`）を実行し、概要欄のタイムスタンプが正確な値に書き換え済み
- [ ] サムネイル画像がある場合、`{完成品DIR}/サムネイル.jpg` としてコピー済み
- [ ] ユーザーへレンダリングコマンドと動画コピーコマンドを案内済み

---

## ✅ 最終完了報告

以下をユーザーに報告する:

1. **完成品フォルダ**: `完成品/{テーマ名}/`
   - `{テーマ名}.mp4` — レンダリング済み動画
   - `台本.md` — 完成台本
   - `概要欄.md` — YouTube概要欄テキスト
   - `サムネイル.jpg` — サムネイル画像（あれば）

2. **作業ファイルの保存場所**（参照用）
   - `台本作成/{テーマ名}/` — リサーチ結果・台本の作業ファイル
   - `main content/presentation/{project_id}/` — プレゼン・音声・中間動画
   - `Remotion/src/projects/{project_id}/` — Remotionプロジェクト

3. **YouTube投稿チェックリスト**
   - [ ] 動画をアップロード（`{テーマ名}.mp4`）
   - [ ] 概要欄をコピー＆ペースト（`概要欄.md`）
   - [ ] タイムスタンプは `update_timestamps.js` により自動設定済み（必要なら微調整）
   - [ ] サムネイルを設定

---

## 承認ゲートまとめ

パイプライン全体で**ユーザーの承認が必要な箇所はゼロ**。
テーマ入力から完成品フォルダ整理まで、すべて自動実行される。

---

## トラブルシューティング

| 問題 | フェーズ | 対処法 |
|------|---------|--------|
| **シーンと読み上げがズレる** | **B** | **B1.5のシーン対応検証スクリプトを実行。HTMLシーンと台本SCENEマーカーの1:1対応を修正。修正後はscene_map→音声→録画→合成の全再生成が必要** |
| **Remotionで動画再生エラー（Code 3）** | **C** | **C1でffmpegによる再エンコード（`-movflags +faststart -pix_fmt yuv420p`）を行う。`Copy-Item` での単純コピーは禁止** |
| VOICEVOXに接続できない | B | `http://localhost:50021` が応答するか確認。VOICEVOXを起動する |
| 録画が途中で止まる | B | チャンクファイルを確認し、壊れたものを削除して再実行 |
| 字幕がずれる | C | `generate-subtitle-data.js` を再実行 |
| 立ち絵が表示されない | C | `public/characters/` に画像があるか確認 |
| TypeScriptエラー | C | `subtitleData.ts` の型と `VideoWithSubtitles.tsx` のimportが一致するか確認 |
| Remotion Studioでプレビューできない | C | `npm run dev` が実行中か確認。ポート3000が使われている場合は別ポートを指定 |
| 完成品のmp4がない | D | `{REMOTION_DIR}/output/` にレンダリング済みファイルがあるか確認。なければレンダリングを実行する |
