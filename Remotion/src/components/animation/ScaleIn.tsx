import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export interface ScaleInProps {
    children: React.ReactNode;
    appearFrame?: number;
    duration?: number;
    overshoot?: boolean;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
    children,
    appearFrame = 0,
    duration = 20,
    overshoot = false,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const localFrame = frame - appearFrame;

    let scale: number;
    let opacity: number;

    if (overshoot) {
        const springValue = spring({
            frame: Math.max(0, localFrame),
            fps,
            config: {
                damping: 8,
                stiffness: 100,
                mass: 0.5,
            },
        });
        scale = springValue;
        opacity = interpolate(localFrame, [0, duration * 0.3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    } else {
        scale = interpolate(localFrame, [0, duration], [0.5, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
        opacity = interpolate(localFrame, [0, duration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }

    if (localFrame < 0) {
        return null;
    }

    return (
        <div
            style={{
                opacity,
                transform: `scale(${scale})`,
                width: '100%',
            }}
        >
            {children}
        </div>
    );
};
