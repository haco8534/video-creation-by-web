const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const projectDir = path.join(__dirname);
const chunksDir = path.join(projectDir, 'chunks');
const durPath = path.join(projectDir, 'scene_durations.json');
const durations = JSON.parse(fs.readFileSync(durPath, 'utf8'));

// Check each chunk's actual duration vs expected
const chunkFiles = fs.readdirSync(chunksDir)
    .filter(f => f.startsWith('chunk_') && f.endsWith('.mkv'))
    .sort();

const scenesPerWorker = Math.ceil(durations.length / 4);
let totalActual = 0;
let totalExpected = 0;

for (let i = 0; i < chunkFiles.length; i++) {
    const chunkPath = path.join(chunksDir, chunkFiles[i]);
    const actualDur = parseFloat(execFileSync('ffprobe', [
        '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', chunkPath
    ], { encoding: 'utf-8' }).trim());

    const start = i * scenesPerWorker;
    const end = Math.min(start + scenesPerWorker, durations.length);
    const chunkScenes = durations.slice(start, end);
    const expectedDur = chunkScenes.reduce((a, s) => a + s.duration, 0);

    const drift = actualDur - expectedDur;
    const flag = Math.abs(drift) > 0.5 ? ' ⚠️' : ' ✅';

    console.log(`${chunkFiles[i]}: actual=${actualDur.toFixed(2)}s expected=${expectedDur.toFixed(2)}s drift=${drift.toFixed(2)}s${flag}`);
    console.log(`  Scenes ${chunkScenes[0].id}-${chunkScenes[chunkScenes.length-1].id} (${chunkScenes.length} scenes)`);

    totalActual += actualDur;
    totalExpected += expectedDur;
}

console.log(`\nTotal: actual=${totalActual.toFixed(2)}s expected=${totalExpected.toFixed(2)}s drift=${(totalActual - totalExpected).toFixed(2)}s`);
