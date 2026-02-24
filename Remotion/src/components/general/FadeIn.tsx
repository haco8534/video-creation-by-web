import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface FadeInProps {
    children: React.ReactNode;
    appearFrame?: number;
    duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
    children,
    appearFrame = 0,
    duration = 15,
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(
        frame - appearFrame,
        [0, duration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div style={{ opacity, width: '100%' }}>
            {children}
        </div>
    );
};
