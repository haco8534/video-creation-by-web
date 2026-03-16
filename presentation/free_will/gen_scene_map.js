const fs = require('fs'), path = require('path');
const SCRIPT_PATH = path.resolve('d:/myfolder/動画生成/ふぁくとラボ/台本作成/自由意志は存在するのか/script.md');
const PROJECT_DIR = path.resolve('d:/myfolder/動画生成/ふぁくとラボ/main content/presentation/free_will');
const HTML_PATH = path.join(PROJECT_DIR, 'index.html');
const OUT_PATH = path.join(PROJECT_DIR, 'scene_map.json');

const script = fs.readFileSync(SCRIPT_PATH, 'utf8');
const lines = script.split(/\r?\n/);

// Extract all dialogue lines
const allDialogue = lines
    .filter(l => /^(ずんだもん|めたん)：/.test(l))
    .map(l => {
        const idx = l.indexOf('：');
        return { speaker: l.substring(0, idx), text: l.substring(idx + 1).trim() };
    });

// Parse SCENE markers and associated dialogue
const sceneMarkers = [];
let dialogueIdx = 0, currentTitle = null, currentLines = [];

lines.forEach(l => {
    // Skip lines with backticks that contain SCENE:
    if (l.indexOf('`') >= 0 && l.indexOf('SCENE:') >= 0) return;
    
    // Check for <!-- SCENE: ... -->
    const markerStart = l.indexOf('<!-- SCENE:');
    if (markerStart >= 0) {
        const markerEnd = l.indexOf('-->', markerStart + 11);
        if (markerEnd >= 0) {
            if (currentTitle !== null) {
                sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });
            }
            currentTitle = l.substring(markerStart + 12, markerEnd).trim();
            currentLines = [];
            return;
        }
    }
    
    if (/^(ずんだもん|めたん)：/.test(l)) {
        dialogueIdx++;
        currentLines.push(dialogueIdx);
    }
});
if (currentTitle !== null) {
    sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });
}

// Count HTML scenes
const html = fs.readFileSync(HTML_PATH, 'utf8');
const htmlSceneMatches = html.match(/id="scene-\d+"/g) || [];
const htmlSceneCount = htmlSceneMatches.length;

// Extract title (remove visual pattern name)
function extractTitle(rawTitle) {
    if (rawTitle.includes('|')) return rawTitle.split('|').slice(1).join('|').trim();
    const m = rawTitle.match(/[「](.+?)[」]/);
    return m ? m[1] : rawTitle;
}

// Build scenes array
const scenes = sceneMarkers.map((s, i) => ({
    id: i,
    title: extractTitle(s.title),
    lines: s.lines.map(ln => allDialogue[ln - 1]).filter(Boolean)
}));

// Add hold_sec scenes if HTML has more scenes than markers
while (scenes.length < htmlSceneCount) {
    scenes.push({ id: scenes.length, title: 'エンディング', hold_sec: 3, lines: [] });
}

const map = {
    voicevox_url: 'http://localhost:50021',
    speakers: { 'ずんだもん': 3, 'めたん': 2 },
    speed_scale: 1.14,
    inter_line_silence: 0.3,
    scene_end_padding: 0.5,
    scenes
};

fs.writeFileSync(OUT_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log('scene_map.json generated');
console.log('SCENE markers:', sceneMarkers.length);
console.log('HTML scenes:', htmlSceneCount);
console.log('scene_map entries:', scenes.length);
console.log('Total dialogue lines:', dialogueIdx);
if (scenes.length !== htmlSceneCount) {
    console.log('WARNING: mismatch!');
}
