const fs = require('fs');
const t = fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/台本作成/自由意志は存在するのか/script.md', 'utf8');
const allLines = t.split(/\r?\n/);
const dialogueLines = allLines.filter(l => /^(ずんだもん|めたん)：/.test(l));
let total = 0, bad = 0;
dialogueLines.forEach((l, i) => {
  const text = l.replace(/^(ずんだもん|めたん)：/, '').trim();
  total += text.length;
  if (text.length > 74) {
    console.log('OVER Line ' + (i + 1) + ': ' + text.length + 'c: ' + text.substring(0, 50) + '...');
    bad++;
  }
});
console.log('Lines: ' + dialogueLines.length);
console.log('Total chars: ' + total);
console.log(bad > 0 ? bad + ' lines over 74' : 'ALL OK under 74');
const sceneMarkers = allLines.filter(l => {
  if (l.includes('`') && l.includes('SCENE:')) return false;
  return /<!-- SCENE: .+? -->/.test(l);
});
console.log('SCENE markers: ' + sceneMarkers.length);
sceneMarkers.forEach((l, i) => {
  const m = l.match(/<!-- SCENE: (.+?) -->/);
  console.log('  S' + i + ': ' + (m ? m[1] : '?'));
});
