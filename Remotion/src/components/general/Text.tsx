import React from 'react';

export interface TextProps {
    children: React.ReactNode;
    size?: number | string;
    weight?: 'normal' | 'bold' | number;
    color?: string;
    align?: 'left' | 'center' | 'right';
}

export const Text: React.FC<TextProps> = ({
    children,
    size = 32,
    weight = 'normal',
    color = '#2d3748',
    align = 'left'
}) => {
    return (
        <div style={{
            fontSize: size,
            fontWeight: weight,
            color,
            textAlign: align,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
        }}>
            {children}
        </div>
    );
};
