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
        </svg>
    );
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
                    {subtitle}
                </div>
            )}

        </AbsoluteFill>
    );
};
