const fs = require('fs');
const d = JSON.parse(fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/main content/presentation/memory_reconsolidation/scene_map.json', 'utf8'));
const bad = ['タイトルカード','数値インパクト','フロー図','テキスト強調','比較対照','段階的リスト','引用カード','タイムライン','まとめ3ポイント','まとめカード','エンディング','注意喚起'];
let errors = 0;
d.scenes.forEach(s => {
  const found = bad.filter(b => s.title.startsWith(b) || s.title.includes('「'));
  if (found.length > 0) {
    console.log('X Scene ' + s.id + ': "' + s.title + '" <- pattern name: ' + found.join(', '));
    errors++;
  } else {
    console.log('OK Scene ' + s.id + ': "' + s.title + '"');
  }
});
if (errors > 0) {
  console.log('\n' + errors + ' errors found');
} else {
  console.log('\nAll titles OK');
}
