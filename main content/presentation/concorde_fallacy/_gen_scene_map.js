const fs = require('fs');
const path = require('path');

const SCRIPT_PATH = path.resolve('d:/myfolder/動画生成/ふぁくとラボ/台本作成/コンコルドの誤り/script.md');
const PROJECT_DIR = path.resolve('d:/myfolder/動画生成/ふぁくとラボ/main content/presentation/concorde_fallacy');
const HTML_PATH = path.join(PROJECT_DIR, 'index.html');
const OUT_PATH = path.join(PROJECT_DIR, 'scene_map.json');

const script = fs.readFileSync(SCRIPT_PATH, 'utf8');
const lines = script.split(/\r?\n/);

const allDialogue = lines
    .filter(l => /^(ずんだもん|めたん)：/.test(l))
    .map(l => {
        const [name, ...rest] = l.split('：');
        return { speaker: name, text: rest.join('：') };
    });

const sceneMarkers = [];
let dialogueIdx = 0;
let currentTitle = null;
let currentLines = [];

lines.forEach(l => {
    if (l.includes('`') && l.includes('SCENE:')) return;
    const sm = l.match(/<!-- SCENE: (.+?) -->/);
    if (sm) {
        if (currentTitle !== null) sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });
        currentTitle = sm[1];
        currentLines = [];
        return;
    }
    if (/^(ずんだもん|めたん)：/.test(l)) {
        dialogueIdx++;
        currentLines.push(dialogueIdx);
    }
});
if (currentTitle !== null) sceneMarkers.push({ title: currentTitle, lines: [...currentLines] });

const html = fs.readFileSync(HTML_PATH, 'utf8');
const htmlSceneCount = (html.match(/id="scene-\d+"/g) || []).length;

function extractTitle(t) {
    if (t.includes('|')) return t.split('|').slice(1).join('|').trim();
    const m = t.match(/[「](.+?)[」]/);
    return m ? m[1] : t;
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
console.log('scene_map: ' + scenes.length + ' scenes, ' + dialogueIdx + ' lines, HTML: ' + htmlSceneCount);
if (scenes.length !== htmlSceneCount) {
    console.log('WARNING: mismatch!');
} else {
    console.log('OK: scene count matches');
}
