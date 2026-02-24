import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface SlideInProps {
    children: React.ReactNode;
    appearFrame?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
    children,
    appearFrame = 0,
    duration = 15,
    direction = 'up',
    distance = 50,
}) => {
    const frame = useCurrentFrame();
    const localFrame = frame - appearFrame;

    const progress = interpolate(localFrame, [0, duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const getTransform = () => {
        const value = interpolate(progress, [0, 1], [distance, 0]);
        switch (direction) {
            case 'up': return `translateY(${value}px)`;
            case 'down': return `translateY(${-value}px)`;
            case 'left': return `translateX(${value}px)`;
            case 'right': return `translateX(${-value}px)`;
        }
    };

    return (
        <div style={{
            opacity: progress,
            transform: getTransform(),
            width: '100%'
        }}>
            {children}
        </div>
    );
};
