const fs = require('fs');
const t = fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/台本作成/自由意志は存在するのか/script.md', 'utf8');
const ls = t.split(/\r?\n/);
const scenes = [];
const marker = '\x3C!-- SCENE:';
ls.forEach(l => {
  const a = l.indexOf(marker);
  if (a < 0) return;
  if (l.indexOf('`') >= 0) return;
  const b = l.indexOf('--\x3E', a + marker.length);
  if (b < 0) return;
  scenes.push(l.substring(a + marker.length, b).trim());
});
scenes.forEach((s, i) => console.log(i + ': ' + s));
console.log('Total: ' + scenes.length);
