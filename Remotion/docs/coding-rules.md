# コーディングルール

このプロジェクトでRemotionのコードを書く際の必須ルールと禁止事項。
**エージェントはこのルールを必ず守ること。**

---

## 基本原則

> **「LLMはコンポーネントの組み合わせと台本データの記述だけを行う。アニメーションの実装・位置計算はコンポーネント内部に閉じている。」**

---

## ✅ やっていいこと（安全ゾーン）

### コンポーネントの組み合わせ

`component-catalog.md` に記載されたコンポーネントを組み合わせてJSXを組み立てることは自由に行ってよい。

```tsx
// ✅ 良い例: 既存コンポーネントを組み合わせる
<MathLayout title="APIとは">
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <SlideIn direction="up" appearFrame={startFrames[0]}>
      <Text size={36} weight="bold">API = アプリケーションとサービスの橋渡し</Text>
    </SlideIn>
    <FadeIn appearFrame={startFrames[1]}>
      <InfoCallout type="info" text="APIを使えば複雑な処理をお任せできる" appearFrame={startFrames[1]} />
    </FadeIn>
  </div>
</MathLayout>
```

### Flexboxによるレイアウト

要素の並び方は `display: 'flex'` と関連プロパティのみで制御する。

```tsx
// ✅ 良い例: Flexboxで横並びにする
<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 40 }}>
  <PlaceholderCharacter />
  <SpeechBubble text="こんにちは！" direction="left" appearFrame={startFrames[i]} />
</div>
```

### テキスト・色・サイズのスタイル値

`fontSize`, `color`, `fontWeight`, `gap`, `padding`, `borderRadius` などは自由に設定してよい。

```tsx
// ✅ 良い例
<span style={{ fontSize: 36, color: '#0ea5e9', fontWeight: 700 }}>ここを強調</span>
```

### SEGMENTS配列の定義

台本データの記述は自由に行ってよい。

```tsx
// ✅ 良い例
const SCENE_1_SEGMENTS = [
  { speaker: 'ずんだもん', text: 'APIはとても便利なのだ！', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showListItem', index: 1, text: '複雑な処理をお任せ' } },
];
```

---

## ❌ やってはいけないこと（禁止ゾーン）

### 禁止1: `position: absolute` の使用

絶対座標による配置は絶対に行ってはいけない。フレームのサイズや文字量によって必ずズレる。

```tsx
// ❌ 悪い例: 絶対座標での配置
<div style={{ position: 'absolute', top: 200, left: 400 }}>テキスト</div>

// ✅ 代替: Flexboxで配置する
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>テキスト</div>
```

### 禁止2: `interpolate()` の直接実装

アニメーションの計算を自分で書いてはいけない。必ずFadeIn/SlideIn/ScaleInラッパーを使う。

```tsx
// ❌ 悪い例: interpolateを直接書く
const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
<div style={{ opacity }}>コンテンツ</div>

// ✅ 代替: FadeInコンポーネントを使う
<FadeIn appearFrame={startFrames[i]}>
  <div>コンテンツ</div>
</FadeIn>
```

### 禁止3: `spring()` の直接使用

スプリングアニメーションの計算も同様に禁止。

```tsx
// ❌ 悪い例
const progress = spring({ frame, fps, config: { damping: 200 } });
```

### 禁止4: `durationFrames` に具体的な数値を入れる

音声の長さは実際に生成してみないと分からない。すべて `999` を仮置きにすること。

```tsx
// ❌ 悪い例: 根拠のない数値を入れる
{ durationFrames: 87 }

// ✅ 正しい例: 仮置きにする
{ durationFrames: 999 }
```

### 禁止5: 新しいコンポーネントをゼロから設計する

`component-catalog.md` にないコンポーネントを新規作成してはいけない。
既存コンポーネントを組み合わせることで表現する。

```tsx
// ❌ 悪い例: 新しいカスタムコンポーネントを作る
const MySpecialCard: React.FC = () => { ... }; // 作ってはいけない

// ✅ 代替: InfoCallout や SlideIn + Text を組み合わせる
```

### 禁止6: `useCurrentFrame()` をアニメーション計算に使用する

`useCurrentFrame()` は「どのセグメントが今表示中か」の判定にだけ使ってよい。
アニメーションの計算（opacityの増減など）に直接使ってはいけない。

```tsx
// ❌ 悪い例
const frame = useCurrentFrame();
const opacity = frame > 30 ? 1 : frame / 30; // 計算してはいけない

// ✅ 良い例: 判定にだけ使う
const currentIndex = startFrames.reduce((acc, s, i) => frame >= s ? i : acc, 0);
```

---

## 必須パターン（コピーして使う定型コード）

### セグメントの開始フレームを計算する関数（変更不要）

```tsx
function calcStartFrames(segments: { durationFrames: number }[]): number[] {
  let acc = 0;
  return segments.map((seg) => { const s = acc; acc += seg.durationFrames; return s; });
}
const startFrames = calcStartFrames(SEGMENTS);
```

### 現在のセグメントを特定する式（変更不要）

```tsx
const frame = useCurrentFrame();
const currentIndex = startFrames.reduce((acc, s, i) => frame >= s ? i : acc, 0);
const current = SEGMENTS[currentIndex];
```

### 要素を時間になったら追加するパターン（変更不要）

```tsx
{SEGMENTS.map((seg, i) => {
  if (frame < startFrames[i] || !seg.action) return null;
  // ここにaction.typeに応じたコンポーネントを置く
  return (
    <SlideIn key={i} direction="up" appearFrame={startFrames[i]}>
      {/* コンポーネント */}
    </SlideIn>
  );
})}
```

---

## チェックリスト（コード完成後に確認する）

- [ ] `position: absolute` を自分で書いていないか
- [ ] `interpolate()` を直接書いていないか
- [ ] 全ての `appearFrame` に `startFrames[i]` を渡しているか
- [ ] `Subtitle` の `appearFrame` に `startFrames[currentIndex]` を渡しているか
- [ ] `durationFrames` がすべて `999` になっているか（またはプレビューで調整済みか）
- [ ] `component-catalog.md` にないコンポーネントを使っていないか
