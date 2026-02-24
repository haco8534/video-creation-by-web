import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { SlideIn } from '../../components/general/SlideIn';
import { FadeIn } from '../../components/general/FadeIn';
import { Text } from '../../components/general/Text';
import { Card } from '../../components/general/Card';
import { InfoCallout } from '../../components/general/InfoCallout';
import { AnimatedList } from '../../components/general/AnimatedList';
import { ComparisonTable } from '../../components/general/ComparisonTable';
import { FlowSteps } from '../../components/general/FlowSteps';
import { AnimationEmbed } from '../../components/general/AnimationEmbed';

// ============================================================
// セグメント定義 — 台本をコードに落とし込む
// durationFrames: すべて999仮置き（プレビューで調整する）
// ============================================================

// --- シーン1: データとは ---
const SCENE1_SEGMENTS = [
    { speaker: 'ずんだもん', text: '「データ」ってよく聞くのだ。でも、データって結局なんなのだ？', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showTitle' } },
    { speaker: '四国めたん', text: 'データとは「記録された事実や数値」のことよ。現実の出来事を数字や文字にしたものね。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showCallout' } },
    { speaker: 'ずんだもん', text: '例えばどんなもの？', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showList1' } },
    { speaker: '四国めたん', text: '今日の気温、売上の金額、ユーザーの年齢…あらゆるものがデータになりうるわ。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showList2_3' } },
];

// --- シーン2: データの種類 ---
const SCENE2_SEGMENTS = [
    { speaker: '四国めたん', text: 'データには大きく分けて2種類あるわ。「数値データ」と「カテゴリデータ」ね。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showTable' } },
    { speaker: 'ずんだもん', text: '数値データはわかるのだ。1、2、3…みたいな？', speakerColor: '#22c55e', durationFrames: 999, action: null },
    { speaker: '四国めたん', text: 'そう。足し算・引き算ができる数のことよ。身長・体重・価格・気温などがこれにあたるわ。', speakerColor: '#d6336c', durationFrames: 999, action: null },
    { speaker: 'ずんだもん', text: 'カテゴリデータは？', speakerColor: '#22c55e', durationFrames: 999, action: null },
    { speaker: '四国めたん', text: '色・職業・都道府県など、ラベルやグループを表すデータよ。数として足し算はできないわ。', speakerColor: '#d6336c', durationFrames: 999, action: null },
];

// --- シーン3: 代表値 ---
const SCENE3_SEGMENTS = [
    { speaker: '四国めたん', text: 'データを理解するための基本が「代表値」よ。平均・中央値・最頻値の3つを覚えてね。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showTitle' } },
    { speaker: 'ずんだもん', text: '平均はわかるのだ！全部足して数で割るやつなのだ！', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showItem1' } },
    { speaker: '四国めたん', text: '正解！でも平均は外れ値に弱いわ。例えば億万長者が一人いると、平均年収が跳ね上がるのよ。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showWarning' } },
    { speaker: 'ずんだもん', text: '中央値はどういう意味なのだ？', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showItem2' } },
    { speaker: '四国めたん', text: 'データを順番に並べたときの真ん中の値よ。外れ値の影響を受けにくいわ。', speakerColor: '#d6336c', durationFrames: 999, action: null },
    { speaker: 'ずんだもん', text: '最頻値は？', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showItem3' } },
    { speaker: '四国めたん', text: '一番多く出てくる値のことよ。「最もよくある値」ね。', speakerColor: '#d6336c', durationFrames: 999, action: null },
];

// --- シーン4: Manimヒストグラム ---
const SCENE4_SEGMENTS = [
    { speaker: '四国めたん', text: '代表値だけじゃ不十分なことも多いわ。データの「分布」を見ることが大切よ。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showManim' } },
    { speaker: 'ずんだもん', text: 'なんか棒グラフみたいなのが出てきたのだ！', speakerColor: '#22c55e', durationFrames: 999, action: null },
    { speaker: '四国めたん', text: 'これがヒストグラム。横軸が値の範囲、縦軸が件数を表しているわ。', speakerColor: '#d6336c', durationFrames: 999, action: null },
    { speaker: 'ずんだもん', text: '真ん中あたりが多くて、両端が少ない！なんか山みたいなのだ！', speakerColor: '#22c55e', durationFrames: 999, action: null },
    { speaker: '四国めたん', text: '正規分布と呼ばれるパターンよ。自然界や社会で非常によく見られる形なの。', speakerColor: '#d6336c', durationFrames: 999, action: null },
];

// --- シーン5: フロー ---
const SCENE5_SEGMENTS = [
    { speaker: 'ずんだもん', text: 'プログラムではどうやってデータを使うのだ？', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showStep1' } },
    { speaker: '四国めたん', text: '大まかには「収集→整理→分析→可視化」の流れよ。これがデータ分析の基本サイクルね。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showAllSteps' } },
    { speaker: 'ずんだもん', text: '収集はAPIとか使うやつなのだ！', speakerColor: '#22c55e', durationFrames: 999, action: null },
    { speaker: '四国めたん', text: 'さすが！以前学んだAPIが活躍する場面よ。集めたデータをPandasなどで整理して分析するわ。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showPython' } },
    { speaker: 'ずんだもん', text: 'MatplotlibやSeabornで可視化するやつなのだ！', speakerColor: '#22c55e', durationFrames: 999, action: null },
    { speaker: '四国めたん', text: '完璧ね！この一連の流れを理解することが、データを扱う第一歩よ。', speakerColor: '#d6336c', durationFrames: 999, action: null },
];

// --- シーン6: まとめ ---
const SCENE6_SEGMENTS = [
    { speaker: '四国めたん', text: '今回のまとめよ。データとは記録された事実・数値のことね。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showItem1' } },
    { speaker: 'ずんだもん', text: '数値データとカテゴリデータの2種類があるのだ！', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showItem2' } },
    { speaker: '四国めたん', text: '平均・中央値・最頻値で代表値を計算できるわ。', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showItem3' } },
    { speaker: 'ずんだもん', text: 'ヒストグラムで分布が見えるのだ！', speakerColor: '#22c55e', durationFrames: 999, action: { type: 'showItem4' } },
    { speaker: '四国めたん', text: 'データ分析は収集→整理→分析→可視化の繰り返しよ。ぜひ実際に触ってみてね！', speakerColor: '#d6336c', durationFrames: 999, action: { type: 'showItem5' } },
];

// ============================================================
// ユーティリティ
// ============================================================
function calcStartFrames(segments: { durationFrames: number }[]): number[] {
    let acc = 0;
    return segments.map((seg) => { const s = acc; acc += seg.durationFrames; return s; });
}

function getCurrentIndex(frame: number, startFrames: number[]) {
    return startFrames.reduce((acc, s, i) => frame >= s ? i : acc, 0);
}

// シーンの合計フレーム数
const S1 = SCENE1_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);
const S2 = SCENE2_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);
const S3 = SCENE3_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);
const S4 = SCENE4_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);
const S5 = SCENE5_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);
const S6 = SCENE6_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);

// 各シーンのRemotionでの開始フレーム
const SCENE_OFFSETS = [0, S1, S1 + S2, S1 + S2 + S3, S1 + S2 + S3 + S4, S1 + S2 + S3 + S4 + S5];
export const TOTAL_FRAMES = S1 + S2 + S3 + S4 + S5 + S6;

// ============================================================
// シーン1: データとは？
// ============================================================
const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
    const startFrames = calcStartFrames(SCENE1_SEGMENTS);
    const ci = getCurrentIndex(frame, startFrames); // scene-local frame
    const current = SCENE1_SEGMENTS[ci];
    const listItems = [
        { text: '気温: 25℃' }, { text: '売上: 15,000円' }, { text: '年齢: 22歳' }
    ];
    const listStartFrames = [startFrames[2], startFrames[3], startFrames[3] + 20];

    return (
        <MathLayout title="データとは何か？" subtitle={
            <Subtitle speaker={current.speaker} text={current.text} speakerColor={current.speakerColor} appearFrame={startFrames[ci]} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36, width: '100%', maxWidth: 1100 }}>

                <ScaleIn appearFrame={0}>
                    <Text size={52} weight="bold" align="center" color="#1e293b">データの基礎</Text>
                </ScaleIn>

                {frame >= startFrames[1] && (
                    <FadeIn appearFrame={startFrames[1]} duration={15}>
                        <InfoCallout type="info" title="データとは" text="記録された事実や数値のこと。現実の出来事を数字や文字に変換したもの。" appearFrame={startFrames[1]} />
                    </FadeIn>
                )}

                {frame >= startFrames[2] && (
                    <Card padding={36}>
                        <Text size={30} weight="bold" color="#475569">身近なデータの例</Text>
                        <div style={{ marginTop: 24 }}>
                            <AnimatedList items={listItems} startFrames={listStartFrames} frame={frame} />
                        </div>
                    </Card>
                )}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン2: データの種類
// ============================================================
const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
    const startFrames = calcStartFrames(SCENE2_SEGMENTS);
    const ci = getCurrentIndex(frame, startFrames);
    const current = SCENE2_SEGMENTS[ci];

    return (
        <MathLayout title="データの2つの種類" subtitle={
            <Subtitle speaker={current.speaker} text={current.text} speakerColor={current.speakerColor} appearFrame={startFrames[ci]} />
        }>
            <div style={{ width: '100%', maxWidth: 1100 }}>
                {frame >= startFrames[0] && (
                    <ComparisonTable
                        titleA="数値データ"
                        titleB="カテゴリデータ"
                        itemsA={['身長・体重', '価格・売上', '気温・湿度', '→ 計算できる']}
                        itemsB={['色・職業', '都道府県・国名', 'カテゴリ・ラベル', '→ 計算できない']}
                        appearFrame={startFrames[0]}
                    />
                )}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン3: 代表値
// ============================================================
const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
    const startFrames = calcStartFrames(SCENE3_SEGMENTS);
    const ci = getCurrentIndex(frame, startFrames);
    const current = SCENE3_SEGMENTS[ci];

    return (
        <MathLayout title="データを要約する3つの指標" subtitle={
            <Subtitle speaker={current.speaker} text={current.text} speakerColor={current.speakerColor} appearFrame={startFrames[ci]} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', maxWidth: 1100 }}>
                <ScaleIn appearFrame={startFrames[0]}>
                    <Text size={42} weight="bold" align="center" color="#1e293b">3つの代表値</Text>
                </ScaleIn>

                {frame >= startFrames[1] && (
                    <SlideIn direction="up" appearFrame={startFrames[1]}>
                        <Card padding={28} bg="rgba(59,130,246,0.08)" borderColor="rgba(59,130,246,0.3)">
                            <Text size={32} weight="bold" color="#1d4ed8">① 平均（Mean）</Text>
                            <Text size={28} color="#334155">すべての値を足して、個数で割った値</Text>
                        </Card>
                    </SlideIn>
                )}

                {frame >= startFrames[2] && (
                    <FadeIn appearFrame={startFrames[2]}>
                        <InfoCallout type="warning" title="注意：外れ値の影響" text="億万長者が1人いると平均年収が大きく跳ね上がる。平均は外れ値に弱い！" appearFrame={startFrames[2]} />
                    </FadeIn>
                )}

                {frame >= startFrames[3] && (
                    <SlideIn direction="up" appearFrame={startFrames[3]}>
                        <Card padding={28} bg="rgba(16,185,129,0.08)" borderColor="rgba(16,185,129,0.3)">
                            <Text size={32} weight="bold" color="#059669">② 中央値（Median）</Text>
                            <Text size={28} color="#334155">データを順に並べたときの真ん中の値。外れ値に強い。</Text>
                        </Card>
                    </SlideIn>
                )}

                {frame >= startFrames[5] && (
                    <SlideIn direction="up" appearFrame={startFrames[5]}>
                        <Card padding={28} bg="rgba(168,85,247,0.08)" borderColor="rgba(168,85,247,0.3)">
                            <Text size={32} weight="bold" color="#7c3aed">③ 最頻値（Mode）</Text>
                            <Text size={28} color="#334155">データの中で最も多く出てくる値。</Text>
                        </Card>
                    </SlideIn>
                )}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン4: Manimヒストグラム
// ============================================================
const Scene4: React.FC<{ frame: number; sceneOffset: number }> = ({ frame, sceneOffset }) => {
    const startFrames = calcStartFrames(SCENE4_SEGMENTS);
    const ci = getCurrentIndex(frame, startFrames);
    const current = SCENE4_SEGMENTS[ci];

    return (
        <MathLayout title="データの分布を見てみよう" subtitle={
            <Subtitle speaker={current.speaker} text={current.text} speakerColor={current.speakerColor} appearFrame={startFrames[ci]} />
        }>
            <div style={{ display: 'flex', gap: 40, alignItems: 'stretch', width: '100%', height: '100%', maxWidth: 1200 }}>
                <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <SlideIn direction="up" appearFrame={startFrames[0]}>
                        <Text size={30} weight="bold" color="#475569">ヒストグラム</Text>
                        <div style={{ marginTop: 16 }} />
                        <Text size={25} color="#64748b">
                            {'• '}横軸: 値の範囲{'\n'}
                            {'• '}縦軸: 件数（人数）{'\n\n'}
                            {'• '}正規分布: 中央が高く{'\n'}
                            {'  '}両端が低い山型{'\n\n'}
                            {'• '}赤線が平均値{'\n'}
                            {'• '}黄色の曲線が{'\n'}
                            {'  '}分布の形を表す
                        </Text>
                    </SlideIn>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                    <AnimationEmbed
                        src={staticFile('animations/data_basics/HistogramScene.mp4')}
                        startFrame={sceneOffset + startFrames[0]}
                        flex={1}
                        style={{ maxHeight: '100%' }}
                        borderRadius={20}
                    />
                </div>
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン5: データ分析フロー
// ============================================================
const Scene5: React.FC<{ frame: number }> = ({ frame }) => {
    const startFrames = calcStartFrames(SCENE5_SEGMENTS);
    const ci = getCurrentIndex(frame, startFrames);
    const current = SCENE5_SEGMENTS[ci];

    const steps = ['収集', '整理', '分析', '可視化'];
    const stepStartFrames = [
        startFrames[0],
        startFrames[1],
        startFrames[1] + 30,
        startFrames[1] + 60,
    ];

    return (
        <MathLayout title="プログラムでデータを扱う" subtitle={
            <Subtitle speaker={current.speaker} text={current.text} speakerColor={current.speakerColor} appearFrame={startFrames[ci]} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48, width: '100%', maxWidth: 1100 }}>
                <FlowSteps steps={steps} startFrames={stepStartFrames} frame={frame} />

                {frame >= startFrames[3] && (
                    <FadeIn appearFrame={startFrames[3]} duration={15}>
                        <InfoCallout type="success" title="定番のPythonライブラリ" text="収集: requests / API ｜ 整理: Pandas ｜ 分析: NumPy / SciPy ｜ 可視化: Matplotlib / Seaborn" appearFrame={startFrames[3]} />
                    </FadeIn>
                )}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン6: まとめ
// ============================================================
const Scene6: React.FC<{ frame: number }> = ({ frame }) => {
    const startFrames = calcStartFrames(SCENE6_SEGMENTS);
    const ci = getCurrentIndex(frame, startFrames);
    const current = SCENE6_SEGMENTS[ci];

    const summaryItems = [
        { text: 'データ = 記録された事実・数値' },
        { text: '数値データ vs カテゴリデータ' },
        { text: '代表値: 平均・中央値・最頻値' },
        { text: 'ヒストグラムで分布を可視化' },
        { text: '分析サイクル: 収集→整理→分析→可視化' },
    ];
    const listStartFrames = startFrames.slice(0, 5);

    return (
        <MathLayout title="まとめ" subtitle={
            <Subtitle speaker={current.speaker} text={current.text} speakerColor={current.speakerColor} appearFrame={startFrames[ci]} />
        }>
            <Card padding={52}>
                <AnimatedList items={summaryItems} startFrames={listStartFrames} frame={frame} />
            </Card>
        </MathLayout>
    );
};

// ============================================================
// メインエクスポート: シーンを連結する
// ============================================================
export const DataBasicsVideo: React.FC = () => {
    const frame = useCurrentFrame();

    // どのシーンを表示するか
    const sceneIndex = SCENE_OFFSETS.reduce((acc, offset, i) => frame >= offset ? i : acc, 0);

    // 各シーンに渡すローカルフレーム（シーン内の相対フレーム）
    const localFrame = frame - SCENE_OFFSETS[sceneIndex];

    return (
        <AbsoluteFill>
            {sceneIndex === 0 && <Scene1 frame={localFrame} />}
            {sceneIndex === 1 && <Scene2 frame={localFrame} />}
            {sceneIndex === 2 && <Scene3 frame={localFrame} />}
            {sceneIndex === 3 && <Scene4 frame={localFrame} sceneOffset={SCENE_OFFSETS[3]} />}
            {sceneIndex === 4 && <Scene5 frame={localFrame} />}
            {sceneIndex === 5 && <Scene6 frame={localFrame} />}
        </AbsoluteFill>
    );
};

// ============================================================
// 簡易アニメーションヘルパー
// ============================================================
const ScaleIn: React.FC<{ children: React.ReactNode; appearFrame?: number }> = ({ children, appearFrame = 0 }) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame - appearFrame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const scale = interpolate(frame - appearFrame, [0, 15], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ opacity: progress, transform: `scale(${scale})`, width: '100%' }}>{children}</div>;
};
