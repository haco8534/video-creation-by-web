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
    const headerTitle = currentEntry?.sceneTitle ?? 'マシュマロ実験の真実';

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
                    src={staticFile('videos/marshmallow_experiment.mp4')}
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
