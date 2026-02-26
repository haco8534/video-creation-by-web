---
name: presentation_generator
description: 台本から高品質なWebアニメーション・スライド説明資料（HTML/CSS/JS）を生成し、音声付き動画として出力する
---

# プレゼンテーション用アニメーションWebページ生成 → 動画化スキル

あなたは与えられた台本やテーマをもとに、**解説動画のコンテンツ部分として使用できる、高品質なアニメーションWebページ（HTML/CSS/JS）をフルスクラッチで生成**し、**音声付きの動画ファイル（mp4）として出力**するまでを一貫して行います。

---

## 🎯 プロジェクトの最終目的

- この成果物は、**YouTube等の「キャラクター同士の対話型解説動画（例: ずんだもん解説など）」で、キャラクターの横や背景に表示されるメインコンテンツ**として録画・使用されます。
- 概念の「説明」は、台本を読み上げるキャラクターの音声が担います。スライドの役割は「説明する」ことではなく、**視聴者の理解を視覚的に助け、映像として見続けたいと思わせること**です。

---

## 📝 利用方法（インプット例）

```
【テーマ名】llm_text_generation

【台本】
（ここに解説動画の台本テキストを貼り付け）
```

台本の形式（会話形式・箇条書きなど）は問いません。

---

## 🔁 全体ワークフロー（概要）

以下の Phase 1〜3 を **この順序で** 実行してください。

| Phase | 内容 | 成果物 |
|-------|------|--------|
| **Phase 1** | Webプレゼンテーション生成 | `index.html`, `style.css`, `script.js` |
| **Phase 2** | 音声生成 | `scene_map.json`, `audio/*.wav`, `scene_durations.json` |
| **Phase 3** | 録画 + 音声合成 | `recording.mp4`, `final_output.mp4` |

---

# Phase 1：Webプレゼンテーション生成

## 🎞️ シーン分割の粒度

- **会話の展開や説明のフェーズが変わるごとに**こまめにシーン（スライド）を切り替えてください。
- （例：1つのトピックの中でも、「問題提起」「図解ステップ1」「図解ステップ2」「結論」など）
- 台本全体をただ数個の「大見出し」レベルでまとめた数シーンだけにしないでください。
- **オープニング・まとめ等の「会話のみのセクション」を省略しないこと。** 技術説明ブロックだけでなく、動画冒頭の前座的な会話や締めの会話にも必ずシーンを作成してください。会話のみのシーンでは、キーワードや名言を大きく表示しつつ、背景アニメーションで画面を彩ってください。

## 📏 コード量の最低ライン（絶対守ること）

以下は **最低ライン** であり、これを下回るプロジェクトは品質不足として再生成が必要になる。目標はこの数値を **超える** ことである。

| ファイル | 最低行数 | 推奨行数 | 補足 |
|----------|----------|----------|------|
| **index.html** | **650行** | **700〜800行** | 各シーン平均25〜30行。カスタムSVG・カスタムビジュアルを含む |
| **style.css** | **1100行** | **1200〜1400行** | パターンカタログ + カスタムビジュアル + マイクロアニメーション |
| **script.js** | **90行** | **90〜100行** | シーン管理 + Canvas背景アニメーション |

> ⚠️ **最低ラインを下回る主な原因は「パターンカタログの組み合わせだけで構成してしまう」こと。** パターンカタログは骨格に過ぎず、各シーンにはカスタムSVG図解やテーマ固有のビジュアルコンポーネントを追加する必要がある（後述の「カスタムビジュアルの必須作成」セクション参照）。

| 尺 | シーン数目安 | HTML最低行数 |
|----|-------------|-------------|
| 10分 | 15〜20 | 450行 |
| 15分 | 20〜28 | 600行 |
| 20分 | 28〜35 | 700行 |

## 🎨 デザインと演出のルール

### フォント（必須）
- **Google Fonts の Noto Sans JP を必ず使用すること。** `<head>` に以下を追加：
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet">
  ```
  CSSでは `font-family: 'Noto Sans JP', sans-serif;` を指定する。

### シーン制御
- 縦スクロールではなく、1画面を占有するスライド形式で構築してください。
- シーンの進行・戻る操作は**キー操作（矢印キー等）のみ**とし、画面上にはボタンや操作ヒントのUIを一切配置しないでください（録画時の不要な映り込みを避けるため）。
- **必ず `window.goTo(index)` という固定名のグローバル関数**を実装・公開してください（録画スクリプトがこの名前で呼び出します）。

### テキストは「ラベル・キーワード」のみ
- スライドに「説明文」を書かないでください。**概念の説明は音声ナレーションが行います。**
- スライドに載せるテキストは、**シーンのタイトル・キーワード・短いラベル**に限定してください。
- 文字は大きく、少なく。遠くから見ても一瞬で読めるサイズにしてください。
- 絵文字は使用しないでください。

### アニメーションで「説明する」
- テキストの代わりに、**アニメーション自体が概念を説明するように設計**してください。
- 例：トークン化なら文字列が分割されるアニメーション、Attentionなら単語間に光の線が伸びるアニメーション。
- 「図解＋動き」で直感的に理解できるシーンを目指してください。

### テーマとトーン
- デフォルトは**クリーンで洗練されたホワイトテーマ（明るい背景）**。
- モダンでリッチなデザイン（美しいグラデーション、滑らかなシャドウなど）を取り入れること。

---

## 🧩 ビジュアルパターンカタログ（必須参照）

各シーンは、台本の内容に応じて以下のビジュアルパターンから選択・組み合わせて構築する。パターンは台本の `<!-- SCENE: ビジュアルパターン「タイトル」 -->` マーカーで指定されることが多いが、指定がない場合は内容に最適なパターンを自分で選択する。

### カラートークン設計

プロジェクトのテーマに合わせて `:root` にカラートークンを定義する。以下は典型例：

```css
:root {
    --bg: #f8f9fa;
    --text: #1a1a2e;
    --text-light: #6c757d;
    --primary: #4f46e5;       /* テーマに応じて変更 */
    --primary-light: #e0e7ff;
    --teal: #14b8a6;
    --teal-light: #ccfbf1;
    --coral: #ef4444;
    --coral-light: #fee2e2;
    --amber: #f59e0b;
    --amber-light: #fef3c7;
    --card-bg: #ffffff;
    --shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.1);
    --radius: 16px;
    --radius-sm: 8px;
    --transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### パターン一覧と必須構成要素

#### 1. タイトルカード（セクション見出し）
Canvas背景アニメーション付きの大見出し。ブロックの頭やテーマ転換時に使用。

```html
<div class="scene" id="scene-N">
    <canvas id="canvas-N" class="bg-canvas"></canvas>
    <div class="content center-layout">
        <div class="section-badge accent-bg-primary">TOPIC 1</div>
        <h2 class="title-medium">見出しテキスト<br><span class="accent-primary">強調部分</span></h2>
    </div>
</div>
```

#### 2. テキスト強調
大きなキーワードやメッセージを画面中央に表示。

```html
<div class="scene" id="scene-N">
    <canvas id="canvas-N" class="bg-canvas"></canvas>
    <div class="content center-layout">
        <div class="emphasis-text stagger-item">前半テキスト<span class="accent-primary">強調ワード</span></div>
        <div class="emphasis-text-large stagger-item">でも<span class="accent-coral">……</span></div>
        <div class="emphasis-sub stagger-item">補足テキスト</div>
    </div>
</div>
```

#### 3. 数値インパクト
大きな数字で印象を与える。出典バッジ必須。

```html
<div class="scene" id="scene-N">
    <div class="content center-layout">
        <h2 class="scene-title">シーンタイトル</h2>
        <div class="source-badge stagger-item">出典情報（著者名・年・対象者数）</div>
        <div class="impact-number stagger-item">
            <span class="big-num accent-primary">42</span><span class="num-unit">%</span>
        </div>
        <div class="emphasis-sub stagger-item">数値の意味を簡潔に</div>
    </div>
</div>
```

#### 4. 段階的リスト（ナンバーリスト）
3〜4項目のリスト。カード型でナンバー付き。

```html
<div class="scene" id="scene-N">
    <div class="content card-layout">
        <h2 class="scene-title">リストタイトル</h2>
        <div class="numbered-list">
            <div class="numbered-item stagger-item">
                <div class="number-circle">1</div>
                <div class="numbered-text">項目テキスト<span class="accent-primary">強調</span></div>
            </div>
            <!-- 2, 3... -->
        </div>
    </div>
</div>
```

#### 5. 比較対照（VS カード）
2つの概念を左右に並べて比較。

```html
<div class="scene" id="scene-N">
    <div class="content center-layout">
        <h2 class="scene-title">比較タイトル</h2>
        <div class="vs-container">
            <div class="vs-card vs-left stagger-item">
                <div class="vs-badge safe-badge">ラベル</div>
                <div class="vs-title">左タイトル</div>
                <div class="vs-desc">説明</div>
            </div>
            <div class="vs-divider stagger-item">vs</div>
            <div class="vs-card vs-right stagger-item">
                <div class="vs-badge danger-badge">ラベル</div>
                <div class="vs-title">右タイトル</div>
                <div class="vs-desc">説明</div>
            </div>
        </div>
    </div>
</div>
```

#### 6. 横並びカード（3〜4列）
栄養素、要因、原因など複数の並列項目。

```html
<div class="scene" id="scene-N">
    <div class="content card-layout">
        <h2 class="scene-title">カードタイトル</h2>
        <div class="triple-card">
            <div class="factor-card stagger-item">
                <div class="factor-icon accent-bg-primary">A</div>
                <div class="factor-name">項目名</div>
                <div class="factor-desc">短い説明</div>
            </div>
            <!-- 繰り返し -->
        </div>
    </div>
</div>
```

#### 7. 引用カード
研究論文や著名人の引用。左ボーダー付き。

```html
<div class="scene" id="scene-N">
    <div class="content center-layout">
        <h2 class="scene-title">引用シーンタイトル</h2>
        <div class="quote-card stagger-item">
            <div class="quote-mark">"</div>
            <div class="quote-text">引用テキスト<br><span class="accent-primary">強調部分</span></div>
            <div class="quote-source">出典（著者名, 年, 所属）</div>
        </div>
    </div>
</div>
```
- 警告的な引用: `quote-card quote-warning`（赤ボーダー）
- 温かい引用: `quote-card quote-warm`（アンバーボーダー）

#### 8. フロー図（チェーン）
歴史的変遷やプロセスの流れ。

```html
<div class="scene" id="scene-N">
    <div class="content card-layout">
        <h2 class="scene-title">フロータイトル</h2>
        <div class="flow-chain">
            <div class="flow-node stagger-item">
                <div class="flow-year">1905</div>
                <div class="flow-text"><span class="flow-name">人名</span><br>説明<br><span class="flow-sub">補足</span></div>
            </div>
            <div class="flow-arrow stagger-item">&rarr;</div>
            <!-- 繰り返し -->
        </div>
    </div>
</div>
```

#### 9. 比較テーブル
グリッド形式のデータ比較。

```html
<div class="scene" id="scene-N">
    <div class="content card-layout">
        <h2 class="scene-title">テーブルタイトル</h2>
        <div class="comparison-table">
            <div class="comp-row comp-header stagger-item">
                <div class="comp-cell">列1</div>
                <div class="comp-cell">列2</div>
                <div class="comp-cell">列3</div>
            </div>
            <div class="comp-row stagger-item">
                <div class="comp-cell comp-name">行名</div>
                <div class="comp-cell"><span class="accent-primary">値</span></div>
                <div class="comp-cell">値</div>
            </div>
        </div>
    </div>
</div>
```

#### 10. 注意喚起カード
左に赤いボーダー、アイコン付き。

```html
<div class="scene" id="scene-N">
    <div class="content center-layout">
        <div class="alert-card stagger-item">
            <div class="alert-icon">!</div>
            <div class="alert-title">警告タイトル<span class="accent-coral">強調</span></div>
            <div class="alert-sub">補足説明</div>
        </div>
    </div>
</div>
```

#### 11. SVGグラフ・チャート
データの視覚化。散布図、U字型カーブ、推移グラフなどを内容に応じて作成。

```html
<!-- リング進捗 -->
<div class="split-ring">
    <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" class="ring-bg" />
        <circle cx="60" cy="60" r="54" class="ring-fill ring-iq" style="--percent:25" />
    </svg>
    <div class="ring-center-label"><span class="accent-primary">25%</span></div>
</div>

<!-- バー比較 -->
<div class="bar-comparison">
    <div class="bar-row">
        <div class="bar-label">ラベルA</div>
        <div class="bar-track"><div class="bar-fill bar-a-fill" style="--w:33%"></div></div>
    </div>
    <div class="bar-row">
        <div class="bar-label">ラベルB</div>
        <div class="bar-track"><div class="bar-fill bar-b-fill" style="--w:66%"></div></div>
    </div>
</div>
```

#### 12. タグクラウド
複数のキーワードをカラフルなタグで表示。

```html
<div class="tag-cloud">
    <div class="tag-item tag-amber stagger-item">キーワード1</div>
    <div class="tag-item tag-teal stagger-item">キーワード2</div>
    <div class="tag-item tag-coral stagger-item">キーワード3</div>
</div>
```

#### 13. ダークシーン（暗い歴史・注意喚起など）
背景を暗くして特別感を出す。

```html
<div class="scene dark-scene" id="scene-N">
    <div class="content card-layout">
        <h2 class="scene-title light-text">ダークテーマタイトル</h2>
        <div class="dark-list">
            <div class="dark-item stagger-item">
                <div class="dark-icon">年号</div>
                <div class="dark-content">
                    <div class="dark-title">項目タイトル</div>
                    <div class="dark-desc">説明文</div>
                </div>
            </div>
        </div>
    </div>
</div>
```

#### 14. 数式・公式

```html
<div class="formula-container stagger-item">
    <div class="formula-part">要素A</div>
    <div class="formula-op">&times;</div>
    <div class="formula-part">要素B</div>
    <div class="formula-eq">=</div>
    <div class="formula-result">結果</div>
</div>
```

---

## 🎬 アニメーション設計（必須）

### stagger-item（段階的フェードイン）

**全てのシーン内の主要要素に `stagger-item` クラスを付与すること。** これにより、シーン表示時に要素が順番に下からフェードインし、動きのあるプレゼンテーションになる。

```css
.stagger-item {
    opacity: 0; transform: translateY(24px);
    transition: opacity var(--transition), transform var(--transition);
}
.scene.active .stagger-item { opacity: 1; transform: translateY(0); }
.scene.active .stagger-item:nth-child(1) { transition-delay: 0.0s; }
.scene.active .stagger-item:nth-child(2) { transition-delay: 0.12s; }
.scene.active .stagger-item:nth-child(3) { transition-delay: 0.24s; }
/* ... nth-child(N) で 0.12s ずつ追加 ... */
```

> ⚠️ `.stagger-item` のないシーンは「静止画スライド」になり品質が大幅に下がる。必ず付与すること。

### Canvas 背景アニメーション

タイトルカードやテキスト強調シーンなど、情報が少ないシーンには **Canvas パーティクル背景** を必ず追加する。

```html
<canvas id="canvas-N" class="bg-canvas"></canvas>
```

script.js で `initCanvasIfNeeded(sceneIdx)` 関数を実装し、パーティクルが浮遊して接続線で結ばれるアンビエントアニメーションを描画する。

```javascript
function initCanvasIfNeeded(sceneIdx) {
    const sceneEl = scenes[sceneIdx];
    const canvas = sceneEl.querySelector('.bg-canvas');
    if (!canvas || canvasAnimations[sceneIdx]) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#4f46e5', '#6366f1', '#f59e0b', '#14b8a6'];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.25 + 0.05,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
        });
        // 接続線
        ctx.globalAlpha = 0.03;
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                if (Math.sqrt(dx*dx + dy*dy) < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
        canvasAnimations[sceneIdx] = requestAnimationFrame(draw);
    }
    draw();
}
```

### SVGアニメーション

SVGのパス描画アニメーションを活用：

```css
/* パス描画アニメーション */
.trend-line {
    stroke-dasharray: 500; stroke-dashoffset: 500;
    animation: drawLine 2s ease forwards 0.5s;
}
@keyframes drawLine { to { stroke-dashoffset: 0; } }

/* 散布図ドット出現 */
.scatter-dot {
    fill: var(--primary); opacity: 0;
    animation: dotAppear 0.3s ease forwards;
    animation-delay: calc(var(--d) * 0.08s);
}
@keyframes dotAppear { to { opacity: 0.7; } }
```

### バーチャートのアニメーション

```css
.bar-fill {
    height: 100%; border-radius: 12px;
    width: 0; transition: width 1.5s ease;
}
.scene.active .bar-fill { width: var(--w); }
```

---

## 🏗️ 情報密度の確保（最重要）

> ⚠️ **情報密度の不足は品質不足の最大原因。** パターンカタログのテンプレートをそのまま使うだけでは情報密度が不足する。各シーンに「層」を重ねて密度を確保すること。

### 各シーンの多層情報構造（必須）

すべてのシーンは最低でも **4つの情報層** で構成すること：

| 層 | 必須度 | 例 |
|---|---|---|
| **①シーンタイトル** | 必須 | `<h2 class="scene-title">` |
| **②メインビジュアル** | 必須 | カード、SVG図解、比較表、カスタムビジュアル |
| **③出典・根拠** | データ引用時必須 | `<div class="source-badge">著者名 (年) / 誌名</div>` |
| **④補足テキスト** | 必須 | `<div class="emphasis-sub">` + `<div class="footnote">` の**両方** |

> タイトルカードやテキスト強調シーンでも、`title-sub`（サブタイトル）を追加して情報層を増やすこと。

### 「情報密度が低い」パターンと対策

| ❌ 低密度パターン | ✅ 改善方法 |
|---|---|
| テキスト1行だけのシーン | テキスト強調 + 出典バッジ + 背景Canvas + `comparison-note` |
| 数値だけのシーン | 数値 + 出典バッジ + **カスタムSVGリングやバー** + emphasis-sub + footnote |
| リスト3項目だけのシーン | リスト + 各項目に `text-sub` 説明文 + source-badge + footnote |
| フロー2ノードだけのシーン | フロー3-4ノード + 詳細テキスト + footnote |
| VSカードだけのシーン | VSカード + source-badge + `comparison-note` + `vs-detail`テキスト |
| 引用カードだけのシーン | 引用カード + **カスタムビジュアル（実験図等）** + emphasis-sub |

---

## 🎨 カスタムビジュアルの必須作成

> ⚠️ **パターンカタログだけでは情報量もアニメーションも不足する。** 各プロジェクトで最低 **4〜6個のカスタムビジュアルコンポーネント** をテーマに合わせて新規作成すること。

### カスタムビジュアルとは

パターンカタログ（タイトルカード、段階的リスト等）に含まれない、**テーマ固有の視覚要素**。以下は過去プロジェクトで作成したカスタムビジュアルの例：

| テーマ | カスタムビジュアル | 内容 |
|--------|-------------------|------|
| ドーパミン | `experiment-visual` | 実験セットアップ図（ラット→レバー→脳）をカードで表現 |
| ドーパミン | `dopamine-visual` + カスタムSVG | リングチャート2つでドーパミン0% vs 快楽反応100%を視覚化 |
| ドーパミン | `hotspot-visual` + 脳SVG | 脳のシルエット内にパルスアニメーション付きホットスポットを表示 |
| ドーパミン | `rpe-visual` + カスタムSVG | 報酬予測誤差の3段階を色分けした箱＋スパイク矢印で表現 |
| ドーパミン | `addiction-stages` | 依存の3段階をWanting/Likingバーチャートで可視化 |
| ドーパミン | `slot-visual` / `sns-visual` | スロットリール＋SNS通知のミニアニメーション |
| ドーパミン | `nearmiss-visual` | ニアミスリール（7, 7, 6）をアニメーション付きで表示 |
| ドーパミン | `hijack-visual` + SVG | 報酬系→前頭前野のハイジャック図 |
| ドーパミン | `detox-compare` | 誤解 vs 事実の対比カード |
| IQ | `g-factor-visual` + SVG | g因子を中心にした放射状ダイアグラム |
| IQ | `correlation-visual` + SVG散布図 | 散布図ドット出現アニメーション + トレンドライン描画 |
| IQ | `split-visual` + SVGリング | 25/75%のリングチャート + 凡例 |
| IQ | `flynn-visual` | 1950年→現代のIQ変化をカード対比で表現 |
| IQ | `decline-visual` + SVGパス | U字カーブをパス描画アニメーションで表示 |

### カスタムビジュアル作成のルール

1. **各プロジェクトで最低4個以上** のカスタムビジュアルを作成すること
2. カスタムビジュアルには**SVG**を積極的に使うこと（リングチャート、散布図、フロー図、脳の模式図など）
3. カスタムビジュアルのSVGには**アニメーション**を付けること（`stroke-dashoffset`によるパス描画、`opacity`フェードイン、`r`属性アニメーション等）
4. 既存の引用カードやVSカードの**内部に**カスタムビジュアルを埋め込んでもよい（パターンの組み合わせ）
5. カスタムビジュアル用のCSS（`.xxx-visual`等）を `style.css` に追加し、行数を増やすこと

---

## 🎭 マイクロアニメーション（必須）

> ⚠️ **stagger-itemとCanvas背景だけではアニメーションが「しょぼい」と感じる。** 各プロジェクトで最低 **3種類のマイクロアニメーション** を追加すること。

マイクロアニメーションとは、小さな要素に付ける微細な動きで、画面に「生きている感」を与えるもの。以下は過去プロジェクトで使用したマイクロアニメーション例：

```css
/* パルスドット: 脳のホットスポットや重要ポイントが脈動する */
@keyframes pulseDot {
    0%, 100% { r: 4; opacity: 0.5; }
    50% { r: 8; opacity: 1; }
}
.pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
.pulse-dot-delay { animation: pulseDot 2s ease-in-out infinite 0.5s; }

/* パルスリング: VS比較のWanting側アイコンが脈動する */
@keyframes pulseRing {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

/* スロットリール: 数字が上下に微動する */
@keyframes slotSpin {
    0% { transform: translateY(-2px); }
    100% { transform: translateY(2px); }
}
.slot-reel { animation: slotSpin 0.5s ease-in-out infinite alternate; }

/* 通知バッジ: 赤いドットが脈動する */
@keyframes notifPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
}

/* リール振動: ニアミスリールが横に揺れる */
@keyframes reelShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}
```

### マイクロアニメーションの使い所

| 場面 | アニメーション例 |
|------|------------------|
| 重要な数値・ポイント | パルスドット、グロー効果 |
| VS比較のアイコン | パルスリング |
| スロット・ギャンブル | スロットリール微動 |
| 通知・SNS | 通知バッジ脈動 |
| 警告・注意喚起 | 振動（シェイク） |
| SVGグラフ | パス描画（`stroke-dashoffset`）、ドット出現 |
| バーチャート | `width: 0 → var(--w)` のトランジション |

---

## 🎬 レイアウト方針

### 「パワーポイント」のように情報を整理する

このスライドは「映像作品」ではなく、**パワポのように情報が整理・構造化されたスライド資料**です。ただし、通常のパワポと違うのは、**図解やダイアグラムがアニメーションで動く**という点です。

#### レイアウトの設計原則
- **明確な見出しとセクション区切り** 
- **カード・ボックスで情報をグルーピング**
- **色分けでカテゴリを表現**（例：ポジティブ＝ティール系、ネガティブ＝コーラル系）
- **矢印・コネクタでフローを明示**
- **余白を十分に取る**

---

## ⚠️ CSS設計の注意点（Headless録画対策）

以下はPuppeteer headlessモードでの録画時の問題を防止するルールです：

1. **opacity: 0 → visibleパターンの注意**: あるシーンで `opacity: 0` → `.visible` クラスで表示するパターンを使った場合、**別シーンで同じCSS classのHTML要素を再利用しているときは、必ずCSSオーバーライドで表示状態にすること**。
   ```css
   /* 例: Scene 7のtoken-blockはopacity: 0 + .visible で制御するが、
      Scene 8のtoken-id-card内でも再利用されている場合 */
   .token-id-card .token-block {
       opacity: 1;
       transform: translateY(0) scale(1);
   }
   ```

2. **全CSSクラスが定義されていること**: HTMLで参照しているCSSクラス（`.label--amber`, `.title-huge` 等）が必ず `style.css` に定義されていること。

3. **CSS zoom互換のサイズ指定（必須）**: 録画時は `document.body.style.zoom` でコンテンツを拡大するため、**`.scene` のサイズには `100vw` / `100vh` を絶対に使わず、`width: 100%; height: 100%` を使うこと**。`vw`/`vh` はズーム前のビューポートサイズを参照するため、zoom適用時にコンテンツが画面外にはみ出し、右下にずれる。
   ```css
   /* ❌ NG: zoom適用時にコンテンツが右下にずれる */
   .scene { width: 100vw; height: 100vh; }

   /* ✅ OK: zoom適用時も正しく中央配置される */
   html, body { width: 100%; height: 100%; }
   .scene { width: 100%; height: 100%; }
   ```

4. **シーン切替時のフェードインアニメーション（必須）**: `.scene.active` にフェードインアニメーションを必ず適用すること。これにより、録画時のシーン切替が滑らかになる。
   ```css
   .scene.active {
       display: flex;
       align-items: center;
       justify-content: center;
       animation: sceneFadeIn 0.5s ease both;
   }
   @keyframes sceneFadeIn {
       from { opacity: 0; }
       to   { opacity: 1; }
   }
   ```
   > ⚠️ フェードイン時間は `scene_durations` の持続時間**内**で再生される。録画スクリプトはトランジション分の追加フレームを加算しないため、アニメーション時間を長くしすぎるとコンテンツ表示時間が減る。0.5s程度が推奨。

## 💻 出力先とディレクトリ構成

```
presentation/
└── {テーマ名}/        ← テーマ名は英語スネークケース
     ├── index.html
     ├── style.css
     └── script.js
```

- ファイルは必ず上記3ファイルに分割してください。

## ⛔ 禁止事項

- **ファイルを生成した後にブラウザで開いて確認する行為は行わないでください。** 確認はユーザー自身が行います。

## 生成手順

### 一括生成モード（デフォルト）

台本が与えられたら、**ユーザーとの対話なしで3ファイルを一括生成**する。

#### Step 1：構造を設計する（内部処理、ユーザーに提示不要）

台本全体を読み、以下を内部で決定する：

1. **ブロック分割**: 台本をどのようなブロックに分けるか
2. **各ブロックのシーン構成**: 各ブロックで何シーン作るか、使用するビジュアルパターン
3. **デザイントークン**: 全体のカラーパレット・トーン

> ⚠️ **オープニング・まとめ等の「会話のみのセクション」を省略しないこと。**

#### Step 2：3ファイルを一括生成する

上記の設計に基づき、`index.html`、`style.css`、`script.js` の3ファイルを**一度に全て生成**する。

生成時の品質チェックリスト：
- [ ] HTML 行数が**最低ライン**（尺に応じた行数）を満たしているか
- [ ] CSS 行数が **1100行以上** あるか（カスタムビジュアル + マイクロアニメーション分）
- [ ] 全てのシーンの主要要素に `.stagger-item` が付与されているか
- [ ] タイトルカードやテキスト強調シーンに Canvas 背景 (`<canvas>`) が含まれているか
- [ ] 出典が必要なデータシーンに `.source-badge` が含まれているか
- [ ] 数値シーンに `.impact-number` + `.big-num` が使われているか
- [ ] 比較シーンに `.vs-container` が使われているか
- [ ] **カスタムSVG図解が4個以上** 含まれているか（パターンカタログ外のビジュアル）
- [ ] **マイクロアニメーション（`@keyframes`）が3種類以上** 定義されているか（stagger/sceneFadeIn/drawLine以外）
- [ ] 各シーンが **4つの情報層**（タイトル + ビジュアル + 出典/根拠 + 補足）を持っているか
- [ ] `window.goTo(index)` がすべてのシーンに正しく対応しているか
- [ ] CSS zoom 互換のサイズ指定（`vw`/`vh` 不使用）を守っているか
- [ ] `.scene.active` にフェードインアニメーションが適用されているか
- [ ] Google Fonts（Noto Sans JP）が `<head>` で読み込まれているか

---

# Phase 2：音声生成（VOICEVOX）

## 前提条件
- VOICEVOX がローカルで起動していること（デフォルト: `http://localhost:50021`）
- `ffmpeg` がPATHに通っていること
- `puppeteer` がインストール済みであること（プロジェクトルートの `node_modules`）

## Step 3：`scene_map.json` を作成する

台本のセリフをシーンに対応付けた `scene_map.json` を作成する。**これは Phase 2〜3 の全工程の入力データ**であり、正確に作成する必要がある。

### ⚠️ 最重要ルール：HTMLシーンとの1:1対応

scene_map.json の各エントリは、HTML内の `.scene` 要素と **完全に1:1で対応** しなければならない。

- `scene_map.json` の `id: N` は、HTML内で **N番目（0-indexed）** に出現する `.scene` 要素に対応する
- **scene_map のエントリ数 = HTML の `.scene` 要素の数** でなければならない
- 台本の `<!-- SCENE: ... -->` マーカーの下にあるセリフは、**対応するHTMLシーンと同じIDの scene_map エントリの `lines` に入れる**

**❌ よくある間違い（絶対にやってはいけない）:**

```
❌ 間違い: HTMLにタイトルシーンがある場合に、scene_mapでhold_sec付きの
   無音シーンを「追加」し、台本セリフをScene 1以降に入れる
   → セリフと映像が全体的に1シーンずつズレる
```

**✅ 正しいやり方:**

```
✅ 台本の <!-- SCENE: タイトルカード --> の下にセリフがあるなら、
   そのセリフはScene 0のlinesに入れる（HTMLのScene 0 = タイトルビジュアル）
   → 「タイトルが表示されながら最初のセリフが読まれる」のが正しい動作
```

> `hold_sec` を使うのは、HTMLに **セリフがないシーン**（エンディング画面など）が存在する場合のみ。台本にセリフがあるシーンには `hold_sec` を使わないこと。

### scene_map.json のフォーマット

```json
{
  "voicevox_url": "http://localhost:50021",
  "speakers": {
    "ずんだもん": 3,
    "めたん": 2
  },
  "speed_scale": 1.15,
  "inter_line_silence": 0.3,
  "scene_end_padding": 0.5,
  "scenes": [
    {
      "id": 0, "title": "タイトル", "hold_sec": 0,
      "lines": [
        { "speaker": "めたん", "text": "最初のセリフ..." },
        { "speaker": "ずんだもん", "text": "次のセリフ..." }
      ]
    },
    {
      "id": 1, "title": "衝撃の事実", "hold_sec": 0,
      "lines": [
        { "speaker": "めたん", "text": "セリフ内容..." },
        { "speaker": "ずんだもん", "text": "セリフ内容..." }
      ]
    }
  ]
}
```

### 作成ルール

| フィールド | 説明 |
|-----------|------|
| `id` | シーンのインデックス（0-indexed、HTML内の `.scene` の出現順） |
| `title` | シーンの**コンテンツタイトル**（チャプター表示・ログ表示用）。下記「titleの決め方」を参照 |
| `hold_sec` | **セリフがない**シーンの表示固定時間（秒）。セリフありのシーンは必ず `0`。台本にセリフがあるのに `hold_sec` を設定してはならない |
| `lines` | そのシーンで読み上げるセリフの配列（順序 = 読み上げ順） |
| `lines[].speaker` | `speakers` で定義した話者名 |
| `lines[].text` | 読み上げテキスト。括弧「」や記号を過度に含めない |
| `speed_scale` | 読み上げ速度（1.0 = 等速、1.15 = 普通の動画向け推奨値） |
| `inter_line_silence` | セリフ間の無音秒数（0.3推奨） |
| `scene_end_padding` | シーン末尾パディング秒数（0.5推奨） |

### ⚠️ `title` の決め方（重要）

台本のSCENEマーカーは以下の形式になっている：

```
<!-- SCENE: ビジュアルパターン「コンテンツタイトル」 -->
```

`title` フィールドには、**「コンテンツタイトル」の部分（括弧内の文字列）**を使うこと。**ビジュアルパターン名（タイトルカード・段階的リスト・数値インパクト等）は `title` に入れてはならない。** ビジュアルパターンはHTML/CSSのレイアウト種類を指定するものであり、シーンの内容を表すものではない。

**❌ よくある間違い:**

```
台本: <!-- SCENE: タイトルカード「マシュマロ実験の真実」 -->
❌ "title": "タイトルカード"   ← ビジュアルパターン名を入れてしまっている
```

**✅ 正しい例:**

```
台本: <!-- SCENE: タイトルカード「マシュマロ実験の真実」 -->
✅ "title": "マシュマロ実験の真実"   ← コンテンツタイトルを入れる

台本: <!-- SCENE: 数値インパクト「SAT 210点の差」 -->
✅ "title": "SAT 210点の差"

台本: <!-- SCENE: 比較対照「通説 vs 実際の研究」 -->
✅ "title": "通説 vs 実際の研究"
```

この `title` はRemotionのサイドバーのチャプター名や字幕データの `sceneTitle` として最終出力まで伝播するため、正確に設定すること。

### 作成後の検証手順（必須）

scene_map.json を作成したら、以下を **必ず** 確認すること：

1. **エントリ数の一致**: `scene_map.json` のシーン数と、HTMLの `.scene` 要素の数が一致するか
2. **先頭シーンの確認**: Scene 0 の `lines` に台本の最初のセリフが入っているか（無音の `hold_sec` だけになっていないか）
3. **末尾シーンの確認**: 最後のシーンのセリフがHTMLの最後のシーンのビジュアルと意味的に対応しているか
4. **IDの連続性**: `id` が 0 から連番で抜けがないか

> ⚠️ **`.scene` クラスだけでなく `class="scene dark-scene"` など複合クラスのシーンも含めてカウントすること。**  正規表現で `class="scene"` を完全一致検索すると、`class="scene dark-scene"` が漏れる。Python の場合は `re.findall(r'id="scene-\d+"', html)` でIDをカウントするのが最も正確。

### テキスト前処理のポイント

台本からセリフを抽出する際、以下の変換を行うこと：

1. **記号の読み替え**: `(x, y, z)` → `エックス、ワイ、ゼット` のように、VOICEVOXが正しく発音できる表記にする
2. **括弧の除去**: かぎ括弧「」は発音されないので、使わないか最小限にする
3. **英語の読み替え**: `BPE` → `ビーピーイー`、`Word Embedding` → `ワードエンベディング` のように
4. **セリフの分割**: あまりに長い1セリフは自然な切れ目で2つに分割する
5. **話者の指定**: `speakers` のキー名と `lines[].speaker` が完全一致すること

## Step 4：音声を生成する

// turbo

```bash
node presentation/tools/generate_audio.js {テーマ名}
```

**このコマンドが行うこと:**
1. `scene_map.json` を読み込む
2. 各セリフをVOICEVOX APIで音声合成 → `audio/scene_XX_YY.wav` として保存
3. 各シーンの合計表示秒数を計算 → `scene_durations.json` を自動生成

**注意:** 
- 既存の `.wav` ファイルはスキップされる（再生成したい場合は `audio/` ディレクトリを削除する）
- コマンドが完了したら `scene_durations.json` が生成されたことを確認する

---

# Phase 3：録画 + 音声合成

## Step 5：並列録画を実行する

// turbo

```bash
node presentation/tools/record.js {テーマ名} 4 1920x1080
```

**引数:**
- `{テーマ名}`: プロジェクトディレクトリ名
- `4`: 並列ワーカー数（CPUコア数に合わせて調整）
- `1920x1080`: 録画解像度
- *(省略可)* 4番目の引数: CSS zoom倍率（デフォルト: `1.5`）

> **CSS zoom について:** プレゼンテーションのコンテンツは `max-width` と余白付きで中央配置されているため、1920x1080をそのまま録画するとコンテンツが小さく見える。CSS zoom を適用することで、アスペクト比を維持したまま映像内のコンテンツを拡大し、余白を減らせる。デフォルト値 `1.5` は Remotion の MathLayout に埋め込んだ際に最適なバランスになるよう調整されている。

**このコマンドが行うこと:**
1. `scene_durations.json` を読み込む
2. シーンをワーカー数で分割し、並列で Puppeteer スクリーンキャスト録画
3. 各チャンクを `chunks/chunk_XX.mkv` に保存
4. ffmpeg で全チャンクを結合 → `recording.mp4` を出力

**並列録画の技術的注意点:**
- 各チャンクの先頭でシーンの初期化のため、対象シーンに1.5秒滞在 → 前シーンに1.5秒滞在 という事前ウォームアップを行う
- チャンクからmp4への結合時は `libx264` で再エンコードする（mkv→mp4変換）
- ffmpegの完了待ちタイムアウトは120秒。killせず自然終了を待つ
- `browser.close()` は5秒タイムアウト付き。ハングした場合はプロセスを強制kill

**完了確認:**
- `recording.mp4` が生成されたことを確認
- **映像の長さが `scene_durations.json` の合計秒数にほぼ一致すること**を以下で確認する：

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 "presentation/{テーマ名}/recording.mp4"
```

映像が大幅に短い場合（例: 期待17分なのに9分しかない）、チャンクファイルの破損を疑う。`chunks/` 内の各 `.mkv` ファイルを個別に `ffprobe` で確認し、壊れたチャンクがあれば削除して `record.js` を再実行する。

## Step 6：音声+映像を合成する

// turbo

```bash
node presentation/tools/merge_audio.js {テーマ名}
```

**このコマンドが行うこと:**
1. `scene_durations.json` と `audio/scene_XX_YY.wav` を読み込む
2. 各シーンのセリフ音声をセリフ間の無音で繋いで1シーン分の音声にする
3. 音声が場面の尺より短い場合は無音でパディング、長い場合はトリムする
4. 全シーンの音声を結合 → `audio/full_audio.wav`
5. `recording.mp4` と `full_audio.wav` を合成 → `final_output.mp4` を出力

## Step 7：最終確認

`final_output.mp4` をユーザーに案内する。

---

## 📂 最終ディレクトリ構成

```
presentation/
├── tools/
│   ├── generate_audio.js   # 音声生成スクリプト
│   ├── record.js           # 画面録画スクリプト（並列対応）
│   └── merge_audio.js      # 音声+映像合成スクリプト
└── {テーマ名}/
    ├── index.html           # プレゼンテーション本体
    ├── style.css            # スタイルシート
    ├── script.js            # アニメーション・制御JS
    ├── scene_map.json       # 台本→シーン対応マップ（自分で作成）
    ├── scene_durations.json # シーン表示秒数（generate_audio.jsが自動生成）
    ├── audio/               # 生成された音声ファイル群
    │   ├── scene_00_00.wav  # Scene0, Line0
    │   ├── scene_01_00.wav  # Scene1, Line0
    │   └── full_audio.wav   # 全体結合音声
    ├── chunks/              # 録画チャンク（一時ファイル）
    │   ├── chunk_00.mkv
    │   └── chunk_01.mkv
    ├── recording.mp4        # 無音映像
    └── final_output.mp4     # ★最終出力（映像+音声）
```

---

## 🐛 既知の問題と対処法

| 問題 | 原因 | 対処法 |
|------|------|--------|
| 特定シーンの要素が録画で非表示 | CSSの `opacity: 0` が別シーンでオーバーライドされていない | 該当要素のCSSに `.parent .child { opacity: 1; }` を追加 |
| 録画映像が期待より短い | チャンクファイルのffmpegが正常終了していない | 各チャンクを `ffprobe` で確認し、壊れたチャンクを削除して再録画 |
| `browser.close()` でハング | Puppeteer headlessのバグ | record.js は5秒タイムアウト+強制kill済み。通常は自動回復 |
| `moov atom not found` エラー | mp4形式でffmpegをkillした | チャンクはmkv形式で出力済み。通常は発生しない |
| 音声の長さとシーンがずれる | `scene_map.json` のシーンIDが HTML のシーン順と不一致 | IDが0-indexedでHTML内の `.scene` の出現順と一致しているか確認 |
| シーンカウントが合わない | `class="scene dark-scene"` が正規表現でマッチしない | IDベースでカウントする: `re.findall(r'id="scene-\d+"', html)` |
