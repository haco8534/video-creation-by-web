import React from 'react';
import { MathLayout } from '../../components/layouts/MathLayout';

export const MathLayoutShowcase: React.FC = () => {
    // Glass style values built-in
    const border = '1px solid rgba(255,255,255,0.4)';
    const shadow = '0 4px 15px rgba(0,0,0,0.05)';
    const borderRadius = 16;
    const bg = 'rgba(255, 255, 255, 0.3)';
    const stroke = '#4B5563';
    const divider = '1px solid rgba(255,255,255,0.4)';

    return (
        <MathLayout title="順序体と実閉体の枠組み">
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{
                    fontSize: 48,
                    marginBottom: 20,
                    fontFamily: '"Times New Roman", serif',
                    fontWeight: 'bold',
                    color: '#334155'
                }}>
                    <span style={{ fontStyle: 'italic', marginRight: 10 }}>ℝ</span>
                    の性質
                </h2>

                <div style={{
                    border,
                    width: '100%',
                    padding: 40,
                    position: 'relative',
                    borderRadius,
                    backgroundColor: bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 30,
                    boxShadow: shadow
                }}>
                    <div style={{ textAlign: 'center', fontSize: 32, fontFamily: '"Times New Roman", serif', color: stroke }}>
                        <div style={{ marginBottom: 20 }}>x + y, xy, -x, x⁻¹</div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div>四則演算</div>
                                <div>大小関係</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', height: 80, marginLeft: 10, marginRight: 10 }}>
                                <svg width="20" height="80" viewBox="0 0 20 80" style={{ overflow: 'visible' }}>
                                    <path
                                        d="M0,0 C10,0 15,10 15,35 L20,40 L15,45 C15,70 10,80 0,80"
                                        stroke={stroke}
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                </svg>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div>この2つが整合している</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 2, borderBottom: divider, margin: '20px 0' }} />

                    <div style={{ textAlign: 'center', width: '100%', color: stroke }}>
                        <div style={{ textAlign: 'left', fontSize: 28, marginBottom: 10 }}>代数的性質</div>
                        <div style={{ fontSize: 36 }}>
                            √-1 を添加すると代数閉体になる
                        </div>
                    </div>
                </div>
            </div>
        </MathLayout>
    );
};
