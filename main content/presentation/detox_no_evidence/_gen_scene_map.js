const fs = require('fs'), path = require('path');
const SCRIPT_PATH = path.resolve('d:/myfolder/動画生成/台本作成/「デトックス」に科学的根拠はない/script.md');
const PROJECT_DIR = path.resolve('d:/myfolder/動画生成/main content/presentation/detox_no_evidence');
const HTML_PATH = path.join(PROJECT_DIR, 'index.html');
const OUT_PATH = path.join(PROJECT_DIR, 'scene_map.json');

const script = fs.readFileSync(SCRIPT_PATH, 'utf8');
const lines = script.split('\n');
const allDialogue = lines
    .filter(l => /^(ずんだもん|めたん)：/.test(l))
    .map(l => { const [name, ...rest] = l.split('：'); return { speaker: name, text: rest.join('：') }; });

const sceneMarkers = [];
let dialogueIdx = 0, currentTitle = null, currentLines = [];
lines.forEach(l => {
    if (l.includes('`') && l.includes('SCENE:')) return;
    const sm = l.match(/<!-- SCENE: (.+?) -->/);
    if (sm) {
        if (currentTitle !== null) sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });
        currentTitle = sm[1]; currentLines = []; return;
    }
    if (/^(ずんだもん|めたん)：/.test(l)) { dialogueIdx++; currentLines.push(dialogueIdx); }
});
if (currentTitle !== null) sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });

const html = fs.readFileSync(HTML_PATH, 'utf8');
const htmlSceneCount = (html.match(/id="scene-\d+"/g) || []).length;

function extractTitle(rawTitle) {
    if (rawTitle.includes('|')) return rawTitle.split('|').slice(1).join('|').trim();
    const m = rawTitle.match(/[「](.+?)[」]/);
    return m ? m[1] : rawTitle;
}

const scenes = sceneMarkers.map((s, i) => ({
    id: i,
    title: extractTitle(s.title),
    lines: s.lines.map(ln => allDialogue[ln - 1]).filter(Boolean)
}));

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
console.log('✅ scene_map.json generated');
console.log('   Script SCENE markers: ' + sceneMarkers.length);
console.log('   HTML scenes: ' + htmlSceneCount);
console.log('   scene_map entries: ' + scenes.length);
console.log('   Total dialogue lines: ' + dialogueIdx);
if (scenes.length !== htmlSceneCount) {
    console.log('⚠️  WARNING: scene_map entries (' + scenes.length + ') != HTML scenes (' + htmlSceneCount + ')');
}
