
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface ServerProps {
    scale?: number;
    activeColor?: string; // Color of blinking lights
}

export const Server: React.FC<ServerProps> = ({
    scale = 1,
    activeColor = '#22c55e',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame,
        fps,
        config: { damping: 200 },
    });

    const opacity = interpolate(progress, [0, 1], [0, 1]);
    const translateY = interpolate(progress, [0, 1], [50, 0]);

    // Blink animation for LEDs
    const blink1 = Math.sin(frame * 0.2) > 0 ? 1 : 0.3;
    const blink2 = Math.sin(frame * 0.3 + 2) > 0 ? 1 : 0.3;
    const blink3 = Math.sin(frame * 0.5 + 4) > 0 ? 1 : 0.3;

    const width = 200 * scale;
    const height = 300 * scale;

    return (
        <div
            style={{
                width,
                height,
                backgroundColor: '#1f2937', // Dark gray metallic
                borderRadius: 8,
                border: '4px solid #374151',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                padding: 10,
                gap: 8,
                transform: `translateY(${translateY}px)`,
                opacity,
                position: 'relative',
            }}
        >
            {/* Server Units (Rack-mounts) */}
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        backgroundColor: '#111827',
                        borderRadius: 4,
                        border: '1px solid #374151',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 10px',
                        gap: 8,
                        justifyContent: 'space-between'
                    }}
                >
                    {/* Vents */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[0, 1, 2, 3, 4].map(j => (
                            <div key={j} style={{ width: 4, height: 20, backgroundColor: '#374151', borderRadius: 2 }} />
                        ))}
                    </div>

                    {/* Lights */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: activeColor, opacity: i === 0 ? blink1 : i === 2 ? blink2 : 0.3, boxShadow: i === 0 ? `0 0 5px ${activeColor}` : 'none' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', opacity: i === 1 ? blink3 : 0.3, boxShadow: i === 1 ? `0 0 5px #3b82f6` : 'none' }} />
                    </div>
                </div>
            ))}

            {/* Logo / Branding area */}
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: '#4b5563', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}>
                SERVER-0{Math.floor(scale * 10)}
            </div>
        </div>
    );
};
