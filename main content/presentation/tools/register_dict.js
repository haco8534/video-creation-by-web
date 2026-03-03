/**
 * register_dict.js
 * 
 * scene_map.json 内のセリフテキストを解析し、英語・専門用語・読み間違えやすい単語を
 * VOICEVOX のユーザー辞書 API に自動登録する。
 * 
 * 使い方: node tools/register_dict.js <project_dir>
 * 
 * 動作:
 *   1. scene_map.json からセリフ全文を取得
 *   2. 台本中の英語・専門用語を正規表現で抽出
 *   3. 組み込み辞書 + プロジェクト固有辞書(.voicevox_dict.json)を読み込み
 *   4. 既に VOICEVOX に登録済みの単語はスキップ
 *   5. 未登録の単語を VOICEVOX ユーザー辞書 API で登録
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

// ============================================================
// 組み込み辞書（全プロジェクト共通で読み間違えやすい単語）
// surface: 台本上の表記（全角半角どちらでもマッチさせる）
// pronunciation: カタカナ読み（VOICEVOX形式）
// accent_type: アクセント核の位置（0=平板）
// ============================================================
const BUILTIN_DICT = [
    // 一般的な学術用語・略語
    { surface: 'DOMS', pronunciation: 'ドムス', accent_type: 1 },
    { surface: 'pH', pronunciation: 'ピーエイチ', accent_type: 3 },
    { surface: 'vs', pronunciation: 'バーサス', accent_type: 1 },
    { surface: 'VS', pronunciation: 'バーサス', accent_type: 1 },
    { surface: 'RBE', pronunciation: 'アールビーイー', accent_type: 5 },

    // 英語略語（よく出るもの）
    { surface: 'AI', pronunciation: 'エーアイ', accent_type: 3 },
    { surface: 'IQ', pronunciation: 'アイキュー', accent_type: 3 },
    { surface: 'SNS', pronunciation: 'エスエヌエス', accent_type: 5 },
    { surface: 'DNA', pronunciation: 'ディーエヌエー', accent_type: 5 },
    { surface: 'RNA', pronunciation: 'アールエヌエー', accent_type: 5 },
    { surface: 'fMRI', pronunciation: 'エフエムアールアイ', accent_type: 7 },
    { surface: 'EEG', pronunciation: 'イーイージー', accent_type: 5 },
    { surface: 'BMI', pronunciation: 'ビーエムアイ', accent_type: 5 },
    { surface: 'WHO', pronunciation: 'ダブリューエイチオー', accent_type: 7 },
    { surface: 'APA', pronunciation: 'エーピーエー', accent_type: 5 },
    { surface: 'ADHD', pronunciation: 'エーディーエイチディー', accent_type: 7 },
    { surface: 'LLM', pronunciation: 'エルエルエム', accent_type: 5 },
    { surface: 'GPT', pronunciation: 'ジーピーティー', accent_type: 5 },
    { surface: 'RCT', pronunciation: 'アールシーティー', accent_type: 5 },
    { surface: 'BPE', pronunciation: 'ビーピーイー', accent_type: 5 },
    { surface: 'UC', pronunciation: 'ユーシー', accent_type: 3 },

    // 英語単語（個別に登録。フレーズではなく1単語ずつ）
    { surface: 'George', pronunciation: 'ジョージ', accent_type: 1 },
    { surface: 'Brooks', pronunciation: 'ブルックス', accent_type: 1 },
    { surface: 'Hill', pronunciation: 'ヒル', accent_type: 0 },
    { surface: 'Meyerhof', pronunciation: 'マイヤーホフ', accent_type: 1 },
    { surface: 'Fletcher', pronunciation: 'フレッチャー', accent_type: 1 },
    { surface: 'Hopkins', pronunciation: 'ホプキンズ', accent_type: 1 },
    { surface: 'Berkeley', pronunciation: 'バークレー', accent_type: 1 },
    { surface: 'Nobel', pronunciation: 'ノーベル', accent_type: 1 },
    { surface: 'Cell', pronunciation: 'セル', accent_type: 0 },
    { surface: 'Metabolism', pronunciation: 'メタボリズム', accent_type: 1 },
    { surface: 'Repeated', pronunciation: 'リピーテッド', accent_type: 1 },
    { surface: 'Bout', pronunciation: 'バウト', accent_type: 1 },
    { surface: 'Effect', pronunciation: 'エフェクト', accent_type: 1 },
    { surface: 'Delayed', pronunciation: 'ディレイド', accent_type: 1 },
    { surface: 'Onset', pronunciation: 'オンセット', accent_type: 1 },
    { surface: 'Muscle', pronunciation: 'マッスル', accent_type: 1 },
    { surface: 'Soreness', pronunciation: 'ソーネス', accent_type: 1 },
    { surface: 'Word', pronunciation: 'ワード', accent_type: 1 },
    { surface: 'Embedding', pronunciation: 'エンベディング', accent_type: 1 },
    { surface: 'Nature', pronunciation: 'ネイチャー', accent_type: 1 },
    { surface: 'Science', pronunciation: 'サイエンス', accent_type: 1 },
    { surface: 'Journal', pronunciation: 'ジャーナル', accent_type: 1 },
    { surface: 'Review', pronunciation: 'レビュー', accent_type: 1 },
    { surface: 'Study', pronunciation: 'スタディ', accent_type: 1 },
    { surface: 'Research', pronunciation: 'リサーチ', accent_type: 1 },
    { surface: 'University', pronunciation: 'ユニバーシティ', accent_type: 1 },
    { surface: 'Professor', pronunciation: 'プロフェッサー', accent_type: 1 },
    { surface: 'Theory', pronunciation: 'セオリー', accent_type: 1 },
    { surface: 'Experiment', pronunciation: 'エクスペリメント', accent_type: 1 },
    { surface: 'Evidence', pronunciation: 'エビデンス', accent_type: 1 },
    { surface: 'Bias', pronunciation: 'バイアス', accent_type: 1 },
    { surface: 'Meta', pronunciation: 'メタ', accent_type: 1 },
    { surface: 'Analysis', pronunciation: 'アナリシス', accent_type: 1 },
    { surface: 'Placebo', pronunciation: 'プラセボ', accent_type: 1 },
    { surface: 'Correlation', pronunciation: 'コリレーション', accent_type: 1 },
    { surface: 'Causation', pronunciation: 'コーゼーション', accent_type: 1 },
    { surface: 'Cognitive', pronunciation: 'コグニティブ', accent_type: 1 },
    { surface: 'Psychology', pronunciation: 'サイコロジー', accent_type: 1 },
    { surface: 'Neuroscience', pronunciation: 'ニューロサイエンス', accent_type: 1 },

    // 記号・数式的表記
    { surface: 'H+', pronunciation: 'エイチプラス', accent_type: 3 },

    // カタカナ人名・学術用語（読み間違え防止）
    { surface: 'フレッチャー', pronunciation: 'フレッチャー', accent_type: 4 },
    { surface: 'ホプキンズ', pronunciation: 'ホプキンズ', accent_type: 1 },
    { surface: 'ブルックス', pronunciation: 'ブルックス', accent_type: 1 },
    { surface: 'マイヤーホフ', pronunciation: 'マイヤーホフ', accent_type: 1 },
    { surface: 'デュ・ボワ', pronunciation: 'デュボワ', accent_type: 1 },
    { surface: 'レイモン', pronunciation: 'レイモン', accent_type: 1 },
    { surface: 'エキセントリック', pronunciation: 'エキセントリック', accent_type: 5 },
    { surface: 'コンセントリック', pronunciation: 'コンセントリック', accent_type: 5 },
    { surface: 'マクロファージ', pronunciation: 'マクロファージ', accent_type: 5 },
    { surface: 'ブラジキニン', pronunciation: 'ブラジキニン', accent_type: 4 },
    { surface: 'プロスタグランジン', pronunciation: 'プロスタグランジン', accent_type: 7 },
    { surface: 'アストロサイト', pronunciation: 'アストロサイト', accent_type: 5 },
    { surface: 'グルコース', pronunciation: 'グルコース', accent_type: 3 },
    { surface: 'ラクテート', pronunciation: 'ラクテート', accent_type: 3 },
    { surface: 'ラクトルモン', pronunciation: 'ラクトルモン', accent_type: 5 },
    { surface: 'ニューロン', pronunciation: 'ニューロン', accent_type: 1 },
];

// ============================================================
// HTTP リクエストヘルパー
// ============================================================
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

// ============================================================
// メイン処理
// ============================================================
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node register_dict.js <project_dir>');
        process.exit(1);
    }

    const PRES_ROOT = path.resolve(__dirname, '..');
    const PROJECT_DIR = path.resolve(PRES_ROOT, args[0]);
    const MAP_FILE = path.join(PROJECT_DIR, 'scene_map.json');

    if (!fs.existsSync(MAP_FILE)) {
        console.error(`scene_map.json not found: ${MAP_FILE}`);
        process.exit(1);
    }

    const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8'));
    const voicevoxUrl = map.voicevox_url || 'http://localhost:50021';

    // 1. 全セリフテキストを結合
    const allText = map.scenes.flatMap(s => s.lines.map(l => l.text)).join('\n');
    console.log(`Total text length: ${allText.length} chars\n`);

    // 2. プロジェクト固有辞書の読み込み（あれば）
    const projectDictPath = path.join(PROJECT_DIR, '.voicevox_dict.json');
    let projectDict = [];
    if (fs.existsSync(projectDictPath)) {
        try {
            projectDict = JSON.parse(fs.readFileSync(projectDictPath, 'utf-8'));
            console.log(`Project dict: ${projectDict.length} entries loaded`);
        } catch (e) {
            console.warn(`Warning: could not parse project dict: ${e.message}`);
        }
    }

    // 3. 組み込み辞書 + プロジェクト辞書を統合
    const fullDict = [...BUILTIN_DICT, ...projectDict];

    // 4. テキスト中に出現する単語だけフィルタ
    const relevantEntries = [];
    const seenSurfaces = new Set();
    for (const entry of fullDict) {
        if (seenSurfaces.has(entry.surface.toLowerCase())) continue;
        if (allText.includes(entry.surface)) {
            relevantEntries.push(entry);
            seenSurfaces.add(entry.surface.toLowerCase());
        }
    }
    console.log(`Relevant dict entries found in text: ${relevantEntries.length}\n`);

    // 5. 現在の VOICEVOX 辞書を取得
    const existingRes = await httpRequest(`${voicevoxUrl}/user_dict`);
    if (existingRes.status !== 200) {
        console.error(`Failed to get user_dict: ${existingRes.status}`);
        process.exit(1);
    }
    const existingDict = JSON.parse(existingRes.body.toString());
    const existingSurfaces = new Map();
    for (const [uuid, entry] of Object.entries(existingDict)) {
        // VOICEVOX stores surfaces in full-width, normalize for comparison
        const normalized = entry.surface
            .replace(/[Ａ-Ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
            .replace(/[ａ-ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
            .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
        existingSurfaces.set(normalized.toLowerCase(), { uuid, ...entry });
    }
    console.log(`VOICEVOX dict already has: ${existingSurfaces.size} entries\n`);

    // 6. 未登録の単語を登録
    let registered = 0;
    let skipped = 0;
    let updated = 0;

    for (const entry of relevantEntries) {
        const normalizedSurface = entry.surface.toLowerCase();
        const existing = existingSurfaces.get(normalizedSurface);

        if (existing) {
            // 読みが同じならスキップ
            if (existing.pronunciation === entry.pronunciation) {
                console.log(`  SKIP: "${entry.surface}" (already registered as ${existing.pronunciation})`);
                skipped++;
                continue;
            }
            // 読みが違うなら更新
            console.log(`  UPDATE: "${entry.surface}" ${existing.pronunciation} -> ${entry.pronunciation}`);
            const updateUrl = `${voicevoxUrl}/user_dict_word/${existing.uuid}?` +
                `surface=${encodeURIComponent(entry.surface)}` +
                `&pronunciation=${encodeURIComponent(entry.pronunciation)}` +
                `&accent_type=${entry.accent_type}` +
                `&priority=${entry.priority || 5}`;
            const updateRes = await httpRequest(updateUrl, { method: 'PUT' });
            if (updateRes.status === 204) {
                updated++;
            } else {
                console.error(`    Failed to update: ${updateRes.status} ${updateRes.body.toString()}`);
            }
            continue;
        }

        // 新規登録
        const registerUrl = `${voicevoxUrl}/user_dict_word?` +
            `surface=${encodeURIComponent(entry.surface)}` +
            `&pronunciation=${encodeURIComponent(entry.pronunciation)}` +
            `&accent_type=${entry.accent_type}` +
            `&priority=${entry.priority || 5}`;
        const registerRes = await httpRequest(registerUrl, { method: 'POST' });

        if (registerRes.status === 200) {
            console.log(`  ✅ REGISTERED: "${entry.surface}" -> ${entry.pronunciation}`);
            registered++;
        } else {
            console.error(`  ❌ FAILED: "${entry.surface}" -> ${registerRes.status} ${registerRes.body.toString()}`);
        }
    }

    console.log(`\n=== Dictionary registration complete ===`);
    console.log(`  Registered: ${registered}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Total in VOICEVOX: ${existingSurfaces.size + registered}`);

    // ============================================================
    // 7. 辞書カバー漏れチェック: テキスト中の英語表記を全て検出し、
    //    辞書（組み込み＋プロジェクト＋既存VOICEVOX）でカバーされていないものを報告
    // ============================================================
    console.log(`\n--- Checking for uncovered English text ---`);

    // 英語の正規表現: 2文字以上の英語（略語、単語、フレーズ）を検出
    // ただし単一文字（pH の p など）はフレーズの一部として検出
    const englishPatterns = [];
    const engRe = /[A-Za-z][A-Za-z\s.'-]*[A-Za-z]/g;
    let engMatch;
    while ((engMatch = engRe.exec(allText)) !== null) {
        const raw = engMatch[0].trim();
        if (raw.length >= 2) englishPatterns.push(raw);
    }
    // 単独の英字+記号パターン（例: pH, H+）
    const singleRe = /(?<![A-Za-z])[A-Za-z]{1,2}(?:\+|-|#)?(?![A-Za-z])/g;
    while ((engMatch = singleRe.exec(allText)) !== null) {
        const raw = engMatch[0].trim();
        if (raw.length >= 2 || /[+\-#]/.test(raw)) englishPatterns.push(raw);
    }
    const uniqueEnglish = [...new Set(englishPatterns)];

    // 辞書でカバーされている表記のSet（surface単位）
    const coveredSurfaces = new Set();
    for (const entry of fullDict) {
        coveredSurfaces.add(entry.surface);
        coveredSurfaces.add(entry.surface.toLowerCase());
        coveredSurfaces.add(entry.surface.toUpperCase());
    }
    // 既存VOICEVOX辞書もカバー済みとして扱う
    for (const [normalized] of existingSurfaces) {
        coveredSurfaces.add(normalized);
    }

    // 各英語表記を単語単位に分割し、個々の単語がカバーされているかチェック
    const uncoveredWords = new Set();
    for (const eng of uniqueEnglish) {
        // フレーズの場合は個別単語に分割
        const words = eng.split(/[\s.'-]+/).filter(w => w.length >= 2);
        for (const word of words) {
            if (coveredSurfaces.has(word) || coveredSurfaces.has(word.toLowerCase()) || coveredSurfaces.has(word.toUpperCase())) continue;
            uncoveredWords.add(word);
        }
    }

    if (uncoveredWords.size > 0) {
        console.log(`\n🚨 ${uncoveredWords.size} English word(s) NOT covered by dictionary:`);
        [...uncoveredWords].sort().forEach(w => console.log(`  ❌ "${w}"`));
        console.log(`\nPlease add these to .voicevox_dict.json with correct pronunciation.`);
        console.log(`Format: { "surface": "${[...uncoveredWords][0]}", "pronunciation": "カタカナ", "accent_type": 0 }`);
        process.exit(1);
    } else {
        console.log(`✅ All English words are covered by dictionary.`);
    }
}

main().catch(console.error);
