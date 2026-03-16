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
const BGM_VOLUME = 0.05;           // ★ BGM音量（0.0〜1.0）ここを変更して調整
const BGM_FADE_OUT_FRAMES = 90;    // フェードアウトのフレーム数（30fps × 3秒 = 90）

// ============================================================
// キャラクター設定
// ============================================================
const SIDEBAR_WIDTH = 380;

// 各キャラの立ち絵バリエーション（セリフごとにローテーション）
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

/**
 * セリフのインデックスからキャラ画像パスを決定（ローテーション）
 */
function getImageForEntry(speaker: string, entryIndex: number): string | null {
    const variants = CHARACTER_IMAGE_VARIANTS[speaker];
    if (!variants || variants.length === 0) return null;
    return variants[entryIndex % variants.length];
}

// アニメーション設定
const ANIM = {
    swapFrames: 10,         // スワップアニメーションのフレーム数 (~0.33秒)
    inactiveOpacity: 0.5,   // 喋っていないときの不透明度
    slideDistance: 80,      // スライドする距離(px)
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

/**
 * 現在フレームの直前のセリフエントリを取得
 * （話者が変わったかどうかの判定用）
 */
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
}> = ({ currentSpeaker, currentImagePath, previousSpeaker, previousImagePath, framesSinceSpeakerChange, frame }) => {
    const speakerChanged = currentSpeaker !== previousSpeaker;
    const isTransitioning = speakerChanged && framesSinceSpeakerChange < ANIM.swapFrames;

    return (
        <>
            {/* 現在の話者: スライドイン */}
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

            {/* 前の話者: スライドアウト（トランジション中のみ） */}
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
// キャラクターレイヤー（個別キャラの描画）
// ============================================================
const CharacterLayer: React.FC<{
    imagePath: string;
    phase: 'entering' | 'active' | 'exiting';
    progress: number; // 0→1 でアニメーション進行
    zIndex: number;
}> = ({ imagePath, phase, progress, zIndex }) => {
    let opacity: number;
    let translateY: number;

    switch (phase) {
        case 'entering':
            // 下からスライドイン + フェードイン
            opacity = interpolate(progress, [0, 1], [0, 1], {
                extrapolateRight: 'clamp',
            });
            translateY = interpolate(progress, [0, 1], [ANIM.slideDistance, 0], {
                extrapolateRight: 'clamp',
            });
            break;
        case 'active':
            // 通常表示
            opacity = 1;
            translateY = 0;
            break;
        case 'exiting':
            // 下にスライドアウト + フェードアウト
            opacity = interpolate(progress, [0, 1], [1, 0], {
                extrapolateRight: 'clamp',
            });
            translateY = interpolate(progress, [0, 1], [0, ANIM.slideDistance], {
                extrapolateRight: 'clamp',
            });
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
    const headerTitle = currentEntry?.sceneTitle ?? 'あなたの注意力は"商品"として売られている';

    const currentSpeaker = currentEntry?.speaker ?? null;
    const previousSpeaker = previousEntry?.speaker ?? null;

    // セリフのインデックスから画像を決定
    const currentIndex = currentEntry ? SUBTITLE_DATA.indexOf(currentEntry) : 0;
    const previousIndex = previousEntry ? SUBTITLE_DATA.indexOf(previousEntry) : 0;
    const currentImagePath = currentSpeaker ? getImageForEntry(currentSpeaker, currentIndex) : null;
    const previousImagePath = previousSpeaker ? getImageForEntry(previousSpeaker, previousIndex) : null;

    // 現在のセリフが始まってからのフレーム数
    const framesSinceSpeakerChange = currentEntry
        ? frame - currentEntry.startFrame
        : ANIM.swapFrames; // セリフがないときはアニメーション完了状態

    // シーン進捗の計算
    const currentSceneId = currentEntry?.sceneId ?? 0;
    const progressPercent = Math.round((frame / TOTAL_FRAMES) * 100);

    // シーンリストを抽出（重複排除）
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

    // スムーズなスクロールオフセット計算
    const currentSceneStartFrame = currentSceneIdx >= 0 ? sceneList[currentSceneIdx].startFrame : 0;
    const framesSinceSceneChange = frame - currentSceneStartFrame;
    const animProgress = Math.min(framesSinceSceneChange / CHAPTER_ANIM_FRAMES, 1);
    const prevSceneIdx = currentSceneIdx > 0 ? currentSceneIdx - 1 : 0;
    const smoothIdx = interpolate(animProgress, [0, 1], [prevSceneIdx, currentSceneIdx], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill>
            {/* キャラクター立ち絵（字幕より背面） */}
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
                        ATTENTION ECONOMY
                    </div>
                    <div style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: '#374151',
                        lineHeight: 1.3,
                        fontFamily: '"Zen Maru Gothic", sans-serif',
                    }}>
                        あなたの注意力は「商品」として売られている
                    </div>
                    <div style={{
                        width: 50,
                        height: 3,
                        background: 'linear-gradient(90deg, rgba(239,68,68,0.6), rgba(251,146,60,0.4))',
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
                            color: 'rgba(239, 68, 68, 0.8)',
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
                            background: 'linear-gradient(90deg, #ef4444, #fb923c)',
                            borderRadius: 3,
                        }} />
                    </div>
                </div>

                {/* チャプターリスト（スライドアニメーション付き） */}
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
                    {/* スクロールウィンドウ */}
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
                                        {/* アクセントドット */}
                                        <div style={{
                                            width: isCurrent ? 8 : 5,
                                            height: isCurrent ? 8 : 5,
                                            borderRadius: '50%',
                                            backgroundColor: isCurrent ? '#ef4444' : 'rgba(107,114,128,0.3)',
                                            boxShadow: isCurrent ? '0 0 8px rgba(239,68,68,0.5)' : 'none',
                                            flexShrink: 0,
                                        }} />
                                        <span style={{
                                            fontSize: isCurrent ? 15 : 13,
                                            fontWeight: isCurrent ? 800 : 500,
                                            color: isCurrent ? '#dc2626' : '#6B7280',
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

                {/* 話者インジケーター（下寄せ、キャラの上） */}
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
                            backgroundColor: currentEntry?.speakerColor ?? '#ef4444',
                            boxShadow: `0 0 8px ${currentEntry?.speakerColor ?? '#ef4444'}`,
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

            {/* レイアウト + 動画 + 字幕（キャラより前面） */}
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
                    src={staticFile('videos/attention_economy.mp4')}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </MathLayout>

            {/* BGM（ループ再生 + 終了時フェードアウト） */}
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
