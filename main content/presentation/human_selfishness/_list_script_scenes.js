const fs = require('fs');
const s = fs.readFileSync('d:/myfolder/動画生成/台本作成/人間は本来「利己的」なのか？/script.md', 'utf8');
const scenes = [];
let cur = null;
s.split('\n').forEach(l => {
    const m = l.match(/<!-- SCENE: (.+?) -->/);
    if (m && !l.includes('`')) {
        if (cur) scenes.push(cur);
        cur = { title: m[1], lines: [] };
        return;
    }
    if (cur && /^(ずんだもん|めたん)：/.test(l)) {
        cur.lines.push(l.trim().substring(0, 60));
    }
});
if (cur) scenes.push(cur);
scenes.forEach((s, i) => {
    console.log(i + ': [' + s.title + '] (' + s.lines.length + ' lines)');
    console.log('   first: ' + s.lines[0]);
});
