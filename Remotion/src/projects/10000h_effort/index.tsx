import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { MathLayout } from '../../components/layouts/MathLayout';
import { Subtitle } from '../../components/ui/Subtitle';
import { FadeIn } from '../../components/animation/FadeIn';
import { SlideIn } from '../../components/animation/SlideIn';
import { ScaleIn } from '../../components/animation/ScaleIn';
import { InfoCallout } from '../../components/ui/InfoCallout';
import { ComparisonTable } from '../../components/ui/ComparisonTable';
import { FlowSteps } from '../../components/ui/FlowSteps';
import { Card } from '../../components/ui/Card';
import { calcStartFrames, S1, S2, S3, S4, S5, S6, Segment } from './segments';

// 共通: 字幕つきMathLayoutのラッパー
function useScene(segments: Segment[], offset: number) {
    const frame = useCurrentFrame();
    const lf = frame - offset;
    const sf = calcStartFrames(segments);
    const ci = sf.reduce((a, s, i) => lf >= s ? i : a, 0);
    return { frame, lf, sf, ci, cur: segments[ci] };
}

// ============================================================
// シーン1: 導入 — タイトルカード → リスト → 引用カード → 大数字
// ============================================================
const Scene1: React.FC<{ offset: number }> = ({ offset }) => {
    const { lf, sf, ci, cur } = useScene(S1, offset);
    // Phase: 0-4=intro+list, 5-8=quote, 9+=bigNumber
    const phase = lf < sf[5] ? 'intro' : lf < sf[9] ? 'quote' : 'bignum';

    return (
        <MathLayout title="「1万時間の法則」って何？" subtitle={
            <Subtitle speaker={cur.speaker} text={cur.text} speakerColor={cur.speakerColor} appearFrame={sf[ci] + offset} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1200, alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {/* Phase: intro — タイトル＋リスト */}
                {phase === 'intro' && (<FadeIn appearFrame={sf[0] + offset}>
                    {lf >= sf[0] && (
                        <ScaleIn appearFrame={sf[0] + offset} overshoot>
                            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 20, padding: '24px 48px', textAlign: 'center' }}>
                                <span style={{ fontSize: 48, fontWeight: 800, color: 'white' }}>「1万時間の法則」って何？</span>
                            </div>
                        </ScaleIn>
                    )}
                    {lf >= sf[1] && (
                        <SlideIn direction="up" appearFrame={sf[1] + offset}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <span style={{ fontSize: 48 }}>🎯</span>
                                <span style={{ fontSize: 34, color: '#1e293b', fontWeight: 600 }}>1万時間がんばれば一流になれる</span>
                            </div>
                        </SlideIn>
                    )}
                    {lf >= sf[3] && (
                        <SlideIn direction="up" appearFrame={sf[3] + offset}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <span style={{ fontSize: 48 }}>⏰</span>
                                <span style={{ fontSize: 34, color: '#1e293b', fontWeight: 600 }}>1日3時間 × 10年 = 1万時間</span>
                            </div>
                        </SlideIn>
                    )}
                </FadeIn>)}

                {/* Phase: quote — 研究者の否定を引用カードで */}
                {phase === 'quote' && (<FadeIn appearFrame={sf[5] + offset}>
                    {lf >= sf[7] && (
                        <FadeIn appearFrame={sf[7] + offset}>
                            <Card bg="rgba(239, 68, 68, 0.06)" borderColor="rgba(239, 68, 68, 0.25)">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
                                    <span style={{ fontSize: 44, color: '#ef4444', fontWeight: 300 }}>❝</span>
                                    <span style={{ fontSize: 30, color: '#1e293b', fontWeight: 500, lineHeight: 1.6, fontStyle: 'italic' }}>
                                        そんなこと言ってない
                                    </span>
                                    <span style={{ fontSize: 22, color: '#64748b', textAlign: 'right' }}>
                                        ── 法則を生み出したとされる研究者本人
                                    </span>
                                </div>
                            </Card>
                        </FadeIn>
                    )}
                    <FadeIn appearFrame={sf[5] + offset}>
                        <InfoCallout type="warning" text="この法則の生みの親とされる研究者本人が否定している！" appearFrame={sf[5] + offset} />
                    </FadeIn>
                </FadeIn>)}

                {/* Phase: bignum — 12%を大きく表示 */}
                {phase === 'bignum' && (<FadeIn appearFrame={sf[9] + offset}>
                    <ScaleIn appearFrame={sf[9] + offset} overshoot>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 140, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>12%</span>
                            <span style={{ fontSize: 28, color: '#64748b' }}>練習量が結果の差を説明できる割合</span>
                        </div>
                    </ScaleIn>
                    {lf >= sf[10] && (
                        <FadeIn appearFrame={sf[10] + offset}>
                            <span style={{ fontSize: 32, color: '#475569', fontWeight: 600, textAlign: 'center' }}>
                                残りの88%は……？
                            </span>
                        </FadeIn>
                    )}
                </FadeIn>)}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン2: 元の研究 — リスト → 比較表 → フロー図 → 引用カード
// ============================================================
const Scene2: React.FC<{ offset: number }> = ({ offset }) => {
    const { frame, lf, sf, ci, cur } = useScene(S2, offset);
    // Phase: 0-6=list, 7-9=flow(意図的練習), 10-14=comparison+quote
    const phase = lf < sf[7] ? 'list' : lf < sf[10] ? 'flow' : 'compare';

    return (
        <MathLayout title="元の研究を見てみよう" subtitle={
            <Subtitle speaker={cur.speaker} text={cur.text} speakerColor={cur.speakerColor} appearFrame={sf[ci] + offset} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1200, flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {phase === 'list' && (<FadeIn appearFrame={sf[0] + offset}>
                    {lf >= sf[0] && (
                        <ScaleIn appearFrame={sf[0] + offset} overshoot>
                            <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: 20, padding: '20px 40px', textAlign: 'center' }}>
                                <span style={{ fontSize: 42, fontWeight: 800, color: 'white' }}>元の研究を見てみよう</span>
                            </div>
                        </ScaleIn>
                    )}
                    {lf >= sf[2] && (
                        <SlideIn direction="up" appearFrame={sf[2] + offset}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <span style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', flexShrink: 0 }}>1</span>
                                <span style={{ fontSize: 32, color: '#1e293b', fontWeight: 600 }}>1993年 エリクソン教授の研究</span>
                            </div>
                        </SlideIn>
                    )}
                    {lf >= sf[4] && (
                        <SlideIn direction="up" appearFrame={sf[4] + offset}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <span style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#a855f7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', flexShrink: 0 }}>2</span>
                                <span style={{ fontSize: 32, color: '#1e293b', fontWeight: 600 }}>対象：バイオリン専攻の学生のみ</span>
                            </div>
                        </SlideIn>
                    )}
                    {lf >= sf[5] && (
                        <FadeIn appearFrame={sf[5] + offset}>
                            <InfoCallout type="warning" text="1万時間は「平均値」— 全員が達成したわけではない" appearFrame={sf[5] + offset} />
                        </FadeIn>
                    )}
                </FadeIn>)}

                {/* Phase: flow — 意図的練習のステップ */}
                {phase === 'flow' && (<FadeIn appearFrame={sf[7] + offset}>
                    <FadeIn appearFrame={sf[7] + offset}>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 36, fontWeight: 700, color: '#4338ca' }}>💡 意図的練習（Deliberate Practice）とは？</span>
                        </div>
                    </FadeIn>
                    <FlowSteps
                        steps={['目標設定', '快適ゾーンの外へ', 'フィードバック', '弱点克服']}
                        startFrames={[sf[9] + offset, sf[9] + offset + 8, sf[9] + offset + 16, sf[9] + offset + 24]}
                        frame={frame}
                    />
                    <FadeIn appearFrame={sf[9] + offset + 30}>
                        <InfoCallout type="info" text="ただ漫然と繰り返すのではなく、構造化された練習が鍵" appearFrame={sf[9] + offset + 30} />
                    </FadeIn>
                </FadeIn>)}

                {/* Phase: compare — 比較表 + 引用 */}
                {phase === 'compare' && (<FadeIn appearFrame={sf[10] + offset}>
                    <FadeIn appearFrame={sf[10] + offset}>
                        <ComparisonTable
                            titleA="グラッドウェルの主張"
                            titleB="エリクソンの実際の研究"
                            itemsA={['1万時間で誰でもプロになれる', 'どんな分野にも適用可能', '量（時間数）が最重要']}
                            itemsB={['1万時間は平均値に過ぎない', 'バイオリン専攻のみの研究', '質（意図的練習）が最重要']}
                            appearFrame={sf[10] + offset}
                        />
                    </FadeIn>
                    {lf >= sf[12] && (
                        <FadeIn appearFrame={sf[12] + offset}>
                            <Card bg="rgba(239, 68, 68, 0.06)" borderColor="rgba(239, 68, 68, 0.25)">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
                                    <span style={{ fontSize: 40, color: '#ef4444' }}>❝</span>
                                    <span style={{ fontSize: 28, color: '#1e293b', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.6 }}>
                                        グラッドウェルは私の研究を複数の点で間違って解釈している
                                    </span>
                                    <span style={{ fontSize: 20, color: '#64748b', textAlign: 'right' }}>── アンダース・エリクソン教授</span>
                                </div>
                            </Card>
                        </FadeIn>
                    )}
                </FadeIn>)}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン3: 残酷なデータ① — 横並び数値カード → 大数字 → 対比カード
// ============================================================
const Scene3: React.FC<{ offset: number }> = ({ offset }) => {
    const { lf, sf, ci, cur } = useScene(S3, offset);
    // Phase: 0-3=intro, 4-10=dataCards, 11-12=bigNum, 13+=chessDiff
    const phase = lf < sf[4] ? 'intro' : lf < sf[11] ? 'data' : lf < sf[13] ? 'bignum' : 'chess';

    return (
        <MathLayout title="残酷なデータ① 練習量の限界" subtitle={
            <Subtitle speaker={cur.speaker} text={cur.text} speakerColor={cur.speakerColor} appearFrame={sf[ci] + offset} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1200, alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {phase === 'intro' && (<FadeIn appearFrame={sf[0] + offset}>
                    <ScaleIn appearFrame={sf[0] + offset} overshoot>
                        <div style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', borderRadius: 20, padding: '20px 40px', textAlign: 'center' }}>
                            <span style={{ fontSize: 42, fontWeight: 800, color: 'white' }}>練習量が説明できるのは たった12%</span>
                        </div>
                    </ScaleIn>
                    {lf >= sf[2] && (
                        <FadeIn appearFrame={sf[2] + offset}>
                            <InfoCallout type="info" text="88論文・11,000人超のメタ分析（2014年）" appearFrame={sf[2] + offset} />
                        </FadeIn>
                    )}
                </FadeIn>)}

                {/* 横並び数値カード */}
                {phase === 'data' && (<FadeIn appearFrame={sf[4] + offset}>
                    <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                        {[
                            { pct: '26%', label: 'ゲーム', color: '#0ea5e9', seg: 4 },
                            { pct: '21%', label: '音楽', color: '#8b5cf6', seg: 5 },
                            { pct: '18%', label: 'スポーツ', color: '#f59e0b', seg: 5 },
                        ].map((d, i) => lf >= sf[d.seg] && (
                            <SlideIn key={i} direction="up" appearFrame={sf[d.seg] + offset + i * 5}>
                                <Card bg={`${d.color}10`} borderColor={`${d.color}40`}>
                                    <div style={{ textAlign: 'center', padding: 8 }}>
                                        <div style={{ fontSize: 56, fontWeight: 900, color: d.color }}>{d.pct}</div>
                                        <div style={{ fontSize: 24, color: '#64748b', marginTop: 4 }}>{d.label}</div>
                                    </div>
                                </Card>
                            </SlideIn>
                        ))}
                    </div>
                    {lf >= sf[7] && (
                        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                            <SlideIn direction="up" appearFrame={sf[7] + offset}>
                                <Card bg="rgba(239, 68, 68, 0.08)" borderColor="rgba(239, 68, 68, 0.3)">
                                    <div style={{ textAlign: 'center', padding: 8 }}>
                                        <div style={{ fontSize: 56, fontWeight: 900, color: '#ef4444' }}>4%</div>
                                        <div style={{ fontSize: 24, color: '#64748b', marginTop: 4 }}>教育</div>
                                    </div>
                                </Card>
                            </SlideIn>
                            {lf >= sf[9] && (
                                <SlideIn direction="up" appearFrame={sf[9] + offset}>
                                    <Card bg="rgba(220, 38, 38, 0.12)" borderColor="rgba(220, 38, 38, 0.4)">
                                        <div style={{ textAlign: 'center', padding: 8 }}>
                                            <div style={{ fontSize: 56, fontWeight: 900, color: '#dc2626' }}>&lt;1%</div>
                                            <div style={{ fontSize: 24, color: '#64748b', marginTop: 4 }}>職業</div>
                                        </div>
                                    </Card>
                                </SlideIn>
                            )}
                        </div>
                    )}
                </FadeIn>)}

                {/* 大数字 12% */}
                {phase === 'bignum' && (<FadeIn appearFrame={sf[11] + offset}>
                    <ScaleIn appearFrame={sf[11] + offset} overshoot>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: 160, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>12%</span>
                            <span style={{ fontSize: 30, color: '#64748b' }}>全分野平均 — 残りの88%は練習量以外</span>
                        </div>
                    </ScaleIn>
                </FadeIn>)}

                {/* チェスの差を横並び対比カード */}
                {phase === 'chess' && (<FadeIn appearFrame={sf[13] + offset}>
                    <FadeIn appearFrame={sf[13] + offset}>
                        <span style={{ fontSize: 32, fontWeight: 700, color: '#334155', textAlign: 'center' }}>
                            ♟️ チェス「マスター」到達にかかった時間
                        </span>
                    </FadeIn>
                    <div style={{ display: 'flex', gap: 24, width: '100%' }}>
                        <SlideIn direction="left" appearFrame={sf[13] + offset}>
                            <Card bg="rgba(16, 185, 129, 0.08)" borderColor="rgba(16, 185, 129, 0.3)">
                                <div style={{ textAlign: 'center', padding: 16 }}>
                                    <div style={{ fontSize: 20, color: '#64748b' }}>最速</div>
                                    <div style={{ fontSize: 64, fontWeight: 900, color: '#10b981' }}>728h</div>
                                </div>
                            </Card>
                        </SlideIn>
                        <SlideIn direction="right" appearFrame={sf[14] + offset}>
                            <Card bg="rgba(239, 68, 68, 0.08)" borderColor="rgba(239, 68, 68, 0.3)">
                                <div style={{ textAlign: 'center', padding: 16 }}>
                                    <div style={{ fontSize: 20, color: '#64748b' }}>最遅</div>
                                    <div style={{ fontSize: 64, fontWeight: 900, color: '#ef4444' }}>16,120h</div>
                                    <div style={{ fontSize: 22, color: '#ef4444', fontWeight: 600 }}>22倍の差！</div>
                                </div>
                            </Card>
                        </SlideIn>
                    </div>
                    {lf >= sf[15] && (
                        <FadeIn appearFrame={sf[15] + offset}>
                            <InfoCallout type="warning" text="25,000時間以上練習してもマスターになれなかった人もいる" appearFrame={sf[15] + offset} />
                        </FadeIn>
                    )}
                </FadeIn>)}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン4: 遺伝の壁 — リスト → 対比カード(車の例え) → データ → 希望
// ============================================================
const Scene4: React.FC<{ offset: number }> = ({ offset }) => {
    const { lf, sf, ci, cur } = useScene(S4, offset);
    const phase = lf < sf[5] ? 'stats' : lf < sf[8] ? 'analogy' : lf < sf[12] ? 'more' : 'hope';

    return (
        <MathLayout title="遺伝という「見えない天井」" subtitle={
            <Subtitle speaker={cur.speaker} text={cur.text} speakerColor={cur.speakerColor} appearFrame={sf[ci] + offset} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1200, alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {phase === 'stats' && (<FadeIn appearFrame={sf[0] + offset}>
                    <ScaleIn appearFrame={sf[0] + offset} overshoot>
                        <div style={{ background: 'linear-gradient(135deg, #dc2626, #9333ea)', borderRadius: 20, padding: '20px 40px', textAlign: 'center' }}>
                            <span style={{ fontSize: 40, fontWeight: 800, color: 'white' }}>残酷なデータ② 遺伝の壁</span>
                        </div>
                    </ScaleIn>
                    {lf >= sf[2] && (<SlideIn direction="up" appearFrame={sf[2] + offset}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span style={{ fontSize: 40 }}>🧬</span>
                            <span style={{ fontSize: 32, color: '#1e293b', fontWeight: 600 }}>運動能力の遺伝率：30〜80%</span>
                        </div>
                    </SlideIn>)}
                    {lf >= sf[3] && (<SlideIn direction="up" appearFrame={sf[3] + offset}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span style={{ fontSize: 40 }}>🫁</span>
                            <span style={{ fontSize: 32, color: '#1e293b', fontWeight: 600 }}>VO2max（持久力）遺伝率：59〜72%</span>
                        </div>
                    </SlideIn>)}
                </FadeIn>)}

                {/* 車のアナロジー — 横並びカード */}
                {phase === 'analogy' && (<FadeIn appearFrame={sf[5] + offset}>
                    <FadeIn appearFrame={sf[5] + offset}>
                        <span style={{ fontSize: 30, fontWeight: 700, color: '#334155' }}>🧬 ACTN3遺伝子（スピード遺伝子）</span>
                    </FadeIn>
                    <div style={{ display: 'flex', gap: 24, width: '100%' }}>
                        <SlideIn direction="left" appearFrame={sf[5] + offset}>
                            <Card bg="rgba(239, 68, 68, 0.06)" borderColor="rgba(239, 68, 68, 0.25)">
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <span style={{ fontSize: 48 }}>🏎️</span>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444', marginTop: 8 }}>RR型</div>
                                    <div style={{ fontSize: 22, color: '#64748b' }}>速筋発達 → 瞬発系向き</div>
                                    <div style={{ fontSize: 20, color: '#94a3b8', marginTop: 4 }}>スポーツカーのエンジン</div>
                                </div>
                            </Card>
                        </SlideIn>
                        <SlideIn direction="right" appearFrame={sf[7] + offset}>
                            <Card bg="rgba(14, 165, 233, 0.06)" borderColor="rgba(14, 165, 233, 0.25)">
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <span style={{ fontSize: 48 }}>🚗</span>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0ea5e9', marginTop: 8 }}>XX型</div>
                                    <div style={{ fontSize: 22, color: '#64748b' }}>遅筋優位 → 持久系向き</div>
                                    <div style={{ fontSize: 20, color: '#94a3b8', marginTop: 4 }}>軽自動車のエンジン</div>
                                </div>
                            </Card>
                        </SlideIn>
                    </div>
                </FadeIn>)}

                {phase === 'more' && (<FadeIn appearFrame={sf[8] + offset}>
                    {lf >= sf[8] && (<SlideIn direction="up" appearFrame={sf[8] + offset}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span style={{ fontSize: 40 }}>📊</span>
                            <span style={{ fontSize: 32, color: '#1e293b', fontWeight: 600 }}>トレーニング反応性の遺伝率：約47%</span>
                        </div>
                    </SlideIn>)}
                    {lf >= sf[10] && (<SlideIn direction="up" appearFrame={sf[10] + offset}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span style={{ fontSize: 40 }}>🧠</span>
                            <span style={{ fontSize: 32, color: '#1e293b', fontWeight: 600 }}>認知能力（IQ等）遺伝率：50〜70%</span>
                        </div>
                    </SlideIn>)}
                </FadeIn>)}

                {phase === 'hope' && (<FadeIn appearFrame={sf[12] + offset}>
                    <FadeIn appearFrame={sf[12] + offset}>
                        <InfoCallout type="success" text="遺伝は「天井の高さ」を決めるが、天井に近づく努力は自分次第。方向性と質が鍵。" appearFrame={sf[12] + offset} />
                    </FadeIn>
                </FadeIn>)}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン5: 正しい努力 — 比較表(Kind vs Wicked) → 対比カード → 結論
// ============================================================
const Scene5: React.FC<{ offset: number }> = ({ offset }) => {
    const { lf, sf, ci, cur } = useScene(S5, offset);
    const phase = lf < sf[3] ? 'intro' : lf < sf[5] ? 'compare' : lf < sf[8] ? 'athletes' : 'conclusion';

    return (
        <MathLayout title="正しい努力とは？" subtitle={
            <Subtitle speaker={cur.speaker} text={cur.text} speakerColor={cur.speakerColor} appearFrame={sf[ci] + offset} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1200, alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {phase === 'intro' && (<FadeIn appearFrame={sf[0] + offset}>
                    <ScaleIn appearFrame={sf[0] + offset} overshoot>
                        <div style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', borderRadius: 20, padding: '20px 40px', textAlign: 'center' }}>
                            <span style={{ fontSize: 42, fontWeight: 800, color: 'white' }}>じゃあ、正しい努力って何？</span>
                        </div>
                    </ScaleIn>
                    {lf >= sf[1] && (
                        <FadeIn appearFrame={sf[1] + offset}>
                            <InfoCallout type="info" text="量ではなく「質」を極限まで高めることが唯一の方法" appearFrame={sf[1] + offset} />
                        </FadeIn>
                    )}
                </FadeIn>)}

                {/* Kind vs Wicked 比較表 */}
                {phase === 'compare' && (<FadeIn appearFrame={sf[3] + offset}>
                    <FadeIn appearFrame={sf[3] + offset}>
                        <ComparisonTable
                            titleA="Kind環境 🎯"
                            titleB="Wicked環境 🌊"
                            itemsA={['ルールが明確', 'パターンが繰り返される', 'フィードバックが即座', '例: チェス、ゴルフ', '→ 早期専門化が有効']}
                            itemsB={['ルールが曖昧', '状況が常に変化', 'フィードバックが遅い', '例: ビジネス、科学', '→ 幅広い経験が有効']}
                            appearFrame={sf[3] + offset}
                        />
                    </FadeIn>
                </FadeIn>)}

                {/* ウッズ vs フェデラー */}
                {phase === 'athletes' && (<FadeIn appearFrame={sf[5] + offset}>
                    <div style={{ display: 'flex', gap: 24, width: '100%' }}>
                        <SlideIn direction="left" appearFrame={sf[5] + offset}>
                            <Card bg="rgba(239, 68, 68, 0.06)" borderColor="rgba(239, 68, 68, 0.2)">
                                <div style={{ textAlign: 'center', padding: 16 }}>
                                    <span style={{ fontSize: 56 }}>🏌️</span>
                                    <div style={{ fontSize: 30, fontWeight: 700, color: '#ef4444', marginTop: 8 }}>タイガー・ウッズ</div>
                                    <div style={{ fontSize: 24, color: '#64748b', marginTop: 4 }}>2歳からゴルフ一筋</div>
                                    <div style={{ fontSize: 22, color: '#94a3b8' }}>早期専門化型</div>
                                </div>
                            </Card>
                        </SlideIn>
                        <SlideIn direction="right" appearFrame={sf[5] + offset + 10}>
                            <Card bg="rgba(16, 185, 129, 0.06)" borderColor="rgba(16, 185, 129, 0.2)">
                                <div style={{ textAlign: 'center', padding: 16 }}>
                                    <span style={{ fontSize: 56 }}>🎾</span>
                                    <div style={{ fontSize: 30, fontWeight: 700, color: '#10b981', marginTop: 8 }}>ロジャー・フェデラー</div>
                                    <div style={{ fontSize: 24, color: '#64748b', marginTop: 4 }}>多種スポーツ経験後にテニスへ</div>
                                    <div style={{ fontSize: 22, color: '#94a3b8' }}>幅広経験型</div>
                                </div>
                            </Card>
                        </SlideIn>
                    </div>
                </FadeIn>)}

                {phase === 'conclusion' && (<FadeIn appearFrame={sf[9] + offset}>
                    {lf >= sf[9] && (
                        <FadeIn appearFrame={sf[9] + offset}>
                            <InfoCallout type="success" text="20時間ずつ試して適性を見極め → 本気を出すフィールドを選ぶ" appearFrame={sf[9] + offset} />
                        </FadeIn>
                    )}
                    {lf >= sf[11] && (
                        <ScaleIn appearFrame={sf[11] + offset} overshoot>
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1.6 }}>
                                    才能と努力は対立しない。<br />
                                    自分の強みを知り、質の高い努力を正しい方向へ。
                                </span>
                            </div>
                        </ScaleIn>
                    )}
                </FadeIn>)}
            </div>
        </MathLayout>
    );
};

// ============================================================
// シーン6: まとめ — リスト → 大テキスト → 最終メッセージ
// ============================================================
const Scene6: React.FC<{ offset: number }> = ({ offset }) => {
    const { lf, sf, ci, cur } = useScene(S6, offset);
    const phase = lf < sf[4] ? 'recap' : lf < sf[7] ? 'takeaway' : 'ending';

    return (
        <MathLayout title="まとめ──努力の「正しい使い方」" subtitle={
            <Subtitle speaker={cur.speaker} text={cur.text} speakerColor={cur.speakerColor} appearFrame={sf[ci] + offset} />
        }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1200, alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {phase === 'recap' && (<FadeIn appearFrame={sf[0] + offset}>
                    <ScaleIn appearFrame={sf[0] + offset} overshoot>
                        <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 20, padding: '20px 40px', textAlign: 'center' }}>
                            <span style={{ fontSize: 42, fontWeight: 800, color: 'white' }}>まとめ</span>
                        </div>
                    </ScaleIn>
                    {lf >= sf[1] && (<SlideIn direction="up" appearFrame={sf[1] + offset}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span style={{ fontSize: 36 }}>❌</span>
                            <span style={{ fontSize: 32, color: '#ef4444', fontWeight: 600 }}>1万時間の法則 → 科学的に誇張された俗説</span>
                        </div>
                    </SlideIn>)}
                    {lf >= sf[2] && (<SlideIn direction="up" appearFrame={sf[2] + offset}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span style={{ fontSize: 36 }}>📊</span>
                            <span style={{ fontSize: 32, color: '#475569', fontWeight: 600 }}>88%は遺伝・環境・練習の質で決まる</span>
                        </div>
                    </SlideIn>)}
                </FadeIn>)}

                {phase === 'takeaway' && (<FadeIn appearFrame={sf[5] + offset}>
                    <FadeIn appearFrame={sf[5] + offset}>
                        <Card bg="rgba(16, 185, 129, 0.08)" borderColor="rgba(16, 185, 129, 0.3)">
                            <div style={{ textAlign: 'center', padding: 24 }}>
                                <span style={{ fontSize: 36, fontWeight: 800, color: '#10b981' }}>✅ 正しい努力</span>
                                <div style={{ fontSize: 30, color: '#1e293b', fontWeight: 600, marginTop: 16, lineHeight: 1.8 }}>
                                    適性 × 意図的練習 × 環境
                                </div>
                            </div>
                        </Card>
                    </FadeIn>
                </FadeIn>)}

                {phase === 'ending' && (<FadeIn appearFrame={sf[7] + offset}>
                    <FadeIn appearFrame={sf[7] + offset}>
                        <ScaleIn appearFrame={sf[7] + offset} overshoot>
                            <div style={{ textAlign: 'center', padding: 24 }}>
                                <span style={{ fontSize: 38, fontWeight: 700, color: '#0f172a', lineHeight: 1.8 }}>
                                    本当のことを知った上で努力する方が<br />
                                    <span style={{ color: '#6366f1', fontSize: 44 }}>絶対に強い。</span>
                                </span>
                            </div>
                        </ScaleIn>
                    </FadeIn>
                    {lf >= sf[9] && (
                        <FadeIn appearFrame={sf[9] + offset}>
                            <InfoCallout type="success" text="自分の才能を見極めて、正しい方向に、質の高い努力を。それが一番の近道。" appearFrame={sf[9] + offset} />
                        </FadeIn>
                    )}
                </FadeIn>)}
            </div>
        </MathLayout>
    );
};

// ============================================================
// フレーム数計算 & メインエクスポート
// ============================================================
const T1 = S1.reduce((s, seg) => s + seg.durationFrames, 0);
const T2 = S2.reduce((s, seg) => s + seg.durationFrames, 0);
const T3 = S3.reduce((s, seg) => s + seg.durationFrames, 0);
const T4 = S4.reduce((s, seg) => s + seg.durationFrames, 0);
const T5 = S5.reduce((s, seg) => s + seg.durationFrames, 0);
const T6 = S6.reduce((s, seg) => s + seg.durationFrames, 0);
export const TOTAL_FRAMES = T1 + T2 + T3 + T4 + T5 + T6;

export const TenThousandHoursEffort: React.FC = () => {
    const frame = useCurrentFrame();
    const e1 = T1, e2 = e1 + T2, e3 = e2 + T3, e4 = e3 + T4, e5 = e4 + T5;
    return (
        <AbsoluteFill>
            {frame < e1 && <Scene1 offset={0} />}
            {frame >= e1 && frame < e2 && <Scene2 offset={e1} />}
            {frame >= e2 && frame < e3 && <Scene3 offset={e2} />}
            {frame >= e3 && frame < e4 && <Scene4 offset={e3} />}
            {frame >= e4 && frame < e5 && <Scene5 offset={e4} />}
            {frame >= e5 && <Scene6 offset={e5} />}
        </AbsoluteFill>
    );
};
