import React from 'react';
import { SlideIn } from './SlideIn';
import { Text } from './Text';

export interface AnimatedListItemProps {
    index: number | string;
    text: string;
    appearFrame?: number;
    color?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
    index,
    text,
    appearFrame = 0,
    color = '#0ea5e9'
}) => {
    return (
        <SlideIn direction="up" distance={30} appearFrame={appearFrame}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 16
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${color}55`
                }}>
                    {index}
                </div>
                <Text size={36} weight="bold">{text}</Text>
            </div>
        </SlideIn>
    );
};

export interface AnimatedListProps {
    items: { text: string }[];
    startFrames: number[]; // 各アイテムが出現するフレームの配列（必須）
    frame: number;         // 現在のフレーム（必須）表示判定用
    color?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
    items,
    startFrames,
    frame,
    color = '#0ea5e9'
}) => {
    const ITEM_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#a855f7', '#ec4899'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {items.map((item, i) => {
                // 現在のフレームが出現フレームより前ならレンダリングしない＝画面に残したいから
                if (frame < startFrames[i]) return null;

                const itemColor = color || ITEM_COLORS[i % ITEM_COLORS.length];

                return (
                    <AnimatedListItem
                        key={i}
                        index={i + 1}
                        text={item.text}
                        appearFrame={startFrames[i]}
                        color={itemColor}
                    />
                );
            })}
        </div>
    );
};
