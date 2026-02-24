/**
 * merge_audio.js
 * 
 * 各シーンの音声ファイルを結合し、映像と合体させる。
 * 
 * 使い方: node tools/merge_audio.js <project_dir>
 * 例:     node tools/merge_audio.js llm_text_generation
 * 
 * 必要ファイル:
 *   <project_dir>/scene_durations.json
 *   <project_dir>/audio/scene_XX_YY.wav
 *   <project_dir>/recording.mp4 (任意、あれば合体)
 * 
 * 出力:
 *   <project_dir>/audio/full_audio.wav
 *   <project_dir>/final_output.mp4 (recording.mp4があれば)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node merge_audio.js <project_dir>');
    process.exit(1);
}

const PRES_ROOT = path.resolve(__dirname, '..');
const PROJECT_DIR = path.resolve(PRES_ROOT, args[0]);
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const DURATIONS_FILE = path.join(PROJECT_DIR, 'scene_durations.json');
const OUTPUT_WAV = path.join(AUDIO_DIR, 'full_audio.wav');
const OUTPUT_VIDEO = path.join(PROJECT_DIR, 'final_output.mp4');
const RECORDING_VIDEO = path.join(PROJECT_DIR, 'recording.mp4');

// Use execFileSync to avoid shell quoting issues with Japanese paths
function ffmpeg(...args) {
    execFileSync('ffmpeg', args, { stdio: 'pipe' });
}

function ffmpegInherit(...args) {
    execFileSync('ffmpeg', args, { stdio: 'inherit' });
}

function ffprobeDuration(file) {
    const result = execFileSync('ffprobe', [
        '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file
    ], { encoding: 'utf-8' });
    return parseFloat(result.trim());
}

function main() {
    const durations = JSON.parse(fs.readFileSync(DURATIONS_FILE, 'utf-8'));
    const sceneWavFiles = [];

    // Silence between lines
    const silenceFile = path.join(AUDIO_DIR, 'silence_300ms.wav');
    if (!fs.existsSync(silenceFile)) {
        ffmpeg('-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.3', '-q:a', '0', silenceFile);
    }

    for (const scene of durations) {
        const prefix = `scene_${String(scene.id).padStart(2, '0')}`;
        const sceneFile = path.join(AUDIO_DIR, `${prefix}_full.wav`);

        if (scene.audioFiles.length === 0) {
            console.log(`Scene ${scene.id}: ${scene.duration}s silence`);
            ffmpeg('-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(scene.duration), '-q:a', '0', sceneFile);
        } else {
            const listFile = path.join(AUDIO_DIR, `${prefix}_list.txt`);
            const lines = [];
            for (let i = 0; i < scene.audioFiles.length; i++) {
                lines.push(`file '${path.join(AUDIO_DIR, scene.audioFiles[i].file).replace(/\\/g, '/')}'`);
                if (i < scene.audioFiles.length - 1) {
                    lines.push(`file '${silenceFile.replace(/\\/g, '/')}'`);
                }
            }
            fs.writeFileSync(listFile, lines.join('\n'), 'utf-8');

            const concatFile = path.join(AUDIO_DIR, `${prefix}_concat.wav`);
            ffmpeg('-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', concatFile);

            const actualDur = ffprobeDuration(concatFile);
            const padDur = Math.max(0, scene.duration - actualDur);

            const overDur = actualDur - scene.duration;
            console.log(`Scene ${scene.id}: audio=${actualDur.toFixed(1)}s, target=${scene.duration}s, ${padDur > 0.1 ? `pad=${padDur.toFixed(1)}s` : overDur > 0.1 ? `TRIM=${overDur.toFixed(1)}s` : 'OK'}`);

            if (overDur > 0.1) {
                // Audio is longer than target → trim it
                ffmpeg('-y', '-i', concatFile, '-t', String(scene.duration), '-c', 'copy', sceneFile);
            } else if (padDur > 0.1) {
                // Audio is shorter → pad with silence
                const padFile = path.join(AUDIO_DIR, `${prefix}_pad.wav`);
                ffmpeg('-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(padDur), '-q:a', '0', padFile);
                const padListFile = path.join(AUDIO_DIR, `${prefix}_padlist.txt`);
                fs.writeFileSync(padListFile, [
                    `file '${concatFile.replace(/\\/g, '/')}'`,
                    `file '${padFile.replace(/\\/g, '/')}'`,
                ].join('\n'), 'utf-8');
                ffmpeg('-y', '-f', 'concat', '-safe', '0', '-i', padListFile, '-c', 'copy', sceneFile);
            } else {
                fs.copyFileSync(concatFile, sceneFile);
            }
        }
        sceneWavFiles.push(sceneFile);
    }

    // Concatenate all
    console.log('\nConcatenating all scenes...');
    const masterListFile = path.join(AUDIO_DIR, 'master_list.txt');
    fs.writeFileSync(masterListFile, sceneWavFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf-8');
    ffmpeg('-y', '-f', 'concat', '-safe', '0', '-i', masterListFile, '-c', 'copy', OUTPUT_WAV);

    const finalDur = ffprobeDuration(OUTPUT_WAV);
    console.log(`Full audio: ${finalDur.toFixed(1)}s (${(finalDur / 60).toFixed(1)}min)`);

    // Merge video + audio
    if (fs.existsSync(RECORDING_VIDEO)) {
        console.log('\nMerging video + audio...');
        ffmpegInherit('-y', '-i', RECORDING_VIDEO, '-i', OUTPUT_WAV, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', OUTPUT_VIDEO);
        console.log(`\n=== Final: ${OUTPUT_VIDEO} ===`);
    } else {
        console.log(`\nNote: recording.mp4 not found. Run record.js first.`);
    }
}

main();
