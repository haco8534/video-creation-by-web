import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { Text } from '../../components/general/Text';
import { Card } from '../../components/general/Card';
import { AnimationEmbed } from '../../components/general/AnimationEmbed';

// ============================================================
// デモ台本 — Manim埋め込みシーンを追加
// ============================================================
const SEGMENTS = [
    {
        speaker: 'ずんだもん',
        text: 'コンポーネント紹介に加えて、Manimアニメーションも説明するのだ！',
        speakerColor: '#22c55e',
        durationFrames: 120,
        action: { type: 'showTitle' },
    },
    {
        speaker: '四国めたん',
        text: 'Reactで難しいリッチなグラフは、Manimで生成して埋め込めるわ。',
        speakerColor: '#d6336c',
        durationFrames: 120,
        action: { type: 'showInfo' },
    },
    {
        speaker: 'ずんだもん',
        text: '正弦波のグラフが動くのだ！めちゃくちゃわかりやすいのだ！',
        speakerColor: '#22c55e',
        durationFrames: 240, // Manimアニメーション（約8秒）
        action: { type: 'showManimEmbed' },
    },
    {
        speaker: '四国めたん',
        text: 'このように、テキスト解説とリッチアニメーションを同じ画面内に共存できるわ。',
        speakerColor: '#d6336c',
        durationFrames: 130,
        action: { type: 'showSummary' },
    },
];

function calcStartFrames(segments: { durationFrames: number }[]): number[] {
    let acc = 0;
    return segments.map((seg) => { const s = acc; acc += seg.durationFrames; return s; });
}

export const ComponentShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const startFrames = calcStartFrames(SEGMENTS);
    const currentIndex = startFrames.reduce((acc, s, i) => frame >= s ? i : acc, 0);
    const current = SEGMENTS[currentIndex];

    // Manimシーンが始まるフレーム
    const manimStartFrame = startFrames[2];

    return (
        <AbsoluteFill>
            <MathLayout
                title="Manim × Remotion 統合デモ"
                subtitle={
                    <Subtitle
                        speaker={current.speaker}
                        text={current.text}
                        speakerColor={current.speakerColor}
                        appearFrame={startFrames[currentIndex]}
                    />
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%', maxWidth: 1100 }}>

                    {/* シーン0: タイトル */}
                    {frame >= startFrames[0] && (
                        <ScaleIn appearFrame={startFrames[0]}>
                            <Text size={44} weight="bold" align="center" color="#1e293b">
                                Manim × Remotion 統合
                            </Text>
                        </ScaleIn>
                    )}

                    {/* シーン1: カードで説明 */}
                    {frame >= startFrames[1] && frame < startFrames[2] && (
                        <ScaleIn appearFrame={startFrames[1]}>
                            <Card padding={44}>
                                <Text size={34} color="#334155" align="center">
                                    ReactコンポーネントとManimアニメーションを{'\n'}
                                    同じ画面内にシームレスに配置できます
                                </Text>
                                <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 40 }}>
                                    {['📝 テキスト解説', '📊 動くグラフ', '🎬 フロー図'].map((item, i) => (
                                        <div key={i} style={{
                                            backgroundColor: 'rgba(14,165,233,0.1)',
                                            border: '1px solid rgba(14,165,233,0.3)',
                                            borderRadius: 12,
                                            padding: '12px 28px',
                                        }}>
                                            <Text size={28} weight="bold" color="#0ea5e9">{item}</Text>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </ScaleIn>
                    )}

                    {/* シーン2: Manimアニメーション埋め込み */}
                    {frame >= manimStartFrame && (
                        <div style={{ display: 'flex', gap: 40, alignItems: 'stretch', width: '100%', height: '100%', minHeight: 400 }}>
                            {/* 左: 説明テキスト */}
                            <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <ScaleIn appearFrame={manimStartFrame}>
                                    <Text size={28} weight="bold" color="#475569">
                                        Manimが描く{'\n'}正弦波グラフ
                                    </Text>
                                    <div style={{ marginTop: 20 }} />
                                    <Text size={24} color="#64748b">
                                        {'• '}グラフを左から描画{'\n'}
                                        {'• '}最大値・最小値をマーク{'\n'}
                                        {'• '}周期 T = 2π を可視化
                                    </Text>
                                </ScaleIn>
                            </div>

                            {/* 右: Manimアニメーション */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                                <AnimationEmbed
                                    src={staticFile('animations/component_showcase/SineWaveDemo.mp4')}
                                    startFrame={manimStartFrame}
                                    flex={1}
                                    style={{ maxHeight: '100%' }}
                                    borderRadius={20}
                                />
                            </div>
                        </div>
                    )}

                    {/* シーン3: サマリー */}
                    {frame >= startFrames[3] && (
                        <ScaleIn appearFrame={startFrames[3]}>
                            <Card padding={36}>
                                <Text size={32} weight="bold" color="#0f172a" align="center">
                                    🎉 これにより他の解説動画との圧倒的な差別化が可能！
                                </Text>
                            </Card>
                        </ScaleIn>
                    )}

                </div>
            </MathLayout>
        </AbsoluteFill>
    );
};

// 簡易ScaleInアニメーション
const ScaleIn: React.FC<{ children: React.ReactNode, appearFrame?: number }> = ({ children, appearFrame = 0 }) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame - appearFrame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const scale = interpolate(frame - appearFrame, [0, 15], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return <div style={{ opacity: progress, transform: `scale(${scale})`, width: '100%' }}>{children}</div>;
}
