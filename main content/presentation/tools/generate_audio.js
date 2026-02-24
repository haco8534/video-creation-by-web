/**
 * generate_audio.js
 * 
 * VOICEVOX API を使って台本の各セリフの音声を生成する。
 * 
 * 使い方: node tools/generate_audio.js <project_dir>
 * 
 * scene_map.json のオプション:
 *   speed_scale: 読み上げ速度倍率（デフォルト1.0、1.2で1.2倍速）
 *   inter_line_silence: セリフ間の無音秒数（デフォルト0.3）
 *   scene_end_padding: シーン末尾パディング秒数（デフォルト0.5）
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node generate_audio.js <project_dir>');
    process.exit(1);
}

const PRES_ROOT = path.resolve(__dirname, '..');
const PROJECT_DIR = path.resolve(PRES_ROOT, args[0]);
const MAP_FILE = path.join(PROJECT_DIR, 'scene_map.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');

if (!fs.existsSync(MAP_FILE)) {
    console.error(`scene_map.json not found: ${MAP_FILE}`);
    process.exit(1);
}

function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = http.request({
            hostname: urlObj.hostname, port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

function getWavDuration(buffer) {
    const byteRate = buffer.readUInt32LE(28);
    const dataSize = buffer.length - 44;
    return dataSize / byteRate;
}

async function synthesize(text, speakerId, voicevoxUrl, speedScale) {
    // Step 1: audio_query
    const queryUrl = `${voicevoxUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryRes = await httpRequest(queryUrl, { method: 'POST' });
    if (queryRes.status !== 200) throw new Error(`audio_query failed: ${queryRes.status}`);

    // Step 2: modify speedScale
    const queryData = JSON.parse(queryRes.body.toString());
    queryData.speedScale = speedScale;
    const modifiedQuery = JSON.stringify(queryData);

    // Step 3: synthesis
    const synthUrl = `${voicevoxUrl}/synthesis?speaker=${speakerId}`;
    const synthRes = await httpRequest(synthUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: modifiedQuery,
    });
    if (synthRes.status !== 200) throw new Error(`synthesis failed: ${synthRes.status}`);
    return synthRes.body;
}

async function main() {
    const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8'));
    const { voicevox_url, speakers, scenes } = map;
    const speedScale = map.speed_scale || 1.0;
    const interLineSilence = map.inter_line_silence || 0.3;
    const sceneEndPadding = map.scene_end_padding || 0.5;

    console.log(`Speed scale: ${speedScale}x`);
    console.log(`Inter-line silence: ${interLineSilence}s`);
    console.log(`Scene end padding: ${sceneEndPadding}s\n`);

    if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

    const sceneDurations = [];
    let totalLines = 0;
    scenes.forEach(s => { totalLines += s.lines.length; });
    let processedLines = 0;

    for (const scene of scenes) {
        let sceneDuration = scene.hold_sec || 0;
        const sceneAudioFiles = [];

        for (let li = 0; li < scene.lines.length; li++) {
            const line = scene.lines[li];
            const speakerId = speakers[line.speaker];
            if (speakerId === undefined) { console.error(`Unknown speaker: ${line.speaker}`); continue; }

            const filename = `scene_${String(scene.id).padStart(2, '0')}_${String(li).padStart(2, '0')}.wav`;
            const filepath = path.join(AUDIO_DIR, filename);

            if (fs.existsSync(filepath)) {
                const buf = fs.readFileSync(filepath);
                const dur = getWavDuration(buf);
                sceneDuration += dur;
                sceneAudioFiles.push({ file: filename, duration: dur, speaker: line.speaker });
                processedLines++;
                console.log(`[${processedLines}/${totalLines}] SKIP ${filename} (${dur.toFixed(1)}s)`);
                continue;
            }

            console.log(`[${processedLines + 1}/${totalLines}] Generating ${filename} ...`);
            try {
                const wav = await synthesize(line.text, speakerId, voicevox_url, speedScale);
                fs.writeFileSync(filepath, wav);
                const dur = getWavDuration(wav);
                sceneDuration += dur;
                sceneAudioFiles.push({ file: filename, duration: dur, speaker: line.speaker });
                console.log(`  -> ${dur.toFixed(1)}s`);
            } catch (e) {
                console.error(`  ERROR: ${e.message}`);
            }
            processedLines++;
        }

        // Add inter-line silence and scene-end padding to duration
        if (scene.lines.length > 0) {
            const interSilence = (scene.lines.length - 1) * interLineSilence;
            sceneDuration += interSilence + sceneEndPadding;
        }

        sceneDurations.push({
            id: scene.id, title: scene.title,
            duration: Math.round(sceneDuration * 10) / 10,
            audioFiles: sceneAudioFiles,
        });
        console.log(`Scene ${scene.id} "${scene.title}": ${sceneDuration.toFixed(1)}s total\n`);
    }

    const durFile = path.join(PROJECT_DIR, 'scene_durations.json');
    fs.writeFileSync(durFile, JSON.stringify(sceneDurations, null, 2), 'utf-8');

    const totalDur = sceneDurations.reduce((a, s) => a + s.duration, 0);
    console.log(`\n=== Done! Total: ${(totalDur / 60).toFixed(1)} min (${totalDur.toFixed(1)}s) ===`);
}

main().catch(console.error);
