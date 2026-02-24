import React from 'react';
import { SlideIn } from './SlideIn';
import { Text } from './Text';

export interface FlowStepsProps {
    steps: string[];
    startFrames: number[];
    frame: number;
}

export const FlowSteps: React.FC<FlowStepsProps> = ({
    steps,
    startFrames,
    frame
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 16 }}>
            {steps.map((step, i) => {
                if (frame < startFrames[i]) return null;

                return (
                    <React.Fragment key={i}>
                        <SlideIn direction="left" distance={20} appearFrame={startFrames[i]}>
                            <div style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '16px 32px',
                                borderRadius: 12,
                                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                                textAlign: 'center'
                            }}>
                                <Text size={32} weight="bold" color="white" align="center">{step}</Text>
                            </div>
                        </SlideIn>

                        {/* 最後のステップじゃなければ矢印を表示 */}
                        {i < steps.length - 1 && frame >= startFrames[i + 1] && (
                            <SlideIn direction="left" distance={10} appearFrame={startFrames[i + 1]}>
                                <div style={{ fontSize: 40, color: '#94a3b8', margin: '0 8px' }}>
                                    ➔
                                </div>
                            </SlideIn>
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    );
};
