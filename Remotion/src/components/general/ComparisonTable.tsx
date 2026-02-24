import React from 'react';
import { SlideIn } from './SlideIn';
import { Text } from './Text';

export interface ComparisonTableProps {
    titleA: string;
    titleB: string;
    itemsA: string[];
    itemsB: string[];
    appearFrame?: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
    titleA,
    titleB,
    itemsA,
    itemsB,
    appearFrame = 0
}) => {
    const rowCount = Math.max(itemsA.length, itemsB.length);

    return (
        <SlideIn direction="up" distance={40} appearFrame={appearFrame}>
            <div style={{
                display: 'flex',
                width: '100%',
                border: '2px solid #e2e8f0',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
                {/* Left Column (A) */}
                <div style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                    <div style={{ padding: '20px', backgroundColor: '#e2e8f0', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>
                        <Text size={32} weight="bold" color="#334155" align="center">{titleA}</Text>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {Array.from({ length: rowCount }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < rowCount - 1 ? '1px dashed #cbd5e1' : 'none', paddingBottom: i < rowCount - 1 ? 16 : 0 }}>
                                <span style={{ color: '#64748b', fontSize: 24 }}>•</span>
                                <Text size={28}>{itemsA[i] || ''}</Text>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ width: 2, backgroundColor: '#e2e8f0' }} />

                {/* Right Column (B) */}
                <div style={{ flex: 1, backgroundColor: '#fff' }}>
                    <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderBottom: '2px solid #bfdbfe', textAlign: 'center' }}>
                        <Text size={32} weight="bold" color="#1e40af" align="center">{titleB}</Text>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {Array.from({ length: rowCount }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < rowCount - 1 ? '1px dashed #e2e8f0' : 'none', paddingBottom: i < rowCount - 1 ? 16 : 0 }}>
                                <span style={{ color: '#3b82f6', fontSize: 24 }}>•</span>
                                <Text size={28}>{itemsB[i] || ''}</Text>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SlideIn>
    );
};
