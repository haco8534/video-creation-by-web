const fs = require('fs');
const path = 'd:/myfolder/動画生成/main content/presentation/human_selfishness/index.html';
let html = fs.readFileSync(path, 'utf8');

// Find all scene section positions and renumber them sequentially
const lines = html.split('\n');
let sceneIdx = 0;
const newLines = lines.map(line => {
    // Match section tags with scene IDs
    const match = line.match(/(<section\s+class="[^"]*"\s+)id="scene-\d+"(>)/);
    if (match) {
        const newLine = line.replace(/id="scene-\d+"/, `id="scene-${sceneIdx}"`);
        sceneIdx++;
        return newLine;
    }
    return line;
});

html = newLines.join('\n');
fs.writeFileSync(path, html, 'utf8');

// Verify
const ids = (html.match(/id="scene-(\d+)"/g) || []).map(m => parseInt(m.match(/\d+/)[0]));
console.log('Total scenes: ' + ids.length);
console.log('IDs: ' + ids.join(', '));

let ok = true;
for (let i = 0; i < ids.length; i++) {
    if (ids[i] !== i) {
        console.log('ERROR: Expected scene-' + i + ' but found scene-' + ids[i]);
        ok = false;
    }
}
if (ok) console.log('All IDs are continuous and correct!');
