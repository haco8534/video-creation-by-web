import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansJP';

const { fontFamily } = loadFont();

export interface SubtitleProps {
    speaker: string;
    text: string;
    speakerColor?: string;
    textColor?: string;
    /** このSubtitleが「出現すべき絶対フレーム数」。
     *  セグメントが切り替わるたびに新しい値を渡すと、
     *  切り替わりのタイミングでフェードインが再トリガーされる。 */
    appearFrame?: number;
}

/**
 * Subtitle — MathLayout の subtitle prop に渡して使う。
 * position: absolute を使わず、フッターの flex コンテナ内に自然に収まる。
 *
 * 使い方:
 *   <MathLayout title="..." subtitle={
 *     <Subtitle speaker={current.speaker} text={current.text}
 *               speakerColor={current.speakerColor}
 *               appearFrame={startFrames[currentIndex]} />
 *   }>
 *     ...コンテンツ...
 *   </MathLayout>
 */
export const Subtitle: React.FC<SubtitleProps> = ({
    speaker,
    text,
    speakerColor = '#d6336c',
    textColor = '#1a1a2e',
    appearFrame = 0,
}) => {
    const frame = useCurrentFrame();
    const localFrame = frame - appearFrame;

    const opacity = interpolate(localFrame, [0, 10], [0, 1], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
    });
    const translateY = interpolate(localFrame, [0, 10], [10, 0], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
    });

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 20,
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily,
                width: '100%',
                overflow: 'hidden',
            }}
        >
            {/* 話者名バッジ */}
            <span
                style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: speakerColor,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderLeft: `6px solid ${speakerColor}`,
                    paddingLeft: 14,
                    lineHeight: 1.2,
                }}
            >
                {speaker}
            </span>

            {/* 区切りドット */}
            <span style={{ fontSize: 28, color: 'rgba(0,0,0,0.2)', flexShrink: 0, lineHeight: 1 }}>
                ▶
            </span>

            {/* セリフ本文 */}
            <span
                style={{
                    fontSize: 34,
                    color: textColor,
                    lineHeight: 1.45,
                    fontWeight: 500,
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {text}
            </span>
        </div>
    );
};
