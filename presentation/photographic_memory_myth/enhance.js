// Enhance index.html with custom SVG visuals and higher information density
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Scene 1 (impact 0人): Add brain-camera SVG visual
html = html.replace(
    /(<div class="impact-note stagger-item">認知科学者 Marvin Minsky)/,
    `<div class="memory-myth-visual stagger-item">
                <svg viewBox="0 0 400 120" class="myth-svg">
                    <g class="brain-icon">
                        <ellipse cx="100" cy="60" rx="45" ry="35" fill="none" stroke="#94a3b8" stroke-width="2"/>
                        <path d="M70 45 Q80 25 100 25 Q120 25 130 45" fill="none" stroke="#94a3b8" stroke-width="2"/>
                        <path d="M75 70 Q85 85 100 85 Q115 85 125 70" fill="none" stroke="#94a3b8" stroke-width="2"/>
                        <text x="100" y="65" text-anchor="middle" fill="#6366f1" font-size="11" font-weight="700">Brain</text>
                    </g>
                    <g class="not-equal">
                        <line x1="170" y1="48" x2="230" y2="48" stroke="#ef4444" stroke-width="3"/>
                        <line x1="170" y1="72" x2="230" y2="72" stroke="#ef4444" stroke-width="3"/>
                        <line x1="185" y1="35" x2="215" y2="85" stroke="#ef4444" stroke-width="3"/>
                    </g>
                    <g class="camera-icon">
                        <rect x="260" y="35" width="80" height="50" rx="8" fill="none" stroke="#94a3b8" stroke-width="2"/>
                        <circle cx="300" cy="60" r="16" fill="none" stroke="#94a3b8" stroke-width="2"/>
                        <circle cx="300" cy="60" r="8" fill="rgba(148,163,184,0.2)" stroke="#94a3b8" stroke-width="1.5"/>
                        <rect x="280" y="35" width="20" height="8" rx="4" fill="rgba(148,163,184,0.3)"/>
                        <text x="300" y="100" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700">Camera</text>
                    </g>
                </svg>
            </div>
            $1`
);

// 2. Scene 5 (quote Kim Peek): Add book-reading SVG
html = html.replace(
    /(<div class="quote-source">映画「レインマン」)/,
    `<div class="kim-peek-visual stagger-item">
                    <svg viewBox="0 0 300 80" class="peek-svg">
                        <g class="book-left">
                            <rect x="30" y="10" width="50" height="60" rx="3" fill="rgba(99,102,241,0.1)" stroke="#6366f1" stroke-width="1.5"/>
                            <line x1="40" y1="22" x2="70" y2="22" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="40" y1="30" x2="70" y2="30" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="40" y1="38" x2="65" y2="38" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="40" y1="46" x2="70" y2="46" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="40" y1="54" x2="60" y2="54" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                        </g>
                        <g class="eye-left">
                            <ellipse cx="110" cy="30" rx="18" ry="12" fill="none" stroke="#14b8a6" stroke-width="1.5"/>
                            <circle cx="110" cy="30" r="5" fill="#14b8a6"/>
                            <path d="M92 30 Q110 15 128 30" fill="none" stroke="#14b8a6" stroke-width="1" stroke-dasharray="3"/>
                        </g>
                        <text x="150" y="45" text-anchor="middle" fill="#94a3b8" font-size="20" font-weight="900">+</text>
                        <g class="eye-right">
                            <ellipse cx="190" cy="30" rx="18" ry="12" fill="none" stroke="#14b8a6" stroke-width="1.5"/>
                            <circle cx="190" cy="30" r="5" fill="#14b8a6"/>
                            <path d="M172 30 Q190 15 208 30" fill="none" stroke="#14b8a6" stroke-width="1" stroke-dasharray="3"/>
                        </g>
                        <g class="book-right">
                            <rect x="220" y="10" width="50" height="60" rx="3" fill="rgba(99,102,241,0.1)" stroke="#6366f1" stroke-width="1.5"/>
                            <line x1="230" y1="22" x2="260" y2="22" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="230" y1="30" x2="260" y2="30" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="230" y1="38" x2="255" y2="38" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="230" y1="46" x2="260" y2="46" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                            <line x1="230" y1="54" x2="250" y2="54" stroke="#6366f1" stroke-width="1" opacity="0.5"/>
                        </g>
                        <text x="150" y="75" text-anchor="middle" fill="#94a3b8" font-size="10">左右の目で同時に2ページを読む</text>
                    </svg>
                </div>
                $1`
);

// 3. Scene for stereogram experiment: Add stereogram diagram SVG
html = html.replace(
    /(<!-- Scene \d+: ランダムドットステレオグラム実験 -->[\s\S]*?<div class="flow-chain">)/,
    `$1
                <div class="stereogram-visual stagger-item">
                    <svg viewBox="0 0 440 100" class="stereo-svg">
                        <rect x="10" y="10" width="80" height="80" rx="4" fill="rgba(99,102,241,0.08)" stroke="#6366f1" stroke-width="1.5"/>
                        <g class="random-dots-1">
                            <circle cx="30" cy="30" r="2" fill="#6366f1" opacity="0.6"/>
                            <circle cx="50" cy="25" r="2" fill="#6366f1" opacity="0.4"/>
                            <circle cx="70" cy="35" r="2" fill="#6366f1" opacity="0.7"/>
                            <circle cx="35" cy="55" r="2" fill="#6366f1" opacity="0.5"/>
                            <circle cx="60" cy="50" r="2" fill="#6366f1" opacity="0.6"/>
                            <circle cx="45" cy="70" r="2" fill="#6366f1" opacity="0.4"/>
                            <circle cx="75" cy="65" r="2" fill="#6366f1" opacity="0.5"/>
                            <circle cx="25" cy="75" r="2" fill="#6366f1" opacity="0.3"/>
                        </g>
                        <text x="50" y="100" text-anchor="middle" fill="#6366f1" font-size="9" font-weight="600">Right Eye</text>
                        <path d="M100 50 L160 50" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4" marker-end="url(#arrowhead)"/>
                        <text x="130" y="42" text-anchor="middle" fill="#94a3b8" font-size="8">24h later</text>
                        <rect x="170" y="10" width="80" height="80" rx="4" fill="rgba(20,184,166,0.08)" stroke="#14b8a6" stroke-width="1.5"/>
                        <g class="random-dots-2">
                            <circle cx="190" cy="35" r="2" fill="#14b8a6" opacity="0.6"/>
                            <circle cx="210" cy="28" r="2" fill="#14b8a6" opacity="0.4"/>
                            <circle cx="230" cy="40" r="2" fill="#14b8a6" opacity="0.7"/>
                            <circle cx="195" cy="60" r="2" fill="#14b8a6" opacity="0.5"/>
                            <circle cx="220" cy="55" r="2" fill="#14b8a6" opacity="0.6"/>
                            <circle cx="205" cy="75" r="2" fill="#14b8a6" opacity="0.4"/>
                            <circle cx="235" cy="70" r="2" fill="#14b8a6" opacity="0.5"/>
                        </g>
                        <text x="210" y="100" text-anchor="middle" fill="#14b8a6" font-size="9" font-weight="600">Left Eye</text>
                        <path d="M260 50 L320 50" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4"/>
                        <text x="290" y="42" text-anchor="middle" fill="#94a3b8" font-size="8">Merge?</text>
                        <rect x="330" y="10" width="100" height="80" rx="4" fill="rgba(239,68,68,0.08)" stroke="#ef4444" stroke-width="1.5"/>
                        <text x="380" y="45" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="700">3D Image</text>
                        <text x="380" y="60" text-anchor="middle" fill="#ef4444" font-size="9">立体画像を知覚？</text>
                        <text x="380" y="80" text-anchor="middle" fill="#94a3b8" font-size="8">再現者: 0人</text>
                        <defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6" fill="#94a3b8"/></marker></defs>
                    </svg>
                </div>`
);

// 4. Scene for chimp Ayumu: Add bar comparison SVG
html = html.replace(
    /(Inoue & Matsuzawa \(2007\) Current Biology — 京都大学<\/div>)/,
    `$1
            <div class="ayumu-bar-visual stagger-item">
                <svg viewBox="0 0 350 100" class="ayumu-svg">
                    <text x="10" y="25" fill="#14b8a6" font-size="11" font-weight="700">アユム</text>
                    <rect x="80" y="12" width="240" height="22" rx="11" fill="rgba(20,184,166,0.15)"/>
                    <rect x="80" y="12" width="192" height="22" rx="11" fill="url(#ayumuGrad)" class="ayumu-bar"/>
                    <text x="280" y="28" fill="#14b8a6" font-size="11" font-weight="700">~80%</text>
                    <text x="10" y="65" fill="#6366f1" font-size="11" font-weight="700">人間</text>
                    <rect x="80" y="52" width="240" height="22" rx="11" fill="rgba(99,102,241,0.1)"/>
                    <rect x="80" y="52" width="96" height="22" rx="11" fill="url(#humanGrad)" class="human-bar"/>
                    <text x="184" y="68" fill="#6366f1" font-size="11" font-weight="700">~40%</text>
                    <text x="175" y="95" text-anchor="middle" fill="#94a3b8" font-size="9">0.21秒表示での正答率比較</text>
                    <defs>
                        <linearGradient id="ayumuGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#2dd4bf"/>
                        </linearGradient>
                        <linearGradient id="humanGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#818cf8"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>`
);

// 5. Scene for Loftus: Add smashed vs hit bar comparison
html = html.replace(
    /(実際には割れたガラスは存在しなかった<\/div>)/,
    `$1
            <div class="loftus-visual stagger-item">
                <svg viewBox="0 0 380 110" class="loftus-svg">
                    <text x="10" y="20" fill="#94a3b8" font-size="10" font-weight="700">推定速度の比較</text>
                    <text x="10" y="45" fill="#ef4444" font-size="11" font-weight="700">"smashed"</text>
                    <rect x="100" y="32" width="200" height="20" rx="10" fill="rgba(239,68,68,0.1)"/>
                    <rect x="100" y="32" width="170" height="20" rx="10" fill="rgba(239,68,68,0.25)" class="smashed-bar"/>
                    <text x="278" y="47" fill="#ef4444" font-size="10" font-weight="600">40.5 mph</text>
                    <text x="10" y="75" fill="#14b8a6" font-size="11" font-weight="700">"hit"</text>
                    <rect x="100" y="62" width="200" height="20" rx="10" fill="rgba(20,184,166,0.1)"/>
                    <rect x="100" y="62" width="120" height="20" rx="10" fill="rgba(20,184,166,0.25)" class="hit-bar"/>
                    <text x="228" y="77" fill="#14b8a6" font-size="10" font-weight="600">34.0 mph</text>
                    <text x="190" y="100" text-anchor="middle" fill="#94a3b8" font-size="9">質問の動詞を変えるだけで推定速度が19%変化</text>
                </svg>
            </div>`
);

// 6. Scene for Dresler 2.4倍: Add training progress SVG
html = html.replace(
    /(72単語中 26語 → 62語（4ヶ月後も維持）<\/div>)/,
    `$1
            <div class="dresler-visual stagger-item">
                <svg viewBox="0 0 380 120" class="dresler-svg">
                    <text x="10" y="18" fill="#94a3b8" font-size="10" font-weight="700">記憶力の変化（72単語テスト）</text>
                    <g class="before-training">
                        <rect x="50" y="85" width="60" height="0" rx="4" fill="url(#beforeGrad)" class="before-bar">
                            <animate attributeName="height" from="0" to="43" dur="1s" fill="freeze" begin="0.5s"/>
                            <animate attributeName="y" from="85" to="42" dur="1s" fill="freeze" begin="0.5s"/>
                        </rect>
                        <text x="80" y="38" text-anchor="middle" fill="#94a3b8" font-size="12" font-weight="700" opacity="0">26語
                            <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.5s"/>
                        </text>
                        <text x="80" y="105" text-anchor="middle" fill="#94a3b8" font-size="9">訓練前</text>
                    </g>
                    <g class="after-training">
                        <rect x="160" y="85" width="60" height="0" rx="4" fill="url(#afterGrad)" class="after-bar">
                            <animate attributeName="height" from="0" to="72" dur="1.2s" fill="freeze" begin="0.8s"/>
                            <animate attributeName="y" from="85" to="13" dur="1.2s" fill="freeze" begin="0.8s"/>
                        </rect>
                        <text x="190" y="10" text-anchor="middle" fill="#6366f1" font-size="14" font-weight="900" opacity="0">62語
                            <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="2s"/>
                        </text>
                        <text x="190" y="105" text-anchor="middle" fill="#6366f1" font-size="9" font-weight="600">40日後</text>
                    </g>
                    <g class="maintained">
                        <rect x="270" y="85" width="60" height="0" rx="4" fill="url(#maintainGrad)" class="maintain-bar">
                            <animate attributeName="height" from="0" to="68" dur="1.2s" fill="freeze" begin="1.1s"/>
                            <animate attributeName="y" from="85" to="17" dur="1.2s" fill="freeze" begin="1.1s"/>
                        </rect>
                        <text x="300" y="14" text-anchor="middle" fill="#14b8a6" font-size="12" font-weight="700" opacity="0">維持
                            <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="2.3s"/>
                        </text>
                        <text x="300" y="105" text-anchor="middle" fill="#14b8a6" font-size="9" font-weight="600">4ヶ月後</text>
                    </g>
                    <line x1="40" y1="85" x2="340" y2="85" stroke="#e2e8f0" stroke-width="1"/>
                    <defs>
                        <linearGradient id="beforeGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
                        <linearGradient id="afterGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
                        <linearGradient id="maintainGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#2dd4bf"/><stop offset="100%" stop-color="#14b8a6"/></linearGradient>
                    </defs>
                </svg>
            </div>`
);

// 7. Scene for MRI comparison: Add brain connectivity SVG
html = html.replace(
    /(脳の形ではなく「使い方」が違う — Dresler et al\. \(2017\)<\/div>)/,
    `$1
            <div class="brain-connectivity-visual stagger-item">
                <svg viewBox="0 0 400 130" class="connectivity-svg">
                    <g class="brain-structure">
                        <text x="100" y="15" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">構造（形）</text>
                        <ellipse cx="100" cy="65" rx="55" ry="40" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4"/>
                        <circle cx="80" cy="50" r="8" fill="rgba(148,163,184,0.15)" stroke="#94a3b8" stroke-width="1"/>
                        <circle cx="110" cy="45" r="10" fill="rgba(148,163,184,0.15)" stroke="#94a3b8" stroke-width="1"/>
                        <circle cx="95" cy="75" r="9" fill="rgba(148,163,184,0.15)" stroke="#94a3b8" stroke-width="1"/>
                        <circle cx="120" cy="70" r="7" fill="rgba(148,163,184,0.15)" stroke="#94a3b8" stroke-width="1"/>
                        <text x="100" y="118" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">差なし</text>
                    </g>
                    <text x="200" y="65" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="700">vs</text>
                    <g class="brain-connectivity">
                        <text x="300" y="15" text-anchor="middle" fill="#6366f1" font-size="10" font-weight="700">結合パターン（使い方）</text>
                        <ellipse cx="300" cy="65" rx="55" ry="40" fill="none" stroke="#6366f1" stroke-width="1.5"/>
                        <circle cx="280" cy="50" r="8" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="1.5"/>
                        <circle cx="310" cy="45" r="10" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="1.5"/>
                        <circle cx="295" cy="75" r="9" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="1.5"/>
                        <circle cx="320" cy="70" r="7" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="1.5"/>
                        <line x1="280" y1="50" x2="310" y2="45" stroke="#6366f1" stroke-width="1.5" class="conn-line" opacity="0.6"/>
                        <line x1="310" y1="45" x2="320" y2="70" stroke="#6366f1" stroke-width="1.5" class="conn-line" opacity="0.6"/>
                        <line x1="280" y1="50" x2="295" y2="75" stroke="#6366f1" stroke-width="1.5" class="conn-line" opacity="0.6"/>
                        <line x1="295" y1="75" x2="320" y2="70" stroke="#6366f1" stroke-width="1.5" class="conn-line" opacity="0.6"/>
                        <line x1="310" y1="45" x2="295" y2="75" stroke="#818cf8" stroke-width="1" class="conn-line" opacity="0.4"/>
                        <text x="300" y="118" text-anchor="middle" fill="#6366f1" font-size="11" font-weight="700">明確な差あり</text>
                    </g>
                </svg>
            </div>`
);

fs.writeFileSync('index.html', html, 'utf8');
const lines = html.split('\n').length;
const sections = (html.match(/<section/g) || []).length;
console.log(`Enhanced index.html: ${lines} lines, ${sections} scenes`);
