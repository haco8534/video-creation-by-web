import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    padding?: number | string;
    bg?: string;
    borderColor?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 32,
    bg = 'rgba(255, 255, 255, 0.6)',
    borderColor = 'rgba(255, 255, 255, 0.8)'
}) => {
    return (
        <div style={{
            backgroundColor: bg,
            border: `1px solid ${borderColor}`,
            borderRadius: 24,
            padding: padding,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {children}
        </div>
    );
};
