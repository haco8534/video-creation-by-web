import React from 'react';
import { OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

export interface AnimationEmbedProps {
    /** staticFile('animations/...') で取得した MP4 パス */
    src: string;
    /** Remotion全体の何フレームからこのManimの動画の再生を開始するか（絶対フレーム） */
    startFrame?: number;
    /** 表示幅 px または CSS 値  */
    width?: number | string;
    /** 表示高さ px */
    height?: number | string;
    /** フレックスボックス内で自動伸長させるか */
    flex?: number;
    /** 追加のカスタムスタイル */
    style?: React.CSSProperties;
    /** 角丸 px */
    borderRadius?: number;
    /** 再生速度 (デフォルト: 1.0 = 実時間) */
    playbackRate?: number;
}

export const AnimationEmbed: React.FC<AnimationEmbedProps> = ({
    src,
    startFrame = 0,
    width,
    height,
    flex,
    style = {},
    borderRadius = 16,
    playbackRate = 1,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    if (frame < startFrame) return null;

    const remainingFrames = durationInFrames - startFrame;

    return (
        <div
            style={{
                width: width ?? (flex ? undefined : '100%'),
                height: height ?? (flex ? undefined : 'auto'),
                flex,
                aspectRatio: flex ? '16 / 9' : undefined,
                position: 'relative',
                borderRadius,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                backgroundColor: '#f8fafc',
                flexShrink: flex ? 1 : 0,
                ...style,
            }}
        >
            <Sequence from={startFrame} durationInFrames={remainingFrames}>
                <OffthreadVideo
                    src={src}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                    playbackRate={playbackRate}
                />
            </Sequence>
        </div>
    );
};
