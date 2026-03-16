const fs = require('fs');
const s = fs.readFileSync('d:\\myfolder\\動画生成\\ふぁくとラボ\\台本作成\\確証バイアス\\script.md', 'utf8');
const lines = s.split('\n');
const sceneRe = /<!-- SCENE: (.+?) \| (.+?) -->/;
let scenes = [];
let currentScene = null;
for (const line of lines) {
  const m = line.match(sceneRe);
  if (m) {
    if (currentScene) scenes.push(currentScene);
    currentScene = { type: m[1].trim(), title: m[2].trim(), lines: [] };
    continue;
  }
  if (currentScene) {
    const dm = line.match(/^(ずんだもん|めたん)：(.+)/);
    if (dm) {
      currentScene.lines.push({ speaker: dm[1], text: dm[2] });
    }
  }
}
if (currentScene) scenes.push(currentScene);

const output = {
  voicevox_url: "http://localhost:50021",
  speakers: { "ずんだもん": 3, "めたん": 2 },
  speed_scale: 1.14,
  inter_line_silence: 0.3,
  scene_end_padding: 0.5,
  scenes: scenes.map((sc, i) => ({
    id: i,
    title: sc.title,
    lines: sc.lines.map(l => ({ speaker: l.speaker, text: l.text }))
  }))
};

fs.writeFileSync(
  'd:\\myfolder\\動画生成\\ふぁくとラボ\\main content\\presentation\\confirmation_bias\\scene_map.json',
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log('Generated scene_map.json with ' + scenes.length + ' scenes');
scenes.forEach((sc, i) => console.log('  Scene ' + i + ': ' + sc.title + ' (' + sc.lines.length + ' lines)'));
