import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Subtitle } from '../../components/ui/Subtitle';

// ============================================================
// このデモで実証したいこと:
//   「セリフに合わせて要素がポンポンと追加されていき、
//    前の要素は残り続ける」パターンが実現できるかどうか
// ============================================================

// --- 1. データ定義（ここだけLLMが出力してくる想定） ---
// ※ 今は durationFrames を手動で入れているが、
//    実際は音声生成後に自動計算して埋める
const SEGMENTS = [
    {
        speaker: 'ずんだもん',
        text: 'APIには3つのメリットがあるのだ！',
        speakerColor: '#22c55e',
        durationFrames: 90,
        action: null, // このセリフでは何も画面に追加しない
    },
    {
        speaker: 'ずんだもん',
        text: '1つ目は、複雑な処理をお任せできることなのだ！',
        speakerColor: '#22c55e',
        durationFrames: 100,
        action: { type: 'showListItem', index: 1, text: '複雑な処理をお任せできる' },
    },
    {
        speaker: '四国めたん',
        text: '2つ目は、開発スピードが格段に上がることね。',
        speakerColor: '#d6336c',
        durationFrames: 100,
        action: { type: 'showListItem', index: 2, text: '開発スピードが上がる' },
    },
    {
        speaker: 'ずんだもん',
        text: '3つ目は、外部の便利な機能を簡単に使えることなのだ！',
        speakerColor: '#22c55e',
        durationFrames: 110,
        action: { type: 'showListItem', index: 3, text: '外部の便利な機能を使える' },
    },
];

// --- 2. 各セグメントの「開始フレーム」を事前に計算 ---
// （連続して足し算していくだけ）
function calcStartFrames(segments: typeof SEGMENTS): number[] {
    let acc = 0;
    return segments.map((seg) => {
        const start = acc;
        acc += seg.durationFrames;
        return start;
    });
}
const START_FRAMES = calcStartFrames(SEGMENTS);

// --- 3. 1行だけを描画する独立した ListItem コンポーネント ---
// ※ リスト全体は知らない。ただ「index と text を受け取って表示する」だけ
const ITEM_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#a855f7'];

const ListItem: React.FC<{ index: number; text: string; appearFrame: number }> = ({
    index,
    text,
    appearFrame,
}) => {
    const frame = useCurrentFrame();
    // このコンポーネントが「現れるべきフレーム」からの経過フレームを計算
    const localFrame = frame - appearFrame;

    // FadeIn + 下からスライドアップ
    const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const translateY = interpolate(localFrame, [0, 15], [30, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const color = ITEM_COLORS[(index - 1) % ITEM_COLORS.length];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                opacity,
                transform: `translateY(${translateY}px)`,
                marginBottom: 20,
            }}
        >
            {/* 番号バッジ */}
            <div
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 'bold',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${color}66`,
                }}
            >
                {index}
            </div>
            {/* テキスト */}
            <span style={{ fontSize: 38, color: '#1e293b', fontWeight: 600 }}>{text}</span>
        </div>
    );
};

// --- 4. メインのコンポーネント ---
export const AccumulateDemo: React.FC = () => {
    const frame = useCurrentFrame();

    // 「現在のフレームがどのセグメントの時間帯か」を特定
    const currentSegmentIndex = START_FRAMES.reduce((acc, start, i) => {
        return frame >= start ? i : acc;
    }, 0);

    const currentSegment = SEGMENTS[currentSegmentIndex];

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#f0f9ff',
                backgroundImage: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)',
                fontFamily: '"Noto Sans JP", sans-serif',
                padding: '60px 80px',
            }}
        >
            {/* タイトル */}
            <h1 style={{ fontSize: 48, color: '#0f172a', fontWeight: 800, marginBottom: 40, marginTop: 0 }}>
                APIを使う3つのメリット
            </h1>

            {/* ★ ここが核心部分 ★
                各セグメントを全部ループして、
                「現在のフレームが開始フレームを超えているか？」をチェックする。
                超えていて、かつ action がある場合だけ ListItem を描画する。
                → 一度描画されたら frame が戻らない限り消えない（残り続ける）
            */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {SEGMENTS.map((seg, i) => {
                    const started = frame >= START_FRAMES[i];
                    if (!started || !seg.action || seg.action.type !== 'showListItem') return null;

                    return (
                        <ListItem
                            key={i}
                            index={seg.action.index}
                            text={seg.action.text}
                            // このアイテムが「何フレーム目に出現するか」を渡す
                            // → ListItem 内でFadeInのタイミングを自分で計算できる
                            appearFrame={START_FRAMES[i]}
                        />
                    );
                })}
            </div>

            {/* 字幕：現在のセグメントのセリフだけを表示する */}
            <Subtitle
                speaker={currentSegment.speaker}
                text={currentSegment.text}
                speakerColor={currentSegment.speakerColor}
                appearFrame={START_FRAMES[currentSegmentIndex]}
            />
        </AbsoluteFill>
    );
};
