/**
 * export-character-pngs.js
 *
 * PSDファイルから表情プリセット別のPNGを書き出す。
 * レイヤーの表示/非表示を切り替えて各プリセットを合成する。
 *
 * 使い方:
 *   node scripts/export-character-pngs.js <psd_file> <character_name>
 *
 * 例:
 *   node scripts/export-character-pngs.js "d:/myfolder/動画生成/ずんだもん立ち絵素材2.3.psd" zundamon
 *
 * 出力:
 *   public/characters/<character_name>/neutral.png
 *   public/characters/<character_name>/happy.png
 *   ...
 */

const { readPsd, initializeCanvas } = require('ag-psd');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');
const path = require('path');

// ag-psd に node-canvas を登録
initializeCanvas(createCanvas);

const psdPath = process.argv[2];
const characterName = process.argv[3];

if (!psdPath || !characterName) {
    console.error('Usage: node export-character-pngs.js <psd_file> <character_name>');
    process.exit(1);
}

// ============================================================
// 表情プリセット定義
// 各パーツグループから表示するレイヤー名を指定
// ============================================================

const PRESETS = {
    neutral: {
        label: '普通',
        eyes: '普通目',       // !目/*目セット/!黒目 内
        whiteEyes: '普通白目', // !目/*目セット 内
        eyebrows: '普通眉',
        mouth: 'むー',
        faceColor: 'ほっぺ',
        rightArm: '基本',
        leftArm: '基本',
    },
    happy: {
        label: '嬉しい',
        eyes: 'にっこり',      // !目 の直接子 (目セット使わない)
        whiteEyes: null,
        eyebrows: '普通眉',
        mouth: 'ほあー',
        faceColor: 'ほっぺ',
        rightArm: '基本',
        leftArm: '基本',
    },
    surprised: {
        label: '驚き',
        eyes: 'カメラ目線',
        whiteEyes: '見開き白目',
        eyebrows: '上がり眉',
        mouth: 'んあー',
        faceColor: 'ほっぺ赤め',
        rightArm: '基本',
        leftArm: '基本',
    },
    thinking: {
        label: '考え中',
        eyes: '上向き',        // !目 の直接子
        whiteEyes: null,
        eyebrows: '困り眉1',
        mouth: 'むー',
        faceColor: 'ほっぺ',
        rightArm: '基本',
        leftArm: '考える',
    },
    explaining: {
        label: '説明中',
        eyes: 'カメラ目線',
        whiteEyes: '普通白目',
        eyebrows: '普通眉',
        mouth: 'ほあ',
        faceColor: 'ほっぺ',
        rightArm: '指差し',
        leftArm: '基本',
    },
    sad: {
        label: '悲しい',
        eyes: 'UU',           // !目 の直接子
        whiteEyes: null,
        eyebrows: '困り眉2',
        mouth: 'むふ',
        faceColor: 'かげり',
        rightArm: '基本',
        leftArm: '基本',
    },
};

// ============================================================
// レイヤー検索ヘルパー
// ============================================================

/** グループ内からname部分が一致するレイヤーを探す（*プレフィックスを無視、再帰検索） */
function findLayerInGroup(group, targetName) {
    if (!group || !group.children) return null;
    for (const child of group.children) {
        const cleanName = child.name.replace(/^\*/, '');
        if (cleanName === targetName) return child;
        // サブグループも検索
        if (child.children) {
            const found = findLayerInGroup(child, targetName);
            if (found) return found;
        }
    }
    return null;
}

/** グループの直接の子レイヤーのみからname一致を探す（再帰しない） */
function findDirectChild(group, targetName) {
    if (!group || !group.children) return null;
    for (const child of group.children) {
        const cleanName = child.name.replace(/^[!*]/, '');
        if (cleanName === targetName) return child;
    }
    return null;
}

/** トップレベルからグループを探す */
function findGroup(layers, groupName) {
    for (const layer of layers) {
        const cleanName = layer.name.replace(/^[!*]/, '');
        if (cleanName === groupName || layer.name === groupName) return layer;
    }
    return null;
}

// ============================================================
// 合成エンジン
// ============================================================

function compositePreset(psd, preset) {
    const canvas = createCanvas(psd.width, psd.height);
    const ctx = canvas.getContext('2d');

    const layers = psd.children;

    // === 描画順序 ===
    // このPSDでは体レイヤーが顔エリアを含めて不透明なので、
    // 先に体を描画し、その上に顔パーツを重ねる。

    /** レイヤーを描画するヘルパー */
    const draw = (layer) => {
        if (!layer || !layer.canvas) return;
        ctx.drawImage(layer.canvas, layer.left || 0, layer.top || 0);
    };

    // 1. !枝豆 → *枝豆通常（背面アクセサリ）
    const edamameGroup = findGroup(layers, '枝豆');
    if (edamameGroup) draw(findLayerInGroup(edamameGroup, '枝豆通常'));

    // 2. *服装1 (体 + 腕) — 顔パーツの下に描画
    const outfit1 = findGroup(layers, '服装1');
    if (outfit1) {
        draw(findLayerInGroup(outfit1, 'いつもの服'));

        const leftArmGroup = findGroup(outfit1.children, '左腕');
        if (leftArmGroup) draw(findLayerInGroup(leftArmGroup, preset.leftArm));

        const rightArmGroup = findGroup(outfit1.children, '右腕');
        if (rightArmGroup) draw(findLayerInGroup(rightArmGroup, preset.rightArm));
    }

    // 3. 尻尾的なアレ
    draw(findGroup(layers, '尻尾的なアレ'));

    // === ここから顔パーツ（体の上に重ねる） ===

    // 4. !眉
    const eyebrowGroup = findGroup(layers, '眉');
    if (eyebrowGroup) draw(findLayerInGroup(eyebrowGroup, preset.eyebrows));

    // 5. !目
    const eyeGroup = findGroup(layers, '目');
    if (eyeGroup) {
        if (preset.whiteEyes) {
            const eyeSet = findLayerInGroup(eyeGroup, '目セット');
            if (eyeSet) {
                // 白目を描画
                const whiteEyeLayer = findDirectChild(eyeSet, preset.whiteEyes);
                draw(whiteEyeLayer);
                // 黒目(瞳)を描画
                const pupilGroup = findDirectChild(eyeSet, '黒目');
                if (pupilGroup && pupilGroup.children) {
                    const pupilLayer = findDirectChild(pupilGroup, preset.eyes);
                    if (pupilLayer) {
                        draw(pupilLayer);
                    } else {
                        console.log(`   ⚠️ 黒目 '${preset.eyes}' not found in !黒目. Available:`,
                            pupilGroup.children.map(c => c.name).join(', '));
                    }
                } else {
                    console.log('   ⚠️ !黒目 group not found in 目セット');
                }
            }
        } else {
            draw(findLayerInGroup(eyeGroup, preset.eyes));
        }
    }

    // 6. !顔色（ほっぺ等）
    const faceColorGroup = findGroup(layers, '顔色');
    if (faceColorGroup) draw(findLayerInGroup(faceColorGroup, preset.faceColor));

    // 7. !口
    const mouthGroup = findGroup(layers, '口');
    if (mouthGroup) draw(findLayerInGroup(mouthGroup, preset.mouth));

    return canvas;
}

// ============================================================
// メイン処理
// ============================================================

console.log(`📖 Reading PSD: ${psdPath}`);
const buffer = fs.readFileSync(psdPath);
const psd = readPsd(buffer, { skipCompositeImageData: true });
console.log(`   Size: ${psd.width}x${psd.height}`);
console.log(`   Layers: ${psd.children?.length || 0} top-level`);

// 出力ディレクトリ
const outputDir = path.join(__dirname, '..', 'public', 'characters', characterName);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 各プリセットを書き出し
for (const [presetName, preset] of Object.entries(PRESETS)) {
    console.log(`\n🎨 Exporting: ${presetName} (${preset.label})`);
    try {
        const canvas = compositePreset(psd, preset);
        const pngBuffer = canvas.toBuffer('image/png');
        const outputPath = path.join(outputDir, `${presetName}.png`);
        fs.writeFileSync(outputPath, pngBuffer);
        console.log(`   ✅ Saved: ${outputPath} (${(pngBuffer.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
        console.error(`   ❌ Error: ${e.message}`);
    }
}

console.log(`\n🎉 Done! Exported ${Object.keys(PRESETS).length} presets to ${outputDir}`);
