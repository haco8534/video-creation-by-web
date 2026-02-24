import React from 'react';
import { SlideIn } from './SlideIn';
import { Text } from './Text';

export interface InfoCalloutProps {
    type?: 'info' | 'warning' | 'success';
    title?: string;
    text: string;
    appearFrame?: number;
}

export const InfoCallout: React.FC<InfoCalloutProps> = ({
    type = 'info',
    title,
    text,
    appearFrame = 0
}) => {
    const config = {
        info: { bg: '#eff6ff', border: '#bfdbfe', icon: '💡', textBg: '#1d4ed8' },
        warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', textBg: '#b45309' },
        success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', textBg: '#15803d' }
    }[type];

    return (
        <SlideIn direction="up" distance={20} appearFrame={appearFrame}>
            <div style={{
                backgroundColor: config.bg,
                border: `2px solid ${config.border}`,
                borderRadius: 16,
                padding: '24px 32px',
                display: 'flex',
                gap: 24,
                alignItems: title ? 'flex-start' : 'center',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{ fontSize: 40, flexShrink: 0, marginTop: title ? -4 : 0 }}>
                    {config.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {title && (
                        <Text size={28} weight="bold" color={config.textBg}>
                            {title}
                        </Text>
                    )}
                    <Text size={32} color="#334155" weight="normal">
                        {text}
                    </Text>
                </div>
            </div>
        </SlideIn>
    );
};
