
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface SmartphoneProps {
    children: React.ReactNode;
    width?: number; // Base width, height will be calculated (9:19.5 ratio approx)
    frameColor?: string;
}

export const Smartphone: React.FC<SmartphoneProps> = ({
    children,
    width = 360,
    frameColor = '#1f2937',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Aspect ratio for modern phones (e.g. iPhone 14 Pro is roughly 9:19.5)
    const height = width * (19.5 / 9);
    const cornerRadius = width * 0.12;

    // Animation
    const progress = spring({
        frame,
        fps,
        config: { damping: 200, mass: 0.8 },
    });

    const translateY = interpolate(progress, [0, 1], [100, 0]);
    const opacity = interpolate(progress, [0, 1], [0, 1]);

    return (
        <div
            style={{
                width,
                height,
                backgroundColor: frameColor,
                borderRadius: cornerRadius,
                padding: width * 0.04, // Bezel thickness
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                transform: `translateY(${translateY}px)`,
                opacity,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Screen Area */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    borderRadius: cornerRadius * 0.8,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {children}
            </div>

            {/* Dynamic Island / Notch */}
            <div
                style={{
                    position: 'absolute',
                    top: width * 0.04 + 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: width * 0.3,
                    height: width * 0.08,
                    backgroundColor: '#000',
                    borderRadius: 20,
                    zIndex: 20,
                }}
            />

            {/* Home Indicator line */}
            <div
                style={{
                    position: 'absolute',
                    bottom: width * 0.04 + 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: width * 0.35,
                    height: 5,
                    backgroundColor: 'rgba(0,0,0,0.3)', // On screen often white, but let's assume content covers it
                    borderRadius: 10,
                    zIndex: 20,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};
