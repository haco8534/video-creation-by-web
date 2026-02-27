import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Img,
    OffthreadVideo,
    useCurrentFrame,
    staticFile,
    interpolate,
} from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { SUBTITLE_DATA, TOTAL_FRAMES, SubtitleEntry } from './subtitleData';

// ============================================================
// BGM設定
// ============================================================
const BGM_VOLUME = 0.05;
const BGM_FADE_OUT_FRAMES = 90;

// ============================================================
// キャラクター設定
// ============================================================
const SIDEBAR_WIDTH = 380;

const CHARACTER_IMAGE_VARIANTS: Record<string, string[]> = {
    'ずんだもん': [
        'characters/zundamon/normal2.png',
        'characters/zundamon/normal3.png',
        'characters/zundamon/normal4.png',
    ],
    'めたん': [
        'characters/metan/normal2.png',
        'characters/metan/normal3.png',
        'characters/metan/normal4.png',
    ],
};

function getImageForEntry(speaker: string, entryIndex: number): string | null {
    const variants = CHARACTER_IMAGE_VARIANTS[speaker];
    if (!variants || variants.length === 0) return null;
    return variants[entryIndex % variants.length];
}

const ANIM = {
    swapFrames: 10,
    inactiveOpacity: 0.5,
    slideDistance: 80,
};

// ============================================================
// 字幕取得
// ============================================================
function getCurrentSubtitle(
    frame: number,
    data: SubtitleEntry[]
): SubtitleEntry | null {
    let result: SubtitleEntry | null = null;
    for (const entry of data) {
        if (entry.startFrame <= frame) {
            result = entry;
        } else {
            break;
        }
    }
    if (result) {
        const endFrame = result.startFrame + result.durationFrames + 9;
        if (frame > endFrame) return null;
    }
    return result;
}

function getPreviousSubtitle(
    frame: number,
    currentEntry: SubtitleEntry | null,
    data: SubtitleEntry[]
): SubtitleEntry | null {
    if (!currentEntry) return null;
    const currentIndex = data.indexOf(currentEntry);
    if (currentIndex <= 0) return null;
    return data[currentIndex - 1];
}

// ============================================================
// スピーカースワップ付きキャラクタースプライト
// ============================================================
const SpeakerSwapSprite: React.FC<{
    currentSpeaker: string | null;
    currentImagePath: string | null;
    previousSpeaker: string | null;
    previousImagePath: string | null;
    framesSinceSpeakerChange: number;
    frame: number;
}> = ({ currentSpeaker, currentImagePath, previousSpeaker, previousImagePath, framesSinceSpeakerChange }) => {
    const speakerChanged = currentSpeaker !== previousSpeaker;
    const isTransitioning = speakerChanged && framesSinceSpeakerChange < ANIM.swapFrames;

    return (
        <>
            {currentSpeaker && currentImagePath && (
                <CharacterLayer
                    imagePath={currentImagePath}
                    phase={isTransitioning ? 'entering' : 'active'}
                    progress={isTransitioning
                        ? framesSinceSpeakerChange / ANIM.swapFrames
                        : 1
                    }
                    zIndex={20}
                />
            )}
            {isTransitioning && previousSpeaker && previousImagePath && (
                <CharacterLayer
                    imagePath={previousImagePath}
                    phase="exiting"
                    progress={framesSinceSpeakerChange / ANIM.swapFrames}
                    zIndex={19}
                />
            )}
        </>
    );
};

// ============================================================
// キャラクターレイヤー
// ============================================================
const CharacterLayer: React.FC<{
    imagePath: string;
    phase: 'entering' | 'active' | 'exiting';
    progress: number;
    zIndex: number;
}> = ({ imagePath, phase, progress, zIndex }) => {
    let opacity: number;
    let translateY: number;

    switch (phase) {
        case 'entering':
            opacity = interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
            translateY = interpolate(progress, [0, 1], [ANIM.slideDistance, 0], { extrapolateRight: 'clamp' });
            break;
        case 'active':
            opacity = 1;
            translateY = 0;
            break;
        case 'exiting':
            opacity = interpolate(progress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
            translateY = interpolate(progress, [0, 1], [0, ANIM.slideDistance], { extrapolateRight: 'clamp' });
            break;
    }

    return (
        <div
            style={{
                position: 'absolute',
                bottom: -60,
                right: 10,
                width: SIDEBAR_WIDTH - 20,
                zIndex,
                opacity,
                transform: `translateY(${translateY}px)`,
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.25))',
                pointerEvents: 'none' as const,
            }}
        >
            <Img
                src={staticFile(imagePath)}
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain' as const,
                }}
            />
        </div>
    );
};

// ============================================================
// メインコンポーネント
// ============================================================
export const VideoWithSubtitles: React.FC = () => {
    const frame = useCurrentFrame();

    const currentEntry = getCurrentSubtitle(frame, SUBTITLE_DATA);
    const previousEntry = getPreviousSubtitle(frame, currentEntry, SUBTITLE_DATA);
    const headerTitle = currentEntry?.sceneTitle ?? '「モーツァルトを聴くと頭が良くなる」の真相';

    const currentSpeaker = currentEntry?.speaker ?? null;
    const previousSpeaker = previousEntry?.speaker ?? null;

    const currentIndex = currentEntry ? SUBTITLE_DATA.indexOf(currentEntry) : 0;
    const previousIndex = previousEntry ? SUBTITLE_DATA.indexOf(previousEntry) : 0;
    const currentImagePath = currentSpeaker ? getImageForEntry(currentSpeaker, currentIndex) : null;
    const previousImagePath = previousSpeaker ? getImageForEntry(previousSpeaker, previousIndex) : null;

    const framesSinceSpeakerChange = currentEntry
        ? frame - currentEntry.startFrame
        : ANIM.swapFrames;

    const currentSceneId = currentEntry?.sceneId ?? 0;
    const progressPercent = Math.round((frame / TOTAL_FRAMES) * 100);

    const sceneList = React.useMemo(() => {
        const seen = new Set<number>();
        const list: { id: number; title: string; startFrame: number }[] = [];
        for (const entry of SUBTITLE_DATA) {
            if (!seen.has(entry.sceneId)) {
                seen.add(entry.sceneId);
                list.push({ id: entry.sceneId, title: entry.sceneTitle, startFrame: entry.startFrame });
            }
        }
        return list;
    }, []);

    const currentSceneIdx = sceneList.findIndex(s => s.id === currentSceneId);
    const CHAPTER_ITEM_HEIGHT = 44;
    const CHAPTER_ANIM_FRAMES = 15;

    const currentSceneStartFrame = currentSceneIdx >= 0 ? sceneList[currentSceneIdx].startFrame : 0;
    const framesSinceSceneChange = frame - currentSceneStartFrame;
    const animProgress = Math.min(framesSinceSceneChange / CHAPTER_ANIM_FRAMES, 1);
    const prevSceneIdx = currentSceneIdx > 0 ? currentSceneIdx - 1 : 0;
    const smoothIdx = interpolate(animProgress, [0, 1], [prevSceneIdx, currentSceneIdx], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill>
            <SpeakerSwapSprite
                currentSpeaker={currentSpeaker}
                currentImagePath={currentImagePath}
                previousSpeaker={previousSpeaker}
                previousImagePath={previousImagePath}
                framesSinceSpeakerChange={framesSinceSpeakerChange}
                frame={frame}
            />

            {/* サイドバーオーバーレイ */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: SIDEBAR_WIDTH,
                height: '100%',
                zIndex: 15,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                padding: '28px 30px',
                boxSizing: 'border-box',
            }}>
                {/* テーマブランディング */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    marginBottom: 28,
                }}>
                    <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 4,
                        color: 'rgba(107, 114, 128, 0.7)',
                        textTransform: 'uppercase' as const,
                        fontFamily: '"Inter", "Zen Maru Gothic", sans-serif',
                    }}>
                        DEBUNKING MYTHS
                    </div>
                    <div style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#374151',
                        lineHeight: 1.3,
                        fontFamily: '"Zen Maru Gothic", sans-serif',
                    }}>
                        「モーツァルトを聴くと頭が良くなる」の真相
                    </div>
                    <div style={{
                        width: 50,
                        height: 3,
                        background: 'linear-gradient(90deg, rgba(79,70,229,0.6), rgba(20,184,166,0.4))',
                        borderRadius: 2,
                        marginTop: 2,
                    }} />
                </div>

                {/* 進捗バー */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 28,
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'rgba(107, 114, 128, 0.6)',
                            letterSpacing: 2,
                            fontFamily: '"Inter", sans-serif',
                        }}>
                            PROGRESS
                        </span>
                        <span style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: 'rgba(79, 70, 229, 0.8)',
                            fontFamily: '"Inter", sans-serif',
                        }}>
                            {progressPercent}%
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: 4,
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #4f46e5, #14b8a6)',
                            borderRadius: 3,
                        }} />
                    </div>
                </div>

                {/* チャプターリスト */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    marginBottom: 12,
                }}>
                    <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'rgba(107, 114, 128, 0.6)',
                        letterSpacing: 2,
                        fontFamily: '"Inter", sans-serif',
                        marginBottom: 8,
                    }}>
                        CHAPTERS
                    </span>
                    <div style={{
                        height: CHAPTER_ITEM_HEIGHT * 5,
                        overflow: 'hidden',
                        position: 'relative',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            transform: `translateY(${(2 - smoothIdx) * CHAPTER_ITEM_HEIGHT}px)`,
                        }}>
                            {sceneList.map((scene, idx) => {
                                const isCurrent = idx === currentSceneIdx;
                                const distance = Math.abs(idx - currentSceneIdx);
                                const itemOpacity = isCurrent ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0.15;

                                return (
                                    <div
                                        key={scene.id}
                                        style={{
                                            height: CHAPTER_ITEM_HEIGHT,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            opacity: itemOpacity,
                                            paddingLeft: isCurrent ? 4 : 0,
                                        }}
                                    >
                                        <div style={{
                                            width: isCurrent ? 8 : 5,
                                            height: isCurrent ? 8 : 5,
                                            borderRadius: '50%',
                                            backgroundColor: isCurrent ? '#4f46e5' : 'rgba(107,114,128,0.3)',
                                            boxShadow: isCurrent ? '0 0 8px rgba(79,70,229,0.5)' : 'none',
                                            flexShrink: 0,
                                        }} />
                                        <span style={{
                                            fontSize: isCurrent ? 15 : 13,
                                            fontWeight: isCurrent ? 800 : 500,
                                            color: isCurrent ? '#4338ca' : '#6B7280',
                                            fontFamily: '"Zen Maru Gothic", sans-serif',
                                            lineHeight: 1.3,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {scene.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 話者インジケーター */}
                <div style={{ flex: 1 }} />
                {currentSpeaker && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 16,
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255,255,255,0.45)',
                        borderRadius: 24,
                        backdropFilter: 'blur(8px)',
                        alignSelf: 'flex-start',
                        border: '1px solid rgba(255,255,255,0.5)',
                    }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: currentEntry?.speakerColor ?? '#4f46e5',
                            boxShadow: `0 0 8px ${currentEntry?.speakerColor ?? '#4f46e5'}`,
                        }} />
                        <span style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#374151',
                            fontFamily: '"Zen Maru Gothic", sans-serif',
                        }}>
                            {currentSpeaker}
                        </span>
                    </div>
                )}
            </div>

            {/* レイアウト + 動画 + 字幕 */}
            <MathLayout
                title={headerTitle}
                videoMode
                subtitle={
                    currentEntry ? (
                        <Subtitle
                            speaker={currentEntry.speaker}
                            text={currentEntry.text}
                            speakerColor={currentEntry.speakerColor}
                            appearFrame={currentEntry.startFrame}
                        />
                    ) : undefined
                }
            >
                <OffthreadVideo
                    src={staticFile('mozart_effect.mp4')}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </MathLayout>

            {/* BGM */}
            <Audio
                src={staticFile('bgm/Mineral.mp3')}
                loop
                volume={(f) => {
                    const fadeOutStart = TOTAL_FRAMES - BGM_FADE_OUT_FRAMES;
                    if (f >= fadeOutStart) {
                        return interpolate(
                            f,
                            [fadeOutStart, TOTAL_FRAMES],
                            [BGM_VOLUME, 0],
                            { extrapolateRight: 'clamp' }
                        );
                    }
                    return BGM_VOLUME;
                }}
            />
        </AbsoluteFill>
    );
};

export { TOTAL_FRAMES };
