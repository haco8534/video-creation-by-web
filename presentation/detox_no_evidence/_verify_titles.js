const fs = require('fs');
const d = JSON.parse(fs.readFileSync('d:/myfolder/動画生成/main content/presentation/detox_no_evidence/scene_map.json', 'utf8'));
const bad = ['タイトルカード', '数値インパクト', 'フロー図', 'テキスト強調', '比較対照', '段階的リスト', '引用カード', 'タイムライン', '注意喚起', 'まとめカード'];
let errors = 0;
d.scenes.forEach(s => {
    const found = bad.filter(b => s.title.startsWith(b) || s.title.includes('「'));
    if (found.length > 0) {
        console.log('❌ Scene ' + s.id + ': "' + s.title + '" ← パターン名混入: ' + found.join(', '));
        errors++;
    } else {
        console.log('✅ Scene ' + s.id + ': "' + s.title + '" (' + s.lines.length + ' lines)');
    }
});
if (errors > 0) { console.log('\n🚨 ' + errors + '件のtitleを修正してください'); }
else { console.log('\n✅ 全titleが正常です'); }
