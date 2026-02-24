// セグメントデータ定義（台本から抽出）
export type Segment = {
    speaker: string;
    text: string;
    speakerColor: string;
    durationFrames: number;
};

export function calcStartFrames(segments: { durationFrames: number }[]): number[] {
    let acc = 0;
    return segments.map((seg) => { const s = acc; acc += seg.durationFrames; return s; });
}

// Block 1: 導入
export const S1: Segment[] = [
    { speaker: '四国めたん', text: 'ねえずんだもん、「1万時間の法則」って聞いたことある？　何かを1万時間やれば、誰でもプロレベルになれるっていうやつ。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'もちろん知ってるのだ。ピアノでも、プログラミングでも、スポーツでも、とにかく1万時間がんばれば一流になれる。……そういう話なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'なんか夢があるよね。努力すれば誰でも報われるって。自己啓発本とかでもよく引用されてるし。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'そうそう。「1日3時間やれば、10年でプロになれますよ」みたいな感じで使われてるよね。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'うんうん、そういうの見ると「じゃあ自分もがんばろう」ってなるもん。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'うん。でもね、めたん。今日はちょっと残酷な話をするのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'え、いきなり不穏なんだけど。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'この「1万時間の法則」、実はこの法則を生み出したとされる研究者本人が、「そんなこと言ってない」って怒ってるの、知ってた？', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'え!?　本人が否定してるの!?', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'しかもね、その後に行われた大規模な研究で調べたら、練習量がパフォーマンスの差を説明できる割合は、たった12%だったのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '12%……？　残りの88%は何なの？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'それをこれから話していくのだ。この動画を見終わったら、「努力すれば報われる」っていう言葉の意味が、たぶんちょっと変わると思うよ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '……正直ちょっと怖いけど、聞きたい。「頑張れば何でもできる」って信じてたから。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'その気持ち、よくわかるのだ。でも、本当のことを知った上で努力する方がずっと強いのだ。じゃあまずは、この法則がどこから来たのか、元の研究を見てみるのだ。', speakerColor: '#22c55e', durationFrames: 999 },
];

// Block 2: 元の研究
export const S2: Segment[] = [
    { speaker: 'ずんだもん', text: '「1万時間の法則」を世界中に広めたのは、マルコム・グラッドウェルっていうジャーナリストなのだ。2008年の『天才! 成功する人々の法則』で紹介したんだよ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'あ、知ってる。ベストセラーだよね。ビル・ゲイツとかビートルズの話が出てくるやつ。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'でも、グラッドウェルが引用した元の研究は、1993年にアンダース・エリクソンが発表したものなのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'その研究ってどんな内容だったの？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '西ベルリンの音楽アカデミーで、バイオリン専攻の学生を3つのグループに分けて調べたのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'で、一番上のグループが20歳までに費やした練習時間の「平均」が、約1万時間だったのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'あ、「平均」なんだ。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'さらに言うと、エリクソン教授が本当に強調していたのは時間の「量」じゃなくて、「意図的練習」っていう練習の「質」だったのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '意図的練習？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '明確な目標を立てて、快適ゾーンの外に出て、すぐにフィードバックを受けて、弱点を体系的に潰していく。そういう構造化された練習のことなのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'じゃあグラッドウェルは、質の話をガッツリ無視して「とにかく1万時間やればOK」って広めちゃったんだ。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'しかもグラッドウェルの本では「どんな分野でも」って一般化してるけど、元の研究はクラシック音楽のバイオリニストだけを調べたものだったのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'エリクソン教授本人が、「グラッドウェルは私の研究を複数の点で間違って解釈している」って明言しているのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '元の研究者に否定されてる法則って、もうそれ法則じゃないじゃん……。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'でもね、話はここからがもっとすごいのだ。「じゃあ実際のところ、練習量ってどのくらい結果に効くの？」っていう疑問を、大規模なデータで調べた研究者がいるのだ。', speakerColor: '#22c55e', durationFrames: 999 },
];

// Block 3: 残酷なデータ①
export const S3: Segment[] = [
    { speaker: 'ずんだもん', text: '2014年に、マクナマラ、ハンブリック、オズワルドの3人の研究者が、ものすごいことをやったのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '何をしたの？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '過去に発表された88の研究論文、合計11,000人以上のデータを集めて、「意図的練習がパフォーマンスの差をどのくらい説明できるか」をメタ分析したのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'メタ分析って、たくさんの研究をまとめて分析するやつだよね。一つの研究よりずっと信頼性が高い。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'で、結果がこれなのだ。まずゲーム（チェスなど）で26%。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '音楽で21%。スポーツで18%。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'うーん、2割前後……。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'そして教育（学校の成績）で4%。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '4%!?　急に下がったね！', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'そして職業（仕事のパフォーマンス）だと……1%未満なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '1%未満!?　ほぼゼロじゃん！', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '全分野を合わせた平均が約12%。つまり、パフォーマンスの差の88%は、練習量以外の何かで決まっているということなのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'それは……かなり衝撃的なデータだね。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'さて、もう一つ面白いデータがあるのだ。チェスのマスターレベルに到達するまでの練習時間が、人によって全然違ったのだ。最速728時間、最遅16,120時間。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '728時間と16,120時間!?', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'さらに25,000時間以上練習してもマスターになれなかった人もいるのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '3割……。じゃあ残りの7割って、いったい何なの？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '遺伝、知能、環境、始めた年齢。いろんなものが絡み合っているのだ。……ここからが、ちょっと残酷な話になるよ。', speakerColor: '#22c55e', durationFrames: 999 },
];

// Block 4: 遺伝の壁
export const S4: Segment[] = [
    { speaker: 'ずんだもん', text: 'まず、身体能力の話からしようか。双子研究って知ってる？', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '一卵性双生児と二卵性双生児を比べて、遺伝の影響を調べるやつだよね。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '運動能力に関連する特性の個人差のうち、30%から80%が遺伝的要因で説明される。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'VO2max（最大酸素摂取量）の遺伝率が59%から72%なのだ。持久力の指標としてすごく重要な数値だよ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'つまり、マラソンの速さの6〜7割は生まれつきで決まってるってこと？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'もっとすごいのは、ACTN3遺伝子っていう「スピード遺伝子」の話なのだ。RR型は瞬発系、XX型は持久系に向いている。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'じゃあ、XX型の人がどれだけ短距離を練習しても、RR型の人には勝てないかもしれないってこと？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'たとえるなら、スポーツカーのエンジンを積んでる人と、軽自動車のエンジンを積んでる人が同じレースに出るようなものなのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'さらに、「トレーニングへの反応性」自体にも遺伝の影響があるのだ。同じ練習をしても伸びが違って、その差の約47%が遺伝で説明されるのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '……それは確かに、残酷だね。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '身体だけじゃないのだ。認知能力（IQやワーキングメモリ）の個人差の50%から70%が遺伝的要因で説明されるのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'つまり、才能がある人は練習の効率も良いから、差がどんどん開いていく……。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'ただね、「遺伝で全部決まる」わけじゃないのだ。遺伝率が50%でも、残りの50%は環境や練習の質で変わる。天井にどこまで近づけるかは、自分次第なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'じゃあ、努力は無意味ってわけじゃないんだね？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'もちろん無意味じゃないのだ。でも、「どこに」「どうやって」努力を向けるかが、量よりもずっと大事なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
];

// Block 5: 正しい努力
export const S5: Segment[] = [
    { speaker: '四国めたん', text: 'ここまでの話をまとめると、練習の量だけでは限界がある。でも努力は無意味じゃない。ってことは、努力の「やり方」が大事ってこと？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'その通りなのだ。ただ1万時間やるんじゃなくて、その1時間1時間の質を極限まで高めること。これが、練習の効果を最大化する唯一の方法なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'でもさ、質の高い練習をしても、遺伝の壁はあるわけでしょ？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'ここで、エプスタインの『Range（レンジ）』に出てくるフレームワークを紹介するのだ。学習環境を「kind」と「wicked」に分ける考え方だよ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'kindな環境（チェスやゴルフ）では、早い段階からの集中練習が有効。wickedな環境（ビジネスや科学研究）では、幅広い経験の方が強いのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'タイガー・ウッズは2歳からゴルフ一筋。フェデラーは子供の頃にいろんなスポーツを経験して、10代後半でテニスに絞った。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'フェデラーって遅咲きだったんだ！', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'そしてフェデラーはテニス史上最も偉大な選手の一人になったのだ。幅広い経験が適応力や創造性を育てたと考えられているよ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'じゃあ、「自分に合ったフィールドを見つけること」自体が大事ってことだね。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'ジョシュ・カウフマンは「新しいスキルの基本習得に必要な時間はわずか20時間」だと言っているのだ。いろんなことを20時間ずつ試して、自分が伸びやすいフィールドを見つける。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'なるほど……！がむしゃらに1万時間やるんじゃなくて、まず自分の適性を見極めるのが先なんだ。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '才能と努力は対立するものじゃない。自分の強みを知って、その方向に質の高い努力を向けること。これが、データが教えてくれる「正しい努力」の答えなのだ。', speakerColor: '#22c55e', durationFrames: 999 },
];

// Block 6: まとめ
export const S6: Segment[] = [
    { speaker: '四国めたん', text: 'ずんだもん、最初の質問に戻っていい？「1万時間やれば、誰でもプロになれる」……これは、結局どうなの？', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '答えはこうなるのだ。1万時間の法則は、元の研究者本人に否定され、大規模なメタ分析によって「たった12%」と突きつけられた、科学的に誇張された俗説なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '残りの88%は、遺伝とか、環境とか、練習の質とか……いろんなものが複雑に絡み合ってるんだよね。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '同じマスターレベルに達するのに728時間の人もいれば、16,000時間以上の人もいる。「量で解決できるほど、世界は単純じゃない」のだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'でも、努力が無意味ってわけじゃないんだよね。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '大事なのは、量じゃなくて方向性と質。自分の強みを見極めて、適切な環境で、意図的な練習を積むこと。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '……そっか。「どこに、どうやって努力を向けるかの方がずっと大事」って感覚に変わったよ。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: '「1万時間やれば誰でも報われる」って話がこんなに広まったのは、みんながその話を「信じたかった」からなのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'でも、本当のことを知った上で努力する方が、絶対に強いのだ。自分の才能を正しく見極めて、正しい方向に、質の高い努力を向ける。それが一番の近道なのだ。', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: '「正しい努力」の意味が、ちゃんとわかった気がする。', speakerColor: '#d6336c', durationFrames: 999 },
    { speaker: 'ずんだもん', text: 'というわけで、今日は「1万時間の法則」の真実についてお話ししたのだ。ためになったと思ったら、チャンネル登録と高評価をお願いするのだ！', speakerColor: '#22c55e', durationFrames: 999 },
    { speaker: '四国めたん', text: 'それじゃあ、またね！', speakerColor: '#d6336c', durationFrames: 999 },
];
