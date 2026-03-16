/**
 * update_timestamps.js
 *
 * scene_durations.json の累積時間から概要欄のタイムスタンプを正確な値に書き換える。
 *
 * 使い方:
 *   node update_timestamps.js <project_id> <description_md_path>
 *
 * 例:
 *   node update_timestamps.js money_happiness "d:/myfolder/動画生成/完成品/お金で幸福は買えないは本当か/概要欄.md"
 *
 * マッチング戦略:
 *   概要欄のタイムスタンプ行を上から順にT0, T1, T2... とする。
 *   scene_durations.json に含まれるシーンタイトルと、各タイムスタンプ行のラベルを
 *   部分一致で照合する。各タイムスタンプ行について最もスコアの高いシーン（未使用）を
 *   割り当てる。ただし結果は時系列順（sceneId昇順）になるよう制約する。
 *
 *   T0 が "00:00" の場合は必ず scene 0（累積 0秒）を割り当てる。
 */

const fs = require('fs');
const path = require('path');

// ───── 引数 ─────
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node update_timestamps.js <project_id> <description_md_path>');
    process.exit(1);
}

const projectId = args[0];
const descPath = args[1];

const presDir = path.resolve(__dirname, '..', projectId);
const durPath = path.join(presDir, 'scene_durations.json');

if (!fs.existsSync(durPath)) {
    console.error(`scene_durations.json not found: ${durPath}`);
    process.exit(1);
}
if (!fs.existsSync(descPath)) {
    console.error(`Description file not found: ${descPath}`);
    process.exit(1);
}

// ───── scene_durations 読み込み ─────
const scenes = JSON.parse(fs.readFileSync(durPath, 'utf8'));

const sceneStarts = [];
let cumulative = 0;
for (const scene of scenes) {
    sceneStarts.push({
        id: scene.id,
        title: scene.title,
        startSec: cumulative,
    });
    cumulative += scene.duration;
}

console.log(`Loaded ${scenes.length} scenes (total: ${fmtTime(cumulative)})`);

// ───── 概要欄読み込み ─────
let desc = fs.readFileSync(descPath, 'utf8');
const lines = desc.split('\n');

const tsRegex = /^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/;
const tsEntries = [];
for (let i = 0; i < lines.length; i++) {
    const m = lines[i].trim().match(tsRegex);
    if (m) {
        tsEntries.push({ lineIndex: i, origTime: m[1], label: m[2].trim() });
    }
}

if (tsEntries.length === 0) {
    console.error('No timestamp lines found in description.');
    process.exit(1);
}

console.log(`\nFound ${tsEntries.length} timestamp lines:`);
tsEntries.forEach(t => console.log(`  ${t.origTime} ${t.label}`));

// ───── マッチング ─────
// 各タイムスタンプ行に対し、シーンとの類似度スコアを計算
function calcScore(label, sceneTitle) {
    // ラベルを「—」等で分割してキーワードを取り出す
    const parts = label.split(/[—–──\-：:]+/).map(s => s.trim()).filter(Boolean);
    let maxScore = 0;

    for (const part of parts) {
        const chars = [...part];
        // 3文字以上の共通部分文字列を探す
        for (let len = Math.min(chars.length, 12); len >= 3; len--) {
            for (let start = 0; start <= chars.length - len; start++) {
                const sub = chars.slice(start, start + len).join('');
                if (sceneTitle.includes(sub)) {
                    maxScore = Math.max(maxScore, len);
                }
            }
        }
    }
    return maxScore;
}

// 全組み合わせのスコア行列を計算
const scoreMatrix = tsEntries.map(ts =>
    sceneStarts.map(scene => calcScore(ts.label, scene.title))
);

// 貪欲に割り当て: 時系列順を保つ制約つき
// tsEntries[0]→tsEntries[N-1] の順に、前に割り当てたsceneIdより大きいシーンの中から
// 最もスコアが高いものを選ぶ。
const assignments = []; // { tsIndex, sceneIndex, score }
let lastAssignedSceneId = -1;

for (let ti = 0; ti < tsEntries.length; ti++) {
    const ts = tsEntries[ti];

    // 先頭が "00:00" の場合は scene 0 を強制割り当て
    if (ti === 0 && ts.origTime === '00:00') {
        assignments.push({ tsIndex: ti, sceneIndex: 0, score: 999 });
        lastAssignedSceneId = 0;
        continue;
    }

    // 候補: lastAssignedSceneId より後のシーン
    let bestSceneIdx = -1;
    let bestScore = -1;

    for (let si = 0; si < sceneStarts.length; si++) {
        if (sceneStarts[si].id <= lastAssignedSceneId) continue;

        // 未来のタイムスタンプ行のために十分なシーンを残す制約
        const remainingTs = tsEntries.length - ti - 1;
        const remainingScenes = sceneStarts.length - si - 1;
        if (remainingScenes < remainingTs) continue;

        const score = scoreMatrix[ti][si];
        if (score > bestScore) {
            bestScore = score;
            bestSceneIdx = si;
        }
    }

    if (bestSceneIdx >= 0) {
        assignments.push({ tsIndex: ti, sceneIndex: bestSceneIdx, score: bestScore });
        lastAssignedSceneId = sceneStarts[bestSceneIdx].id;
    } else {
        console.error(`  ❌ No matching scene for: "${ts.label}"`);
        assignments.push({ tsIndex: ti, sceneIndex: -1, score: 0 });
    }
}

// ───── 書き換え ─────
console.log('\nTimestamp mapping:');
for (const a of assignments) {
    const ts = tsEntries[a.tsIndex];
    if (a.sceneIndex < 0) continue;

    const scene = sceneStarts[a.sceneIndex];
    const newTime = fmtTime(scene.startSec);
    console.log(`  ${ts.origTime} -> ${newTime}  ${ts.label}  (scene ${scene.id}: "${scene.title}")`);

    const origLine = lines[ts.lineIndex];
    const indent = origLine.match(/^(\s*)/)[1];
    lines[ts.lineIndex] = `${indent}${newTime} ${ts.label}`;
}

// "※時間は推定値" コメント行を除去
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('※時間は推定値') || lines[i].includes('要調整')) {
        console.log(`\nRemoved: "${lines[i].trim()}"`);
        lines[i] = '';
    }
}

// 書き出し
const newDesc = lines.join('\n');
fs.writeFileSync(descPath, newDesc, 'utf8');
console.log(`\n✅ Updated: ${descPath}`);

// ───── ヘルパー ─────
function fmtTime(sec) {
    const totalSec = Math.round(sec);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
