import React from 'react';
import {
    OffthreadVideo,
    useCurrentFrame,
    staticFile,
} from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { SUBTITLE_DATA, TOTAL_FRAMES, SubtitleEntry } from './subtitleData';

// ============================================================
// 現在のフレームに対応する字幕エントリを取得
// ============================================================
function getCurrentSubtitle(
    frame: number,
    data: SubtitleEntry[]
): SubtitleEntry | null {
    // 最後に startFrame <= frame となるエントリを探す
    let result: SubtitleEntry | null = null;
    for (const entry of data) {
        if (entry.startFrame <= frame) {
            result = entry;
        } else {
            break;
        }
    }

    // セリフ終了後（duration + 少し余裕）まで表示
    if (result) {
        const endFrame = result.startFrame + result.durationFrames + 9; // 0.3s余裕
        if (frame > endFrame) {
            return null;
        }
    }

    return result;
}

// ============================================================
// メインコンポーネント
// ============================================================
export const VideoWithSubtitles: React.FC = () => {
    const frame = useCurrentFrame();

    const currentEntry = getCurrentSubtitle(frame, SUBTITLE_DATA);

    // 現在のシーンタイトルをヘッダーに表示
    const headerTitle = currentEntry?.sceneTitle ?? '1万時間の法則';

    return (
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
            {/* メインコンテンツ領域に動画をフル表示 */}
            <OffthreadVideo
                src={staticFile('videos/10000h_effort.mp4')}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </MathLayout>
    );
};

export { TOTAL_FRAMES };
