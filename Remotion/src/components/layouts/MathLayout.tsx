import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';

// Dynamic Sidebar Graphics
const SidebarPattern: React.FC = () => {
    return (
        <svg width="100%" height="100%" viewBox="0 0 300 1080" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Glowing orbs for the frosted glass to overlay */}
            <circle cx="150" cy="200" r="120" fill="#A78BFA" opacity="0.4" filter="blur(30px)" />
            <circle cx="50" cy="500" r="150" fill="#60A5FA" opacity="0.3" filter="blur(40px)" />
            <circle cx="250" cy="800" r="140" fill="#F472B6" opacity="0.3" filter="blur(35px)" />
            {/* 装飾ライン：縦のアクセント */}
            <line x1="40" y1="120" x2="40" y2="960" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="260" y1="80" x2="260" y2="1000" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="8 16" />
            {/* 小さな菱形装飾 */}
            <rect x="32" y="160" width="16" height="16" rx="3" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" transform="rotate(45 40 168)" />
            <rect x="32" y="500" width="12" height="12" rx="2" fill="none" stroke="rgba(96,165,250,0.35)" strokeWidth="1.5" transform="rotate(45 38 506)" />
            <rect x="32" y="840" width="14" height="14" rx="2" fill="none" stroke="rgba(244,114,182,0.35)" strokeWidth="1.5" transform="rotate(45 39 847)" />
        </svg>
    );
};

// コーナーアクセント装飾
const CornerAccent: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
    const size = 32;
    const color = 'rgba(167, 139, 250, 0.25)';
    const style: React.CSSProperties = {
        position: 'absolute',
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 5,
    };
    const borderStyle = `2px solid ${color}`;

    switch (position) {
        case 'top-left':
            return <div style={{ ...style, top: -1, left: -1, borderTop: borderStyle, borderLeft: borderStyle, borderTopLeftRadius: 20 }} />;
        case 'top-right':
            return <div style={{ ...style, top: -1, right: -1, borderTop: borderStyle, borderRight: borderStyle, borderTopRightRadius: 20 }} />;
        case 'bottom-left':
            return <div style={{ ...style, bottom: -1, left: -1, borderBottom: borderStyle, borderLeft: borderStyle, borderBottomLeftRadius: 20 }} />;
        case 'bottom-right':
            return <div style={{ ...style, bottom: -1, right: -1, borderBottom: borderStyle, borderRight: borderStyle, borderBottomRightRadius: 20 }} />;
    }
};

// Glass Design Configuration
const config = {
    background: '#FAF5FF',
    card: { bg: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.8)', shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', radius: 30 },
    header: { bg: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.6)', shadow: '0 4px 15px rgba(0,0,0,0.05)', color: '#4B5563', height: 80, radius: 20, margin: '15px' },
    sidebar: { bg: 'rgba(255, 255, 255, 0.2)', border: 'l 1px solid rgba(255, 255, 255, 0.4)', width: 380 },
    footer: { bg: 'rgba(255, 255, 255, 0.3)', border: 't 1px solid rgba(255, 255, 255, 0.5)', color: '#4B5563' }
};

export const MathLayout: React.FC<{
    title?: string;
    children: React.ReactNode;
    /** フッター領域に表示するコンテンツ（Subtitleコンポーネントを想定） */
    subtitle?: React.ReactNode;
    /** 動画埋め込みモード: カードの枠・背景・パディングを消して映像をシームレスに表示 */
    videoMode?: boolean;
}> = ({ title = "順序体と実閉体の枠組み", children, subtitle, videoMode = false }) => {
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{
            backgroundColor: config.background,
            backgroundImage: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
            fontFamily: '"Zen Maru Gothic", sans-serif'
        }}>

            {/* Base gradient for glass */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(to right bottom, #E0F2FE, #F3E8FF, #FCE7F3)', opacity: 0.6, zIndex: 0 }} />

            {/* 極薄ドットグリッドパターン（情報量追加） */}
            <div style={{
                position: 'absolute', width: '100%', height: '100%', zIndex: 0,
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }} />

            {/* Sidebar Region */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: config.sidebar.width,
                    bottom: 0,
                    backgroundColor: config.sidebar.bg,
                    borderLeft: config.sidebar.border.replace('l ', ''),
                    borderRadius: 0,
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1
                }}
            >
                <SidebarPattern />
            </div>

            {/* Header Region */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `calc(100% - ${config.sidebar.width + 60}px)`,
                    height: config.header.height,
                    backgroundColor: config.header.bg,
                    border: config.header.border,
                    borderRadius: config.header.radius,
                    margin: config.header.margin,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 40,
                    boxShadow: config.header.shadow,
                    backdropFilter: 'blur(16px)',
                }}
            >
                <h1 style={{ fontWeight: 800, fontSize: 42, color: config.header.color, margin: 0 }}>
                    {title}
                </h1>
                {/* ヘッダー下部アクセントライン */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 20,
                    right: 20,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4) 20%, rgba(96,165,250,0.4) 50%, rgba(244,114,182,0.4) 80%, transparent)',
                    borderRadius: 1,
                }} />
            </div>

            {/* Main Content Area Region */}
            <div
                style={{
                    position: 'absolute',
                    top: config.header.height + 20,
                    left: 0,
                    width: width - config.sidebar.width,
                    // videoMode または subtitle がある場合はフッター分(100px)を常に確保
                    height: (videoMode || subtitle)
                        ? height - config.header.height - 100 - 40
                        : height - config.header.height - 40,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px 40px',  // カード外側の粗い余白のみ
                    zIndex: 2,
                }}
            >
                {/* Card Container */}
                <div
                    style={{
                        backgroundColor: videoMode ? 'transparent' : config.card.bg,
                        width: '100%',
                        height: '100%',
                        borderRadius: videoMode ? 20 : config.card.radius,
                        border: videoMode ? 'none' : config.card.border,
                        boxShadow: videoMode ? 'none' : config.card.shadow,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: videoMode ? 0 : '44px 64px',
                        boxSizing: 'border-box',
                        color: '#2d2d2d',
                        overflow: videoMode ? 'hidden' : 'visible',
                        backdropFilter: videoMode ? 'none' : 'blur(20px)',
                    }}
                >
                    {children}
                    {/* コーナーアクセント（videoMode以外） */}
                    {!videoMode && (
                        <>
                            <CornerAccent position="top-left" />
                            <CornerAccent position="top-right" />
                            <CornerAccent position="bottom-left" />
                            <CornerAccent position="bottom-right" />
                        </>
                    )}
                </div>
            </div>

            {/* Footer / Subtitle Area Region */}
            {/* videoMode では字幕がない時間帯でもフッター領域を常に表示してレイアウトを安定させる */}
            {(videoMode || subtitle) && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: 100,
                        backgroundColor: config.footer.bg,
                        borderTop: config.footer.border.replace('t ', ''),
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 60,
                        paddingRight: 60,
                        boxSizing: 'border-box',
                        backdropFilter: 'blur(10px)',
                        gap: 24,
                    }}
                >
                    {/* フッター上部グラデーションセパレーター */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.3) 15%, rgba(96,165,250,0.35) 50%, rgba(244,114,182,0.3) 85%, transparent)',
                    }} />
                    {subtitle}
                </div>
            )}

        </AbsoluteFill>
    );
};
