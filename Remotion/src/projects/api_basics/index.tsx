import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { FadeIn } from '../../components/animation/FadeIn';
import { SlideIn } from '../../components/animation/SlideIn';
import { ScaleIn } from '../../components/animation/ScaleIn';
import { InfoCallout } from '../../components/ui/InfoCallout';
import { RelationDiagram } from '../../components/ui/RelationDiagram';

// ============================================================
// ユーティリティ関数（全動画共通・変更不要）
// ============================================================
function calcStartFrames(segments: { durationFrames: number }[]): number[] {
    let acc = 0;
    return segments.map((seg) => { const s = acc; acc += seg.durationFrames; return s; });
}

// ============================================================
// 型定義
// ============================================================
type ActionType =
    | { type: 'showTitle'; text: string }
    | { type: 'showListItem'; index: number; text: string }
    | { type: 'showCallout'; calloutType: 'info' | 'warning' | 'success'; text: string }
    | { type: 'none' };

type Segment = {
    speaker: string;
    text: string;
    speakerColor: string;
    durationFrames: number;
    action: ActionType | null;
};

// ============================================================
// シーン1: APIとは何か？（導入）
// ============================================================
const SCENE_1_SEGMENTS: Segment[] = [
    {
        speaker: 'ずんだもん',
        text: '今日はAPIについて解説するのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: { type: 'showTitle', text: 'API（エーピーアイ）とは？' },
    },
    {
        speaker: '四国めたん',
        text: 'APIとは「Application Programming Interface」の略よ。',
        speakerColor: '#d6336c',
        durationFrames: 999,
        action: { type: 'showListItem', index: 1, text: 'Application Programming Interface' },
    },
    {
        speaker: 'ずんだもん',
        text: '難しそうに聞こえるけど、簡単に言うと「アプリとアプリをつなぐ窓口」なのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: { type: 'showListItem', index: 2, text: 'アプリとアプリをつなぐ窓口' },
    },
    {
        speaker: '四国めたん',
        text: 'プログラム同士が情報をやり取りするための「約束事」ね。',
        speakerColor: '#d6336c',
        durationFrames: 999,
        action: { type: 'showCallout', calloutType: 'info', text: 'プログラム同士の会話のルール' },
    },
];

// ============================================================
// シーン2: レストランで例えると（アナロジー）
// ============================================================
const SCENE_2_SEGMENTS: Segment[] = [
    {
        speaker: 'ずんだもん',
        text: 'APIはレストランに例えると分かりやすいのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: null,
    },
    {
        speaker: '四国めたん',
        text: 'お客さんがウェイター（API）に注文すると、広房に伝えてくれるわよ。',
        speakerColor: '#d6336c',
        durationFrames: 999,
        action: null,
    },
    {
        speaker: 'ずんだもん',
        text: '広房（サーバー）が料理を作って、ウェイターが届けてくれるのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: null,
    },
    {
        speaker: '四国めたん',
        text: 'お客さんは広房に直接入る必要がないの。それがウェイター（API）の役割ね。',
        speakerColor: '#d6336c',
        durationFrames: 999,
        action: null,
    },
];

// ============================================================
// シーン3: APIのメリットまとめ
// ============================================================
const SCENE_3_SEGMENTS: Segment[] = [
    {
        speaker: 'ずんだもん',
        text: 'APIを使うとこんないいことがあるのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: null,
    },
    {
        speaker: '四国めたん',
        text: '1つ目は、複雑な処理を自分で作らなくていいこと！',
        speakerColor: '#d6336c',
        durationFrames: 999,
        action: { type: 'showListItem', index: 1, text: '複雑な処理を自分で作らなくていい' },
    },
    {
        speaker: 'ずんだもん',
        text: '2つ目は、開発スピードが格段に上がることなのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: { type: 'showListItem', index: 2, text: '開発スピードが格段に上がる' },
    },
    {
        speaker: '四国めたん',
        text: '3つ目は、外部の優れたサービスをすぐに使えること！',
        speakerColor: '#d6336c',
        durationFrames: 999,
        action: { type: 'showListItem', index: 3, text: '外部の優れたサービスをすぐ活用' },
    },
    {
        speaker: 'ずんだもん',
        text: 'APIを使いこなして、最高のアプリを作ろうなのだ！',
        speakerColor: '#22c55e',
        durationFrames: 999,
        action: { type: 'showCallout', calloutType: 'info', text: 'APIはプログラマーの最強の武器！' },
    },
];

// ============================================================
// 共通: セグメントのアクションをレンダリングするヘルパー
// ============================================================
function renderSegmentAction(
    seg: Segment,
    i: number,
    absoluteAppearFrame: number,
    localFrame: number,
    localStartFrame: number,
    options?: { itemColors?: string[]; emojiList?: string[] }
): React.ReactNode {
    if (localFrame < localStartFrame || !seg.action) return null;

    const { action } = seg;

    if (action.type === 'showListItem') {
        const colors = options?.itemColors ?? ['#0ea5e9', '#f59e0b', '#10b981', '#a855f7'];
        const emojis = options?.emojiList;
        const colorIndex = (action.index - 1) % colors.length;
        const color = colors[colorIndex];
        return (
            <SlideIn key={i} direction="up" appearFrame={absoluteAppearFrame}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {emojis ? (
                        <span style={{ fontSize: 36 }}>{emojis[(action.index - 1) % emojis.length]}</span>
                    ) : (
                        <span style={{
                            width: 56, height: 56, borderRadius: '50%',
                            backgroundColor: color, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, fontWeight: 'bold', flexShrink: 0,
                            boxShadow: `0 4px 14px ${color}66`,
                        }}>
                            {action.index}
                        </span>
                    )}
                    <span style={{
                        fontSize: 36, color: '#1e293b', fontWeight: 600,
                        ...(emojis ? { borderLeft: `4px solid ${color}`, paddingLeft: 20 } : {}),
                    }}>
                        {action.text}
                    </span>
                </div>
            </SlideIn>
        );
    }

    if (action.type === 'showCallout') {
        return (
            <FadeIn key={i} appearFrame={absoluteAppearFrame}>
                <InfoCallout type={action.calloutType} text={action.text} appearFrame={absoluteAppearFrame} />
            </FadeIn>
        );
    }

    return null;
}

// ============================================================
// シーン1コンポーネント（オフセット対応）
// ============================================================
const Scene1: React.FC<{ offset: number }> = ({ offset }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - offset;
    const startFrames = calcStartFrames(SCENE_1_SEGMENTS);
    const currentIndex = startFrames.reduce((acc, s, i) => localFrame >= s ? i : acc, 0);
    const current = SCENE_1_SEGMENTS[currentIndex];

    return (
        <MathLayout
            title="APIとは？"
            subtitle={
                <Subtitle
                    speaker={current.speaker}
                    text={current.text}
                    speakerColor={current.speakerColor}
                    appearFrame={startFrames[currentIndex] + offset}
                />
            }
        >
            {/* コンテンツを最大幅内で中央配置 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 1200 }}
            >

                {/* タイトルバナー */}
                {localFrame >= startFrames[0] && (
                    <ScaleIn appearFrame={startFrames[0] + offset} overshoot>
                        <div style={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                            borderRadius: 20,
                            padding: '28px 48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: 2 }}>
                                API（エーピーアイ）とは？
                            </span>
                        </div>
                    </ScaleIn>
                )}

                {SCENE_1_SEGMENTS.map((seg, i) =>
                    renderSegmentAction(
                        seg, i,
                        startFrames[i] + offset,
                        localFrame,
                        startFrames[i],
                        { itemColors: ['#0ea5e9', '#10b981'] }
                    )
                )}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン2コンポーネント: RelationDiagramによるレストランアナロジー
// ============================================================
const Scene2: React.FC<{ offset: number }> = ({ offset }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - offset;
    const startFrames = calcStartFrames(SCENE_2_SEGMENTS);
    const currentIndex = startFrames.reduce((acc, s, i) => localFrame >= s ? i : acc, 0);
    const current = SCENE_2_SEGMENTS[currentIndex];

    return (
        <MathLayout
            title="レストランで例えるとわかりやすい！"
            subtitle={
                <Subtitle
                    speaker={current.speaker}
                    text={current.text}
                    speakerColor={current.speakerColor}
                    appearFrame={startFrames[currentIndex] + offset}
                />
            }
        >
            {/* レストランの流れを関係図で表現。カードpadding分の幅を考慮したwidthを指定 */}
            <RelationDiagram
                appearFrame={offset}
                width={1160}
                nodes={[
                    {
                        id: 'customer',
                        label: 'お客さん',
                        sublabel: '(あなたのアプリ)',
                        icon: '👤',
                        color: '#0ea5e9',
                    },
                    {
                        id: 'waiter',
                        label: 'ウェイター',
                        sublabel: '(API)',
                        icon: '🧑‍🍳',
                        color: '#a855f7',
                    },
                    {
                        id: 'kitchen',
                        label: '広房',
                        sublabel: '(サーバー)',
                        icon: '🍳',
                        color: '#10b981',
                    },
                ]}
                edges={[
                    // 往路: 注文フロー（上側）
                    { from: 'customer', to: 'waiter', label: '注文する', color: '#0ea5e9' },
                    { from: 'waiter', to: 'kitchen', label: '伝える', color: '#a855f7' },
                    // 復路: 料理届ケフロー（下側）
                    { from: 'kitchen', to: 'waiter', label: '料理を渡す', color: '#10b981', returnPath: true },
                    { from: 'waiter', to: 'customer', label: '届ける', color: '#f59e0b', returnPath: true },
                ]}
            />
        </MathLayout>
    );
};

// ============================================================
// シーン3コンポーネント（オフセット対応）
// ============================================================
const Scene3: React.FC<{ offset: number }> = ({ offset }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - offset;
    const startFrames = calcStartFrames(SCENE_3_SEGMENTS);
    const currentIndex = startFrames.reduce((acc, s, i) => localFrame >= s ? i : acc, 0);
    const current = SCENE_3_SEGMENTS[currentIndex];

    return (
        <MathLayout
            title="APIを使う3つのメリット"
            subtitle={
                <Subtitle
                    speaker={current.speaker}
                    text={current.text}
                    speakerColor={current.speakerColor}
                    appearFrame={startFrames[currentIndex] + offset}
                />
            }
        >
            {/* コンテンツを最大幅内で中央配置 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', maxWidth: 1200 }}>
                {SCENE_3_SEGMENTS.map((seg, i) =>
                    renderSegmentAction(
                        seg, i,
                        startFrames[i] + offset,
                        localFrame,
                        startFrames[i],
                        { itemColors: ['#0ea5e9', '#f59e0b', '#10b981'] }
                    )
                )}
            </div>
        </MathLayout>
    );
};

// シーンの合計フレーム数（999 × セグメント数）
// Scene1: 3996, Scene2: 3996, Scene3: 4995, Total: 12987
const SCENE_1_TOTAL = SCENE_1_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);
const SCENE_2_TOTAL = SCENE_2_SEGMENTS.reduce((s, seg) => s + seg.durationFrames, 0);

// ============================================================
// メインエクスポート: シーンを連結する
// ============================================================
export const ApiBasics: React.FC = () => {
    const frame = useCurrentFrame();

    const scene1End = SCENE_1_TOTAL;
    const scene2End = scene1End + SCENE_2_TOTAL;

    return (
        <AbsoluteFill>
            {frame < scene1End && <Scene1 offset={0} />}
            {frame >= scene1End && frame < scene2End && <Scene2 offset={scene1End} />}
            {frame >= scene2End && <Scene3 offset={scene2End} />}
        </AbsoluteFill>
    );
};
