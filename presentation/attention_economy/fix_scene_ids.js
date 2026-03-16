const fs = require('fs');
let html = fs.readFileSync('d:/myfolder/動画生成/main content/presentation/attention_economy/index.html', 'utf8');

// Re-number ALL scene divs sequentially
let sceneCounter = 0;
html = html.replace(/id="scene-\d+"/g, () => `id="scene-${sceneCounter++}"`);

// Fix canvas IDs
const lines = html.split('\n');
let curScene = -1;
for (let i = 0; i < lines.length; i++) {
    const sm = lines[i].match(/id="scene-(\d+)"/);
    if (sm) curScene = parseInt(sm[1]);
    if (lines[i].includes('id="canvas-')) {
        lines[i] = lines[i].replace(/id="canvas-\d+"/, `id="canvas-${curScene}"`);
    }
}
html = lines.join('\n');

fs.writeFileSync('d:/myfolder/動画生成/main content/presentation/attention_economy/index.html', html, 'utf8');

const ids = [...html.matchAll(/id="scene-(\d+)"/g)].map(m => m[1]);
console.log('Scene IDs:', ids.join(', '));
console.log('Count:', ids.length);
const canvasIds2 = [...html.matchAll(/id="canvas-(\d+)"/g)].map(m => m[1]);
console.log('Canvas IDs:', canvasIds2.join(', '));
