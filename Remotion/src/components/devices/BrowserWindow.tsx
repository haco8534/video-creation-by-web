
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface BrowserWindowProps {
    children: React.ReactNode;
    url?: string;
    width?: string | number;
    height?: string | number;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
    children,
    url = 'https://example.com',
    width = '100%',
    height = 'auto',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Pop-up animation
    const progress = spring({
        frame,
        fps,
        config: { damping: 200, mass: 0.8 },
    });

    const scale = interpolate(progress, [0, 1], [0.9, 1]);
    const opacity = interpolate(progress, [0, 1], [0, 1]);
    const translateY = interpolate(progress, [0, 1], [50, 0]);

    return (
        <div
            style={{
                width,
                height,
                transform: `scale(${scale}) translateY(${translateY}px)`,
                opacity,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Title Bar */}
            <div
                style={{
                    backgroundColor: '#f3f4f6',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: '1px solid #e5e7eb',
                }}
            >
                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                </div>

                {/* Address Bar */}
                <div
                    style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        color: '#6b7280',
                        textAlign: 'center',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: 'Consolas, monospace',
                    }}
                >
                    {url}
                </div>

                {/* Spacer for balance */}
                <div style={{ width: 52 }} />
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', minHeight: 400 }}>
                {children}
            </div>
        </div>
    );
};
