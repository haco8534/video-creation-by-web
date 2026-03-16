const fs = require('fs');
const path = require('path');
const mapPath = path.join(__dirname, 'scene_map.json');
const d = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const bad = ['タイトルカード','数値インパクト','フロー図','テキスト強調','比較対照','段階的リスト','引用カード','タイムライン','まとめ3ポイント','エンディング'];
let errors = 0;
d.scenes.forEach(s => {
  const found = bad.filter(b => s.title.startsWith(b));
  if (found.length > 0) { console.log('❌ Scene ' + s.id + ': "' + s.title + '"'); errors++; }
  else { console.log('✅ Scene ' + s.id + ': "' + s.title + '"'); }
});
if (errors > 0) { console.log('\n🚨 ' + errors + ' errors'); process.exit(1); }
else { console.log('\n✅ All titles OK'); }
