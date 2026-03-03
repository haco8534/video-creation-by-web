const fs = require('fs');
const s = fs.readFileSync('d:/myfolder/動画生成/台本作成/人間は本来「利己的」なのか？/script.md', 'utf8');
const h = fs.readFileSync('d:/myfolder/動画生成/main content/presentation/human_selfishness/index.html', 'utf8');

// Extract script scenes
const scriptScenes = [];
let cur = null;
s.split('\n').forEach(l => {
    const m = l.match(/<!-- SCENE: (.+?) -->/);
    if (m && !l.includes('`')) {
        if (cur) scriptScenes.push(cur);
        cur = { title: m[1], lines: [] };
        return;
    }
    if (cur && /^(ずんだもん|めたん)：/.test(l)) {
        cur.lines.push(l.trim().substring(0, 60));
    }
});
if (cur) scriptScenes.push(cur);

// Extract HTML scene comments
const htmlComments = [];
const commentRegex = /<!-- Scene (\d+): (.+?) -->/g;
let cm;
while ((cm = commentRegex.exec(h)) !== null) {
    htmlComments.push({ id: parseInt(cm[1]), desc: cm[2] });
}

const out = [];
out.push('SCRIPT SCENES: ' + scriptScenes.length);
out.push('HTML SCENES: ' + htmlComments.length);
out.push('');
out.push('=== SIDE BY SIDE ===');
out.push('');

for (let i = 0; i < Math.max(scriptScenes.length, htmlComments.length); i++) {
    const ss = scriptScenes[i];
    const hc = htmlComments[i];
    const match = ss && hc &&
        (ss.title.includes(hc.desc.split(' ').slice(1).join(' ').substring(0, 8)) ||
            hc.desc.includes(ss.title.split(' | ')[0].substring(0, 8)));
    out.push('Scene ' + i + ': ' + (match ? 'OK' : 'MISMATCH'));
    out.push('  Script: ' + (ss ? ss.title : 'MISSING'));
    out.push('  HTML:   ' + (hc ? hc.desc : 'MISSING'));
    out.push('');
}

fs.writeFileSync('d:/myfolder/動画生成/main content/presentation/human_selfishness/_alignment_report.txt', out.join('\n'), 'utf8');
console.log('Written to _alignment_report.txt');
