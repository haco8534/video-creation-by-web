# コンポーネントカタログ

エージェントはこのファイルに記載されたコンポーネントのみを使用してください。
ここにないコンポーネントを新規作成してはいけません。

---

## レイアウト（画面の大枠）

### `MathLayout`

グラスモーフィズムのメインレイアウト。右サイドバー・上部ヘッダー・下部フッター領域を持つ。

```tsx
import { MathLayout } from '../../components/layouts/MathLayout';

<MathLayout title="ヘッダーに表示するタイトル">
  {/* ここにメインコンテンツをFlexboxで配置する */}
  {children}
</MathLayout>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `title` | `string` | （省略可） | 画面上部のヘッダーに表示するタイトル |
| `children` | `ReactNode` | （必須） | メインコンテンツエリアに配置する要素 |

**⚠️ 注意**: `children` はFlexboxコンテナ内に自動的に配置される。`position: absolute` でchildrenを動かしてはいけない。

---

## アニメーションラッパー（出現アニメーション）

### `FadeIn`

子要素をフェードイン表示させる。

```tsx
import { FadeIn } from '../../components/animation/FadeIn';

<FadeIn appearFrame={startFrames[i]}>
  <div>フェードインするコンテンツ</div>
</FadeIn>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `appearFrame` | `number` | `0` | 出現させる絶対フレーム数（`startFrames[i]`を渡す） |
| `duration` | `number` | `15` | フェードインにかけるフレーム数 |
| `initialOpacity` | `number` | `0` | アニメーション開始時の透明度 |

---

### `SlideIn`

子要素を指定方向からスライドインさせる。最もよく使うアニメーション。

```tsx
import { SlideIn } from '../../components/animation/SlideIn';

<SlideIn direction="up" appearFrame={startFrames[i]}>
  <div>スライドインするコンテンツ</div>
</SlideIn>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `appearFrame` | `number` | `0` | 出現させる絶対フレーム数 |
| `direction` | `'up'\|'down'\|'left'\|'right'` | `'up'` | スライドの方向 |
| `distance` | `number` | `60` | スライドの移動距離（px） |
| `duration` | `number` | `20` | アニメーション時間（フレーム） |
| `fade` | `boolean` | `true` | スライドと同時にフェードインするか |

---

### `ScaleIn`

子要素をスケールアップで表示させる。タイトルや強調ポイントに効果的。

```tsx
import { ScaleIn } from '../../components/animation/ScaleIn';

<ScaleIn appearFrame={startFrames[i]} overshoot>
  <div>拡大表示するコンテンツ</div>
</ScaleIn>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `appearFrame` | `number` | `0` | 出現させる絶対フレーム数 |
| `duration` | `number` | `15` | アニメーション時間（フレーム） |
| `overshoot` | `boolean` | `false` | バウンスしてスケールイン |
| `initialScale` | `number` | `0` | 開始時のスケール値 |

---

## UIコンポーネント

### `Subtitle`

字幕バー。画面下部に固定表示される。**必ず `appearFrame` を渡すこと。**

```tsx
import { Subtitle } from '../../components/ui/Subtitle';

<Subtitle
  speaker={current.speaker}
  text={current.text}
  speakerColor={current.speakerColor}
  appearFrame={startFrames[currentIndex]}
/>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `speaker` | `string` | （必須） | 話者名（例: 'ずんだもん'） |
| `text` | `string` | （必須） | セリフテキスト |
| `speakerColor` | `string` | `'#d6336c'` | 話者名の色 |
| `appearFrame` | `number` | `0` | セグメント切り替わりのフレーム（必須） |

---

### `InfoCallout`

情報・警告・成功メッセージのボックス。

```tsx
import { InfoCallout } from '../../components/ui/InfoCallout';

<InfoCallout
  type="info"
  text="ここに補足情報を書く"
  appearFrame={startFrames[i]}
/>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `type` | `'info'\|'warning'\|'success'` | `'info'` | ボックスの種類（色とアイコンが変わる） |
| `text` | `string` | （必須） | 表示するテキスト |
| `appearFrame` | `number` | `0` | 出現させる絶対フレーム数 |

---

### `SpeechBubble`

吹き出し。キャラクターの近くに配置して使う。

```tsx
import { SpeechBubble } from '../../components/ui/SpeechBubble';

<SpeechBubble
  text="プログラムって面白いのだ！"
  direction="bottom"
  appearFrame={startFrames[i]}
/>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `text` | `string` | （必須） | 吹き出し内のテキスト |
| `direction` | `'left'\|'right'\|'top'\|'bottom'` | `'bottom'` | 尻尾の向き |
| `color` | `string` | `'white'` | 吹き出しの背景色 |
| `textColor` | `string` | `'#1f2937'` | テキストの色 |
| `appearFrame` | `number` | `0` | 出現させる絶対フレーム数 |

---

### `PlaceholderCharacter`

キャラクターの代替表示（立ち絵が用意されていない場合）。目がアニメーションする。

```tsx
import { PlaceholderCharacter } from '../../components/ui/PlaceholderCharacter';

<PlaceholderCharacter />
```

---

### `RelationDiagram`

ノード（ボックス）間を**アニメーションする矢印**で結んだ関係図。概念の流れ・構成要素の関係を説明するのに最適。

- ノードがスタガー付きでスケールイン
- 矢印が先端を引き伸ばしながら描かれる
- 往路（上側）・復路（下側）の双方向フローに対応
- ラベルは矢印の中ほどでフェードイン

```tsx
import { RelationDiagram } from '../../components/ui/RelationDiagram';

<RelationDiagram
  appearFrame={startFrames[i]}
  nodes={[
    { id: 'client', label: 'クライアント', sublabel: '(あなたのアプリ)', icon: '📱', color: '#0ea5e9' },
    { id: 'api',    label: 'API',          sublabel: '(仲介役)',          icon: '🔌', color: '#a855f7' },
    { id: 'server', label: 'サーバー',      sublabel: '(データベース)',    icon: '🖥️', color: '#10b981' },
  ]}
  edges={[
    // 往路（上側）
    { from: 'client', to: 'api',    label: 'リクエスト', color: '#0ea5e9' },
    { from: 'api',    to: 'server', label: '転送',       color: '#a855f7' },
    // 復路（下側）returnPath: true で中心より下に描画
    { from: 'server', to: 'api',    label: 'データ返却', color: '#10b981', returnPath: true },
    { from: 'api',    to: 'client', label: 'レスポンス', color: '#f59e0b', returnPath: true },
  ]}
/>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `nodes` | `DiagramNode[]` | （必須） | ノードの配列 |
| `edges` | `DiagramEdge[]` | （必須） | 矢印の配列 |
| `appearFrame` | `number` | `0` | アニメーション開始の絶対フレーム数 |
| `width` | `number` | `1380` | 描画エリア幅（MathLayoutのコンテンツ幅に合わせる） |

**DiagramNode のフィールド:**

| フィールド | 型 | デフォルト | 説明 |
|---|---|---|---|
| `id` | `string` | （必須） | edgeのfrom/toで参照する一意なID |
| `label` | `string` | （必須） | ノードのメインラベル |
| `sublabel` | `string` | （省略可） | ラベルの下の補足テキスト |
| `icon` | `string` | （省略可） | ノード上部に表示する絵文字 |
| `color` | `string` | `'#0ea5e9'` | ボーダーとラベルのカラー |

**DiagramEdge のフィールド:**

| フィールド | 型 | デフォルト | 説明 |
|---|---|---|---|
| `from` | `string` | （必須） | 始点ノードのID |
| `to` | `string` | （必須） | 終点ノードのID |
| `label` | `string` | （省略可） | 矢印に添えるラベル |
| `color` | `string` | `'#6366f1'` | 矢印とラベルのカラー |
| `returnPath` | `boolean` | `false` | `true`にすると中心線より下（復路）に描画 |

### `ComparisonTable`

2列の比較表。AとBの特徴を横並びで対比するのに最適。

```tsx
import { ComparisonTable } from '../../components/ui/ComparisonTable';

<ComparisonTable
  titleA="グラッドウェルの主張"
  titleB="エリクソン教授の実際の研究"
  itemsA={['1万時間やれば誰でもプロ', 'すべての分野に適用可能', '量が最重要']}
  itemsB={['1万時間は平均値に過ぎない', 'バイオリン専攻のみの研究', '質（意図的練習）が最重要']}
  appearFrame={startFrames[i]}
/>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `titleA` | `string` | （必須） | 左列のヘッダータイトル |
| `titleB` | `string` | （必須） | 右列のヘッダータイトル |
| `itemsA` | `string[]` | （必須） | 左列の項目リスト |
| `itemsB` | `string[]` | （必須） | 右列の項目リスト |
| `appearFrame` | `number` | `0` | 出現させる絶対フレーム数 |

---

### `FlowSteps`

ステップ間を矢印で結んだフロー図。プロセスや手順を説明するのに最適。

```tsx
import { FlowSteps } from '../../components/ui/FlowSteps';

<FlowSteps
  steps={['目標設定', '挑戦', 'フィードバック', '弱点克服']}
  startFrames={[startFrames[i], startFrames[i]+10, startFrames[i]+20, startFrames[i]+30]}
  frame={frame}
/>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `steps` | `string[]` | （必須） | ステップ名の配列 |
| `startFrames` | `number[]` | （必須） | 各ステップの出現フレーム配列 |
| `frame` | `number` | （必須） | 現在のフレーム（`useCurrentFrame()`の値） |

---

### `Card`

グラスモーフィズムのカード。コンテンツを視覚的にグルーピングするための汎用コンテナ。

```tsx
import { Card } from '../../components/ui/Card';

<Card bg="rgba(239, 68, 68, 0.08)" borderColor="rgba(239, 68, 68, 0.3)">
  <span style={{ fontSize: 32, fontWeight: 700, color: '#ef4444' }}>重要なポイント</span>
</Card>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `children` | `ReactNode` | （必須） | カード内に表示するコンテンツ |
| `padding` | `number\|string` | `32` | 内部余白 |
| `bg` | `string` | `'rgba(255,255,255,0.6)'` | 背景色 |
| `borderColor` | `string` | `'rgba(255,255,255,0.8)'` | ボーダー色 |

---

## タイポグラフィ

### `Text`

汎用テキスト。

```tsx
import { Text } from '../../components/typography/Text';

<Text size={36} weight="bold" color="#0f172a" appearFrame={startFrames[i]}>
  表示するテキスト
</Text>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `size` | `number\|string` | `32` | フォントサイズ（pxまたはrem等） |
| `weight` | `'normal'\|'bold'\|number` | `'normal'` | フォントウェイト |
| `color` | `string` | `'currentColor'` | テキストカラー |
| `align` | `'left'\|'center'\|'right'` | `'left'` | テキスト揃え |
| `appearFrame` | `number` | （省略時アニメなし） | 出現させる絶対フレーム数 |

---

### `Title`

大きな見出し。`Text` のラッパー。

```tsx
import { Title } from '../../components/typography/Title';

<Title level={1} color="#0f172a" appearFrame={0}>見出しテキスト</Title>
```

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `level` | `1\|2\|3` | `1` | 見出しレベル（1: 64px, 2: 48px, 3: 36px） |
| `color` | `string` | （省略可） | テキストカラー |
| `appearFrame` | `number` | （省略時アニメなし） | 出現させる絶対フレーム数 |

---

## キャラクター（話者）カラーコード

| キャラクター | speakerColor |
|---|---|
| ずんだもん | `#22c55e` |
| 四国めたん | `#d6336c` |

---

## コンテンツエリアで使えるスタイル値（推奨）

テキストやコンテンツが `MathLayout` 内に収まるためのガイドライン:

| 用途 | 推奨fontSize | 備考 |
|---|---|---|
| メイン見出し | 52〜64px | シーン内の大タイトル |
| サブタイトル | 36〜44px | 補足タイトル・説明見出し |
| 本文 | 28〜36px | 解説テキスト |
| 注釈・ラベル | 20〜24px | 補足情報 |
| リスト項目 | 32〜40px | ListItemのテキスト |

**コンテンツエリアの有効領域**: 幅 約1480px、高さ 約820px（Subtitle領域を除くと約700px）
