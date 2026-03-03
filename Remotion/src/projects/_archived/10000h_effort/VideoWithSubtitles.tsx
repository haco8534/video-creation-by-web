import React from 'react';
import {
    AbsoluteFill,
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
// キャラクター設定
// ============================================================
const SIDEBAR_WIDTH = 380;

const CHARACTER_IMAGES: Record<string, string> = {
    'ずんだもん': 'characters/zundamon/default.png',
    'めたん': 'characters/metan/default.png',
};

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
    previousSpeaker: string | null;
    framesSinceSpeakerChange: number;
    frame: number;
}> = ({ currentSpeaker, previousSpeaker, framesSinceSpeakerChange, frame }) => {
    const speakerChanged = currentSpeaker !== previousSpeaker;
    const isTransitioning = speakerChanged && framesSinceSpeakerChange < ANIM.swapFrames;

    return (
        <>
            {/* 現在の話者: スライドイン */}
            {currentSpeaker && CHARACTER_IMAGES[currentSpeaker] && (
                <CharacterLayer
                    imagePath={CHARACTER_IMAGES[currentSpeaker]}
                    phase={isTransitioning ? 'entering' : 'active'}
                    progress={isTransitioning
                        ? framesSinceSpeakerChange / ANIM.swapFrames
                        : 1
                    }
                    zIndex={20}
                />
            )}

            {/* 前の話者: スライドアウト（トランジション中のみ） */}
            {isTransitioning && previousSpeaker && CHARACTER_IMAGES[previousSpeaker] && (
                <CharacterLayer
                    imagePath={CHARACTER_IMAGES[previousSpeaker]}
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
    const headerTitle = currentEntry?.sceneTitle ?? '1万時間の法則';

    const currentSpeaker = currentEntry?.speaker ?? null;
    const previousSpeaker = previousEntry?.speaker ?? null;

    // 現在のセリフが始まってからのフレーム数
    const framesSinceSpeakerChange = currentEntry
        ? frame - currentEntry.startFrame
        : ANIM.swapFrames; // セリフがないときはアニメーション完了状態

    return (
        <AbsoluteFill>
            {/* キャラクター立ち絵（字幕より背面） */}
            <SpeakerSwapSprite
                currentSpeaker={currentSpeaker}
                previousSpeaker={
                    currentSpeaker !== previousSpeaker ? previousSpeaker : null
                }
                framesSinceSpeakerChange={framesSinceSpeakerChange}
                frame={frame}
            />

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
                    src={staticFile('videos/10000h_effort.mp4')}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </MathLayout>
        </AbsoluteFill>
    );
};

export { TOTAL_FRAMES };
