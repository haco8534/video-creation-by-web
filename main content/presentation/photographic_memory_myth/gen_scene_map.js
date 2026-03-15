const fs = require('fs');

// Read the script
const scriptPath = 'd:/myfolder/動画生成/台本作成/「写真記憶」は存在しない/script.md';
const script = fs.readFileSync(scriptPath, 'utf8');

const lines = script.split(/\r?\n/);

// Parse SCENE markers and dialogue lines
const scenes = [];
let currentScene = null;

for (const line of lines) {
    const sceneMatch = line.match(/^<!-- SCENE: (.+?) \| (.+?) -->$/);
    if (sceneMatch) {
        if (currentScene) scenes.push(currentScene);
        currentScene = {
            id: scenes.length,
            title: sceneMatch[2].trim(),
            hold_sec: 0,
            lines: []
        };
        continue;
    }

    const dialogueMatch = line.match(/^(ずんだもん|めたん)：(.+)$/);
    if (dialogueMatch && currentScene) {
        currentScene.lines.push({
            speaker: dialogueMatch[1],
            text: dialogueMatch[2].trim()
        });
    }
}
if (currentScene) scenes.push(currentScene);

const sceneMap = {
    voicevox_url: "http://localhost:50021",
    speakers: {
        "ずんだもん": 3,
        "めたん": 2
    },
    speed_scale: 1.15,
    inter_line_silence: 0.3,
    scene_end_padding: 0.5,
    scenes: scenes
};

const outPath = 'scene_map.json';
fs.writeFileSync(outPath, JSON.stringify(sceneMap, null, 2), 'utf8');

console.log(`Generated ${outPath}`);
console.log(`Total scenes: ${scenes.length}`);
console.log(`Total lines: ${scenes.reduce((s, sc) => s + sc.lines.length, 0)}`);

// Verify scene count
scenes.forEach((s, i) => {
    console.log(`  Scene ${i}: "${s.title}" (${s.lines.length} lines)`);
});
