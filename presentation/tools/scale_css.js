/**
 * scale_css.js
 * 
 * CSSファイルのフォントサイズ、max-width、padding等を一括で ~20% 拡大する。
 * 共通コンポーネント部分（scene-content, typography, cards等）だけでなく
 * プロジェクト固有スタイルも含めて全体を拡大する。
 */
const fs = require('fs');
const path = require('path');

const TARGET = process.argv[2];
if (!TARGET) {
    console.error('Usage: node scale_css.js <path-to-style.css>');
    process.exit(1);
}

const SCALE = 1.2; // 20% increase

let css = fs.readFileSync(TARGET, 'utf8');
let changeCount = 0;

// Scale rem values
css = css.replace(/:\s*([\d.]+)rem\b/g, (match, val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return match;
    const scaled = Math.round(num * SCALE * 100) / 100;
    changeCount++;
    return `: ${scaled}rem`;
});

// Scale px values in font-size, max-width, padding, margin, gap, min-width, width, height
// But NOT in border-radius, border-width, box-shadow, inset, or very small values (<= 5px)
css = css.replace(/(font-size|max-width|min-width|padding|margin|gap):\s*([^;]+)/g, (match, prop, value) => {
    const newValue = value.replace(/([\d.]+)px/g, (m, val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 5) return m; // Skip very small values (borders, etc)
        const scaled = Math.round(num * SCALE);
        changeCount++;
        return `${scaled}px`;
    });
    return `${prop}: ${newValue}`;
});

// Write back
fs.writeFileSync(TARGET, css, 'utf8');
console.log(`Scaled ${changeCount} values by ${SCALE}x in ${path.basename(TARGET)}`);
