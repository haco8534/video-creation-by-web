const fs = require('fs');
const path = 'd:/myfolder/動画生成/main content/presentation/human_selfishness/scene_map.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));

d.scenes.forEach(s => {
    // 「」を除去
    s.title = s.title.replace(/[「」]/g, '');
});

fs.writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
console.log('Fixed titles (removed brackets)');
d.scenes.forEach(s => console.log(s.id + ': ' + s.title));
