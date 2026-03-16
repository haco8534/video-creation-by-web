/**
 * record_debug.js - ffmpegのstderrを確認するデバッグ版
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_DIR = path.resolve(__dirname, '..', 'sleep_growth_science');
const DURATIONS_FILE = path.join(PROJECT_DIR, 'scene_durations.json');
const HTML_FILE = path.join(PROJECT_DIR, 'index.html');
const OUTPUT_FILE = path.join(PROJECT_DIR, 'chunks', 'chunk_test.mkv');
const WIDTH = 1920, HEIGHT = 1080, FPS = 30, CSS_ZOOM = 1.5;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const durations = JSON.parse(fs.readFileSync(DURATIONS_FILE, 'utf-8'));
    const fileUrl = 'file:///' + HTML_FILE.replace(/\\/g, '/');

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [`--window-size=${WIDTH},${HEIGHT}`, '--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((z) => { document.body.style.zoom = String(z); }, CSS_ZOOM);
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await sleep(2000);

    const ffmpeg = spawn('ffmpeg', [
        '-y', '-f', 'image2pipe', '-framerate', String(FPS),
        '-i', 'pipe:0',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
        '-pix_fmt', 'yuv420p', '-r', String(FPS),
        OUTPUT_FILE,
    ], { stdio: ['pipe', 'inherit', 'inherit'] }); // stderrをコンソールに直接出力

    ffmpeg.stdin.on('error', (e) => {
        console.warn('stdin error:', e.code);
    });

    const ffmpegDone = new Promise((resolve, reject) => {
        ffmpeg.on('close', (code) => {
            console.log('ffmpeg closed with code:', code);
            code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`));
        });
    });

    const cdp = await page.createCDPSession();
    let latestFrameBuffer = null;

    cdp.on('Page.screencastFrame', async (event) => {
        latestFrameBuffer = Buffer.from(event.data, 'base64');
        try { await cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }); } catch (e) { }
    });

    await cdp.send('Page.startScreencast', {
        format: 'jpeg', quality: 90,
        maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1,
    });

    while (!latestFrameBuffer) await sleep(50);

    const frameInterval = 1000 / FPS;
    let frameCount = 0;

    // 最初のシーンだけ3秒分録画してテスト
    await page.evaluate((idx) => window.goTo(idx), 0);
    const testFrames = FPS * 3;
    for (let f = 0; f < testFrames; f++) {
        if (latestFrameBuffer && !ffmpeg.stdin.destroyed) {
            const ok = ffmpeg.stdin.write(latestFrameBuffer);
            if (!ok) await new Promise(r => ffmpeg.stdin.once('drain', r));
            frameCount++;
        }
        await sleep(frameInterval);
    }

    console.log(`Wrote ${frameCount} frames`);
    try { await cdp.send('Page.stopScreencast'); } catch (e) { }
    ffmpeg.stdin.end();

    await Promise.race([
        ffmpegDone,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000))
    ]).catch(e => console.warn('ffmpegDone:', e.message));

    try { await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); } catch (e) { }
    try { browser.process()?.kill('SIGKILL'); } catch (e) { }

    // ファイル確認
    if (fs.existsSync(OUTPUT_FILE)) {
        console.log('Output file size:', fs.statSync(OUTPUT_FILE).size, 'bytes');
    } else {
        console.log('Output file NOT created!');
    }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
