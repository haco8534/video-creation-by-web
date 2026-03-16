const fs = require('fs');
const script = fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/台本作成/コンコルドの誤り/script.md', 'utf8');
const html = fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/main content/presentation/concorde_fallacy/index.html', 'utf8');

const scriptScenes = [];
let cur = null;
script.split(/\r?\n/).forEach(l => {
    if (l.includes('`') && l.includes('SCENE:')) return;
    const m = l.match(/<!-- SCENE: (.+?) -->/);
    if (m) {
        if (cur) scriptScenes.push(cur);
        cur = { title: m[1] };
        return;
    }
});
if (cur) scriptScenes.push(cur);

const htmlIds = (html.match(/id="scene-\d+"/g) || []);
console.log('Script SCENE count: ' + scriptScenes.length + ' / HTML section count: ' + htmlIds.length);
if (scriptScenes.length !== htmlIds.length) {
    console.log('MISMATCH!');
    process.exit(1);
} else {
    console.log('OK - match');
}
