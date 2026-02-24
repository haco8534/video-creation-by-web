import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

type DiagramNode = {
    id: string;
    label: string;
    sublabel?: string;
    icon?: string;
    color: string;
};

type DiagramEdge = {
    from: string;
    to: string;
    label?: string;
    color?: string;
    returnPath?: boolean;
};

export interface RelationDiagramProps {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    appearFrame?: number;
    width?: number;
}

export const RelationDiagram: React.FC<RelationDiagramProps> = ({
    nodes,
    edges,
    appearFrame = 0,
    width = 1000,
}) => {
    const frame = useCurrentFrame();
    const localFrame = frame - appearFrame;

    const containerOpacity = interpolate(localFrame, [0, 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const nodeWidth = 180;
    const nodeHeight = 140;
    const spacing = (width - nodeWidth * nodes.length) / (nodes.length + 1);

    const getNodePosition = (nodeId: string) => {
        const index = nodes.findIndex((n) => n.id === nodeId);
        const x = spacing + index * (nodeWidth + spacing) + nodeWidth / 2;
        return { x, y: nodeHeight / 2 + 40 };
    };

    const arrowSize = 10;

    return (
        <div
            style={{
                opacity: containerOpacity,
                width,
                position: 'relative',
                minHeight: nodeHeight + 160,
            }}
        >
            <svg
                width={width}
                height={nodeHeight + 160}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <defs>
                    {edges.map((edge, i) => (
                        <marker
                            key={`marker-${i}`}
                            id={`arrowhead-${i}`}
                            markerWidth={arrowSize}
                            markerHeight={arrowSize}
                            refX={arrowSize - 1}
                            refY={arrowSize / 2}
                            orient="auto"
                        >
                            <polygon
                                points={`0 0, ${arrowSize} ${arrowSize / 2}, 0 ${arrowSize}`}
                                fill={edge.color || '#64748b'}
                            />
                        </marker>
                    ))}
                </defs>
                {edges.map((edge, i) => {
                    const fromPos = getNodePosition(edge.from);
                    const toPos = getNodePosition(edge.to);

                    const edgeDelay = (i + 1) * 10;
                    const edgeProgress = interpolate(
                        localFrame - edgeDelay,
                        [0, 15],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    if (edgeProgress <= 0) return null;

                    const yOffset = edge.returnPath ? 50 : -50;
                    const midY = fromPos.y + yOffset;
                    const midX = (fromPos.x + toPos.x) / 2;
                    const controlY = midY + yOffset * 0.5;
                    const path = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${controlY} ${toPos.x} ${toPos.y}`;

                    return (
                        <g key={i} opacity={edgeProgress}>
                            <path
                                d={path}
                                stroke={edge.color || '#64748b'}
                                strokeWidth={3}
                                fill="none"
                                markerEnd={`url(#arrowhead-${i})`}
                                strokeDasharray={edge.returnPath ? '8,4' : 'none'}
                            />
                            {edge.label && (
                                <text
                                    x={midX}
                                    y={controlY + (edge.returnPath ? 24 : -12)}
                                    textAnchor="middle"
                                    fill={edge.color || '#64748b'}
                                    fontSize={20}
                                    fontWeight={600}
                                >
                                    {edge.label}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {nodes.map((node, i) => {
                const nodeDelay = i * 8;
                const nodeProgress = interpolate(
                    localFrame - nodeDelay,
                    [0, 12],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                const x = spacing + i * (nodeWidth + spacing);

                return (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: 40,
                            width: nodeWidth,
                            height: nodeHeight,
                            opacity: nodeProgress,
                            transform: `scale(${interpolate(nodeProgress, [0, 1], [0.8, 1])})`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            background: `linear-gradient(135deg, ${node.color}18, ${node.color}30)`,
                            border: `2px solid ${node.color}60`,
                            borderRadius: 20,
                            backdropFilter: 'blur(8px)',
                            boxShadow: `0 8px 32px ${node.color}20`,
                        }}
                    >
                        {node.icon && (
                            <span style={{ fontSize: 40 }}>{node.icon}</span>
                        )}
                        <span
                            style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: '#1e293b',
                            }}
                        >
                            {node.label}
                        </span>
                        {node.sublabel && (
                            <span
                                style={{
                                    fontSize: 16,
                                    color: node.color,
                                    fontWeight: 500,
                                }}
                            >
                                {node.sublabel}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
