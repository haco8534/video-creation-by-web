const fs = require('fs');
const scenes = [
    // Block 1: フック (3 scenes)
    { type: 'title', badge: 'MEMORY SCIENCE', title: '「写真記憶」は存在しない', subtitle: 'The Myth of Photographic Memory', accent: '写真記憶' },
    { type: 'impact', label: 'SCIENTIFIC CONSENSUS', num: '0', unit: '人', desc: '科学的に確認された<br>「写真記憶」の持ち主', note: '認知科学者 Marvin Minsky — "unfounded myth"' },
    { type: 'list3', title: 'この動画でわかること', items: ['写真記憶が信じられてきた理由', '記憶の本質と偽記憶の科学', '記憶チャンピオンの秘密'] },
    // Block 2: 信じられている理由 (5 scenes)
    { type: 'list', title: '写真記憶のイメージ', items: ['一度見た本のページを頭の中で読み返せる', '一瞬見た風景を細部まで完璧に再現できる', '脳内にカメラがあるかのような完全記録'] },
    { type: 'emphasis', label: 'POP CULTURE', main: '映画・ドラマが作った<br><span class="accent-primary">「天才」のイメージ</span>', sub: 'シャーロック・ホームズ、レインマン、SUITS……' },
    { type: 'quote', title: 'キム・ピーク──「レインマン」のモデル', text: '約12,000冊の本を記憶<br>2ページを同時に読む<br><span class="accent-primary">読んだ内容の98%を保持</span>', source: '映画「レインマン」(1988) のモデル' },
    { type: 'vs', title: '写真記憶 vs キム・ピークの実態', left: { badge: '通説', title: '写真記憶', desc: '誰でも訓練で獲得可能な<br>完璧な視覚記録' }, right: { badge: '事実', title: 'サヴァン症候群', desc: '脳梁の先天的欠如による<br>特定分野の突出した能力' }, note: '特殊な脳構造による能力であり「写真記憶」とは科学的に区別される' },
    { type: 'emphasis', label: 'KEY POINT', main: 'キム・ピークほどの記憶力でさえ<br>科学者は<span class="accent-coral">「写真記憶」と呼ばない</span>', sub: 'では「写真記憶の証拠」はどこにあるのか？' },
    // Block 3: 科学的検証 (9 scenes)
    { type: 'chapter', num: '01', name: '唯一の「証拠」', sub: 'ストロマイヤー事件 — 1970' },
    { type: 'flow', title: 'ランダムドットステレオグラム実験', nodes: ['右目だけで1万個の点パターンを提示', '翌日、左目だけで別の点パターンを提示', '頭の中で2つを合成し立体画像を知覚'], labels: ['Day 1', 'Day 2', 'Result'] },
    { type: 'alert', title: '実験後、研究者は被験者<span class="accent-coral">エリザベスと結婚</span>', sub: '以後、エリザベスは一度も再テストを受けていない' },
    { type: 'vs', title: '実験の「前」と「後」', left: { badge: '実験前', title: 'Nature掲載', desc: '写真記憶の決定的証拠<br>として世界が注目' }, right: { badge: '実験後', title: '再現ゼロ', desc: '50年以上、同じことが<br>できた成人は世界に0人' }, note: '心理学者たちから「fishy（怪しい）」と評される' },
    { type: 'emphasis', label: 'SCIENTIFIC CONSENSUS', main: '<span class="accent-coral">再現された人数：0人</span><br>50年以上、世界中で誰も成功していない', sub: 'Marvin Minsky：「根拠のない神話（unfounded myth）」' },
    { type: 'list', title: '直観像記憶の3つの特徴', items: ['6〜12歳の子どもの2〜10%にのみ確認', '持続時間は30秒〜数分、完全ではなくエラーを含む', '思春期になるとほぼ全員から消失する'], note: 'Eidetic Memory ≠ Photographic Memory' },
    { type: 'impact', label: 'DEVELOPMENTAL', num: '2-10', unit: '%', desc: '直観像記憶を持つ子どもの割合<br>（6〜12歳）', note: '思春期以降の成人ではほぼ確認されていない' },
    { type: 'vs', title: 'チンパンジー「アユム」vs 人間', left: { badge: 'チンパンジー', title: 'アユム', desc: '0.21秒の表示で<br>約80%正確に記憶' }, right: { badge: '人間の大人', title: '一般成人', desc: '同条件では<br>大幅に劣る成績' }, note: 'Inoue & Matsuzawa (2007) Current Biology — 京都大学' },
    { type: 'emphasis', label: 'COGNITIVE TRADE-OFF', main: '人間は<span class="accent-primary">言語能力</span>と引き換えに<br><span class="accent-coral">瞬間記憶能力</span>を失った', sub: '松沢哲郎教授の「認知的トレードオフ仮説」' },
    // Block 4: 記憶の本質 (10 scenes)
    { type: 'chapter', num: '02', name: '記憶の本質', sub: 'なぜ完璧に覚えられないのか' },
    { type: 'flow', title: 'バートレットの「幽霊の戦争」実験', nodes: ['ネイティブアメリカの物語を読ませる', '時間を置いて思い出して書かせる', '全員が自分の文化に合うよう書き換えていた'], labels: ['Input', 'Recall', 'Result'] },
    { type: 'vs', title: '元の物語 vs 被験者の記憶', left: { badge: '原文', title: '超自然的要素あり', desc: '幽霊・精霊など<br>馴染みのない要素' }, right: { badge: '被験者の再話', title: '論理的に変形', desc: '馴染みのない要素を削除<br>自分の常識に合わせて変形' }, note: 'Bartlett (1932) — 記憶は「スキーマ」に基づいて再構成される' },
    { type: 'alert', title: '言葉一つで記憶が<span class="accent-coral">書き換わる</span>', sub: 'エリザベス・ロフタスの衝突実験 (1974)' },
    { type: 'impact', label: 'Loftus & Palmer — 1974', num: '+2x', unit: '', desc: '「smashed」と聞いた群は<br>「割れたガラス」の偽記憶を形成', note: '実際には割れたガラスは存在しなかった' },
    { type: 'emphasis', label: 'FALSE MEMORY', main: '起きていない出来事の<br><span class="accent-coral">偽記憶</span>を植え付けることに成功', sub: 'ショッピングモールで迷子実験 — Loftus (1995)' },
    { type: 'list', title: 'HSAMの特徴', items: ['30年前の出来事を日付まで正確に想起', '世界で数十人しか確認されていない', '2006年 UCI — James McGaugh教授らが報告'], note: 'HSAM = Highly Superior Autobiographical Memory' },
    { type: 'vs', title: 'HSAMの自伝的記憶 vs 一般テスト', left: { badge: '自伝的記憶', title: '驚異的', desc: '30年前の木曜日の<br>食事まで正確に記憶' }, right: { badge: '単語リスト暗記', title: '普通', desc: '一般の人と<br>ほぼ同じ成績' }, note: 'LePort et al. (2012) PNAS / UCI' },
    { type: 'impact', label: 'Patihis et al. — PNAS, 2013', num: 'HSAM', unit: '', desc: '超自伝的記憶の持ち主でさえ<br><span class="accent-coral">偽記憶の影響を受ける</span>', note: 'むしろ対照群より偽記憶を形成しやすいケースも' },
    { type: 'emphasis', label: 'CONCLUSION', main: '人間の脳はそもそも<br><span class="accent-coral">「完璧に記録する」</span>ようにできていない', sub: '不完全さには、ちゃんと理由がある' },
    // Block 5: 記憶チャンピオン (8 scenes)
    { type: 'chapter', num: '03', name: '記憶チャンピオンの秘密', sub: '誰でもなれる' },
    { type: 'emphasis', label: 'MEMORY ATHLETES', main: '記憶チャンピオンは全員<br><span class="accent-primary">「写真記憶は持っていない」</span>と公言', sub: 'Smithsonian Magazine / Big Think' },
    { type: 'flow', title: '記憶の宮殿 (Method of Loci)', nodes: ['よく知っている場所を思い浮かべる', '情報を突飛なイメージに変換する', 'その場所に「置いて」歩いて回収'], labels: ['Step 1', 'Step 2', 'Step 3'] },
    { type: 'list', title: '記憶の宮殿の3ステップ', items: ['空間：自分の家やよく知る場所を選ぶ', '変換：覚えたい情報を印象的な映像に変える', '配置：映像を場所の特定ポイントに「置く」'], note: '約2500年前 古代ギリシャのシモニデスが発明' },
    { type: 'cards3', title: 'PAOシステム', items: [{ icon: 'P', name: 'Person', desc: '数字→人物' }, { icon: 'A', name: 'Action', desc: '数字→動作' }, { icon: 'O', name: 'Object', desc: '数字→物体' }], note: 'Person-Action-Object で6桁を1つの映像に圧縮' },
    { type: 'emphasis', label: 'EXAMPLE', main: '「お母さんが走りながら<br><span class="accent-primary">ケーキを食べている</span>」', sub: '31-41-59 → 1つの突飛な映像 → 記憶の宮殿の玄関に配置' },
    { type: 'impact', label: 'Dresler et al. — Neuron, 2017', num: '2.4', unit: '倍', desc: '40日間の訓練で<br>記憶力が2.4倍に向上', note: '72単語中 26語 → 62語（4ヶ月後も維持）' },
    { type: 'vs', title: '記憶チャンピオンの脳 vs 一般人の脳', left: { badge: '構造（ハード）', title: '差なし', desc: 'MRI比較で<br>脳の形に違いなし' }, right: { badge: '使い方（ソフト）', title: '差あり', desc: '機能的結合パターンに<br>明確な違い' }, note: '脳の形ではなく「使い方」が違う — Dresler et al. (2017)' },
    { type: 'emphasis', label: 'KEY FINDING', main: '訓練で脳の使い方が<br><span class="accent-primary">チャンピオンに近づいた</span>', sub: '才能ではなく技術。技術は誰でも学べる。' },
    // Block 6: まとめ (7 scenes)
    { type: 'chapter', num: 'SUMMARY', name: 'まとめ', sub: '人間の記憶は写真よりすごい' },
    { type: 'list', title: '今日わかった3つのこと', items: ['「写真記憶」は100年以上確認された人が0人', '人間の記憶は「再生」ではなく「再構成」', '記憶チャンピオンの能力は学習可能な技術'], note: '唯一の証拠は研究者と被験者の結婚で崩壊' },
    { type: 'emphasis', label: 'CORE MESSAGE', main: '記憶は不完全だからこそ<br><span class="accent-primary">素晴らしい</span>', sub: '情報を「選んで」「つなげて」「意味づけて」保存する' },
    { type: 'vs', title: '写真のような記憶 vs 人間の記憶', left: { badge: 'もし写真記憶なら', title: '全部記録', desc: '膨大な情報に埋もれ<br>大事なことを見失う' }, right: { badge: '人間の記憶', title: '選択と創造', desc: '応用が利き<br>新しいアイデアが生まれる' }, note: '不完全だからこそ、学習・創造・一般化が可能になる' },
    { type: 'list', title: '今日からできること', items: ['記憶の宮殿は誰でも今日から始められる', '40日間・1日30分で効果が出る', '写真記憶を羨む必要はない'], note: '人間の記憶は写真じゃない。写真より、ずっとすごい。' },
    { type: 'emphasis', label: 'FINAL MESSAGE', main: 'あなたの記憶は<br><span class="accent-primary">あなただけの創造物</span>', sub: '記憶は不完全だからこそ、人間らしい。そこに価値がある。' },
];

function renderScene(s, i) {
    const active = i === 0 ? ' active' : '';
    let inner = '';
    switch (s.type) {
        case 'title':
            inner = `<canvas id="canvas-${i}" class="bg-canvas"></canvas>
        <div class="scene-content title-card">
            <div class="title-label stagger-item">${s.badge}</div>
            <h1 class="title-main stagger-item">${s.title.replace(s.accent, `<span class="accent-primary">${s.accent}</span>`)}</h1>
            <div class="title-accent-line stagger-item"></div>
            <div class="title-sub stagger-item">${s.subtitle}</div>
        </div>`;
            break;
        case 'chapter':
            inner = `<canvas id="canvas-${i}" class="bg-canvas"></canvas>
        <div class="scene-content chapter-title">
            <div class="chapter-number stagger-item">${s.num.match(/\d/) ? 'CHAPTER ' + s.num : s.num}</div>
            <h2 class="chapter-name stagger-item">${s.name}</h2>
            <div class="chapter-line stagger-item"></div>
            <div class="chapter-sub stagger-item">${s.sub}</div>
        </div>`;
            break;
        case 'impact':
            inner = `<div class="scene-content center-layout">
            <div class="impact-label stagger-item">${s.label}</div>
            <div class="impact-number-group">
                <span class="impact-number stagger-item">${s.num}</span>
                <span class="impact-number-unit stagger-item">${s.unit}</span>
            </div>
            <div class="impact-desc stagger-item">${s.desc}</div>
            <div class="impact-note stagger-item">${s.note}</div>
        </div>`;
            break;
        case 'emphasis':
            inner = `<canvas id="canvas-${i}" class="bg-canvas"></canvas>
        <div class="scene-content center-layout">
            <div class="emphasis-label stagger-item">${s.label}</div>
            <div class="emphasis-main stagger-item">${s.main}</div>
            <div class="emphasis-sub stagger-item">${s.sub}</div>
        </div>`;
            break;
        case 'list3':
            inner = `<div class="scene-content">
            <h2 class="section-title stagger-item">${s.title}</h2>
            <div class="three-points-grid">
                ${s.items.map((t, j) => `<div class="point-card stagger-item"><div class="point-number">0${j + 1}</div><div class="point-text">${t}</div></div>`).join('\n                ')}
            </div>
        </div>`;
            break;
        case 'list':
            inner = `<div class="scene-content">
            <h2 class="section-title stagger-item">${s.title}</h2>
            <div class="numbered-list">
                ${s.items.map((t, j) => `<div class="numbered-item stagger-item"><div class="number-circle">${j + 1}</div><div class="numbered-text">${t}</div></div>`).join('\n                ')}
            </div>
            ${s.note ? `<div class="footnote stagger-item">${s.note}</div>` : ''}
        </div>`;
            break;
        case 'vs':
            inner = `<div class="scene-content center-layout">
            <h2 class="section-title stagger-item">${s.title}</h2>
            <div class="vs-layout">
                <div class="vs-side vs-left stagger-item">
                    <div class="vs-badge safe-badge">${s.left.badge}</div>
                    <div class="vs-title">${s.left.title}</div>
                    <div class="vs-desc">${s.left.desc}</div>
                </div>
                <div class="vs-center-badge stagger-item"><div class="vs-badge-circle">VS</div></div>
                <div class="vs-side vs-right stagger-item">
                    <div class="vs-badge danger-badge">${s.right.badge}</div>
                    <div class="vs-title">${s.right.title}</div>
                    <div class="vs-desc">${s.right.desc}</div>
                </div>
            </div>
            <div class="comparison-note stagger-item">${s.note}</div>
        </div>`;
            break;
        case 'quote':
            inner = `<div class="scene-content center-layout">
            <h2 class="section-title stagger-item">${s.title}</h2>
            <div class="quote-card stagger-item">
                <div class="quote-mark">"</div>
                <div class="quote-text">${s.text}</div>
                <div class="quote-source">${s.source}</div>
            </div>
        </div>`;
            break;
        case 'alert':
            inner = `<div class="scene-content center-layout">
            <div class="alert-card stagger-item">
                <div class="alert-icon">!</div>
                <div class="alert-title">${s.title}</div>
                <div class="alert-sub">${s.sub}</div>
            </div>
        </div>`;
            break;
        case 'flow':
            inner = `<div class="scene-content">
            <h2 class="section-title stagger-item">${s.title}</h2>
            <div class="flow-chain">
                ${s.nodes.map((n, j) => {
                let arrow = j < s.nodes.length - 1 ? `<div class="flow-arrow stagger-item">&rarr;</div>` : '';
                return `<div class="flow-node stagger-item"><div class="flow-year">${s.labels[j]}</div><div class="flow-text">${n}</div></div>${arrow}`;
            }).join('\n                ')}
            </div>
        </div>`;
            break;
        case 'cards3':
            inner = `<div class="scene-content">
            <h2 class="section-title stagger-item">${s.title}</h2>
            <div class="triple-card">
                ${s.items.map(c => `<div class="factor-card stagger-item"><div class="factor-icon accent-bg-primary">${c.icon}</div><div class="factor-name">${c.name}</div><div class="factor-desc">${c.desc}</div></div>`).join('\n                ')}
            </div>
            ${s.note ? `<div class="footnote stagger-item">${s.note}</div>` : ''}
        </div>`;
            break;
    }
    return `    <!-- Scene ${i}: ${s.title || s.name || s.main || s.label} -->
    <section class="scene${active}" id="scene-${i}">
        ${inner}
    </section>\n`;
}

let html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>「写真記憶」は存在しない</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>\n\n`;

scenes.forEach((s, i) => { html += renderScene(s, i); });

html += `\n    <script src="script.js"></script>\n</body>\n</html>\n`;
fs.writeFileSync('index.html', html, 'utf8');
console.log('Generated index.html with ' + scenes.length + ' scenes');
console.log('Lines: ' + html.split('\n').length);
