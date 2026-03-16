// Generate scene_map.json from script.md
const fs = require('fs');

const script = fs.readFileSync(process.argv[2] || 'tmp_script.md', 'utf8');

const sceneMap = {
  voicevox_url: "http://localhost:50021",
  speakers: { "ずんだもん": 3, "めたん": 2 },
  speed_scale: 1.14,
  inter_line_silence: 0.3,
  scene_end_padding: 0.5,
  scenes: []
};

const lines = script.split('\n');
let currentScene = null;
let sceneId = 0;

for (const line of lines) {
  const sceneMatch = line.match(/<!-- SCENE: .+?\| (.+?) -->/);
  if (sceneMatch) {
    if (currentScene) sceneMap.scenes.push(currentScene);
    currentScene = { id: sceneId++, title: sceneMatch[1].trim(), lines: [] };
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
if (currentScene) sceneMap.scenes.push(currentScene);

fs.writeFileSync(process.argv[3] || 'scene_map.json', JSON.stringify(sceneMap, null, 2), 'utf8');
console.log('Generated ' + sceneMap.scenes.length + ' scenes');
