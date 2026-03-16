const fs = require('fs');
const s = fs.readFileSync('script.md', 'utf8');
const lines = s.split('\n').filter(l => /^(ずんだもん|めたん)：/.test(l));
let total = 0;
let over74 = 0;
let over60 = 0;
lines.forEach((l, i) => {
  const [n, ...r] = l.split('：');
  const text = r.join('：').trim();
  total += text.length;
  if (text.length > 74) {
    console.log('❌74超 Line ' + (i + 1) + ': ' + text.length + '文字: ' + text.substring(0, 40) + '...');
    over74++;
  } else if (text.length > 60) {
    console.log('⚠️60超 Line ' + (i + 1) + ': ' + text.length + '文字: ' + text.substring(0, 40) + '...');
    over60++;
  }
});

// Count SCENE markers
const sceneMarkers = s.split('\n').filter(l => {
  if (l.includes('`') && l.includes('SCENE:')) return false;
  return /<!-- SCENE: .+? -->/.test(l);
});

console.log('\n--- 結果 ---');
console.log('セリフ数: ' + lines.length);
console.log('セリフ総文字数: ' + total);
console.log('74文字超: ' + over74 + '件');
console.log('60文字超(74以内): ' + over60 + '件');
console.log('SCENEマーカー数: ' + sceneMarkers.length);
