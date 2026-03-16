/* ============================================
   LLM Slide Presentation - Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOTAL_SLIDES = 7;
    let current = 0;
    let isAnimating = false;
    let genInterval = null;
    let genIndex = 0;
    let attAnimFrame = null;
    let vectorAnimFrame = null;

    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slideCounter = document.getElementById('slideCounter');
    const dotsContainer = document.getElementById('slideDots');

    // =============================================
    // Dot Navigation
    // =============================================
    for (let i = 0; i < TOTAL_SLIDES; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    }

    function updateDots(idx) {
        document.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx);
        });
    }

    function updateCounter(idx) {
        slideCounter.textContent = `${idx + 1} / ${TOTAL_SLIDES}`;
    }

    function updateButtons(idx) {
        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === TOTAL_SLIDES - 1;
    }

    // =============================================
    // Slide Navigation
    // =============================================
    function goTo(idx) {
        if (isAnimating || idx === current) return;
        if (idx < 0 || idx >= TOTAL_SLIDES) return;

        isAnimating = true;
        const prev = current;
        current = idx;

        // Slide out current
        slides[prev].classList.remove('active');
        if (idx > prev) {
            slides[prev].classList.add('exit-left');
        }

        // Slide in next
        slides[current].classList.add('active');

        // Enter animations for each slide
        triggerSlideAnimation(current);

        updateDots(current);
        updateCounter(current);
        updateButtons(current);

        setTimeout(() => {
            slides[prev].classList.remove('exit-left');
            isAnimating = false;
        }, 600);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            next();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prev();
        }
    });

    // Initial state
    updateDots(0);
    updateCounter(0);
    updateButtons(0);
    slides[0].classList.add('active');

    // =============================================
    // Slide Animations
    // =============================================
    const animatedSlides = new Set();

    function triggerSlideAnimation(idx) {
        // Some animations can re-trigger each time
        switch (idx) {
            case 3: animateAttention(); break;
            case 4: animatePrediction(); break;
            case 5: startGenerationLoop(); break;
            default: break;
        }

        if (animatedSlides.has(idx)) return;
        animatedSlides.add(idx);

        switch (idx) {
            case 2: drawVectorSpace(); break;
        }
    }

    // =============================================
    // Slide 3: Self-Attention Canvas
    // =============================================
    const attWeights = [
        [0.9, 0.1, 0.15, 0.85, 0.1, 0.05],
        [0.15, 0.9, 0.1, 0.15, 0.35, 0.15],
        [0.10, 0.05, 0.9, 0.75, 0.15, 0.2],
        [0.80, 0.05, 0.65, 0.9, 0.05, 0.2],
        [0.10, 0.25, 0.20, 0.10, 0.9, 0.25],
        [0.05, 0.20, 0.40, 0.25, 0.25, 0.9],
    ];

    const tokenLabels = ['今日', 'は', 'いい', '天気', 'です', 'ね'];

    let attPhase = 0;
    let attTick = 0;

    function animateAttention() {
        if (attAnimFrame) cancelAnimationFrame(attAnimFrame);
        const canvas = document.getElementById('attCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const W = 700, H = 220;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        const toks = document.querySelectorAll('#slide-3 .att-tok');
        const n = tokenLabels.length;
        const margin = 55;
        const spacing = (W - margin * 2) / (n - 1);
        const tokenX = Array.from({ length: n }, (_, i) => margin + i * spacing);
        const tokenYTop = 40;
        const tokenYBot = H - 40;

        // Rotating highlight focus
        attPhase = 0;
        attTick = 0;

        function drawFrame() {
            attTick++;
            if (attTick % 80 === 0) {
                attPhase = (attPhase + 1) % n;
            }

            const focusAlpha = 0.5 + 0.5 * Math.sin(attTick * 0.05);

            ctx.clearRect(0, 0, W, H);

            // Background subtle
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, H);

            // Draw connection lines
            for (let from = 0; from < n; from++) {
                for (let to = 0; to < n; to++) {
                    if (from === to) continue;
                    const w = attWeights[attPhase][to];
                    if (w < 0.15) continue;

                    const isFocus = (from === attPhase || to === attPhase);
                    const baseAlpha = from === attPhase ? w * 0.9 : w * 0.12;
                    const alpha = isFocus ? baseAlpha : baseAlpha * 0.4;

                    ctx.beginPath();
                    ctx.moveTo(tokenX[from], from < n/2 ? tokenYTop + 10 : tokenYBot - 10);

                    // Bezier curve
                    const cx1 = tokenX[from];
                    const cy1 = H / 2;
                    const cx2 = tokenX[to];
                    const cy2 = H / 2;
                    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tokenX[to], to < n/2 ? tokenYTop + 10 : tokenYBot - 10);

                    ctx.strokeStyle = `rgba(91, 94, 244, ${alpha})`;
                    ctx.lineWidth = from === attPhase ? w * 5 : w * 2;
                    ctx.stroke();
                }
            }

            // Token node circles
            for (let i = 0; i < n; i++) {
                const isFocused = (i === attPhase);
                const y = i < n / 2 ? tokenYTop : tokenYBot;
                const r = isFocused ? 18 : 12;

                // Glow
                if (isFocused) {
                    const grd = ctx.createRadialGradient(tokenX[i], y, 0, tokenX[i], y, 32);
                    grd.addColorStop(0, `rgba(91,94,244,${0.25 * focusAlpha})`);
                    grd.addColorStop(1, 'rgba(91,94,244,0)');
                    ctx.beginPath();
                    ctx.arc(tokenX[i], y, 32, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(tokenX[i], y, r, 0, Math.PI * 2);
                ctx.fillStyle = isFocused ? '#5b5ef4' : '#e0e7ff';
                ctx.fill();
                ctx.strokeStyle = isFocused ? '#3730a3' : '#a5b4fc';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Label
                ctx.fillStyle = isFocused ? '#3730a3' : '#6366f1';
                ctx.font = `${isFocused ? '700' : '600'} ${isFocused ? 15 : 13}px Inter, Noto Sans JP, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tokenLabels[i], tokenX[i], y);
            }

            // Highlight DOM tokens too
            toks.forEach((t, i) => {
                t.classList.toggle('highlighted', i === attPhase);
            });

            attAnimFrame = requestAnimationFrame(drawFrame);
        }

        drawFrame();
    }

    // =============================================
    // Slide 2: Vector Space Canvas
    // =============================================
    function drawVectorSpace() {
        const canvas = document.getElementById('vectorCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const W = 700, H = 340;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        const words = [
            { text: '今日', x: 280, y: 130, color: '#818cf8', r: 0 },
            { text: '明日', x: 320, y: 110, color: '#818cf8', r: 0.4 },
            { text: '昨日', x: 245, y: 155, color: '#818cf8', r: 0.8 },
            { text: '天気', x: 490, y: 168, color: '#34d399', r: 1.2 },
            { text: '晴れ', x: 524, y: 140, color: '#34d399', r: 1.6 },
            { text: '雨',   x: 505, y: 200, color: '#34d399', r: 2.0 },
            { text: 'いい', x: 130, y: 240, color: '#f472b6', r: 2.4 },
            { text: '良い', x: 98,  y: 215, color: '#f472b6', r: 2.8 },
            { text: '悪い', x: 105, y: 275, color: '#f472b6', r: 3.2 },
            { text: 'です', x: 170, y: 80,  color: '#fbbf24', r: 0.2 },
            { text: 'ます', x: 135, y: 105, color: '#fbbf24', r: 0.6 },
        ];

        const clusters = [
            { x: 283, y: 132, rx: 80, ry: 54, color: 'rgba(129,140,248,0.07)', stroke: 'rgba(129,140,248,0.18)', label: '時間', lx: 283, ly: 72 },
            { x: 505, y: 170, rx: 68, ry: 58, color: 'rgba(52,211,153,0.07)', stroke: 'rgba(52,211,153,0.18)', label: '天候', lx: 505, ly: 105 },
            { x: 110, y: 248, rx: 66, ry: 52, color: 'rgba(244,114,182,0.07)', stroke: 'rgba(244,114,182,0.18)', label: '形容詞', lx: 110, ly: 188 },
            { x: 152, y: 90,  rx: 52, ry: 38, color: 'rgba(251,191,36,0.07)', stroke: 'rgba(251,191,36,0.18)', label: '機能語', lx: 152, ly: 44 },
        ];

        let tick = 0;

        function frame() {
            tick++;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, W, H);

            // Grid
            ctx.strokeStyle = 'rgba(0,0,0,0.04)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 50) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += 50) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }

            // Clusters
            clusters.forEach(c => {
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();
                ctx.setLineDash([5, 4]);
                ctx.strokeStyle = c.stroke;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = c.stroke;
                ctx.font = '700 13px Inter, Noto Sans JP, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(c.label, c.lx, c.ly);
            });

            // Words with slow floating
            words.forEach((w, i) => {
                const float = Math.sin(tick * 0.012 + w.r) * 5;
                const wx = w.x + Math.cos(tick * 0.008 + w.r) * 3;
                const wy = w.y + float;

                // Dot glow
                const grd = ctx.createRadialGradient(wx, wy, 0, wx, wy, 18);
                grd.addColorStop(0, w.color + '55');
                grd.addColorStop(1, w.color + '00');
                ctx.beginPath();
                ctx.arc(wx, wy, 18, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                // Dot
                ctx.beginPath();
                ctx.arc(wx, wy, 6, 0, Math.PI * 2);
                ctx.fillStyle = w.color;
                ctx.fill();

                // Label
                ctx.fillStyle = w.color;
                ctx.font = '700 14px Inter, Noto Sans JP, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(w.text, wx, wy - 8);
            });

            vectorAnimFrame = requestAnimationFrame(frame);
        }

        frame();
    }

    // =============================================
    // Slide 4: Probability Bars
    // =============================================
    let probAnimated = false;

    function animatePrediction() {
        if (!probAnimated) {
            probAnimated = true;
            // Bars animate via CSS transition when slide is active
            // Reset and re-trigger for repeatable effect
        }

        // Layer pulse animation done via CSS

        // Animate the transformer layers highlight
        const layers = document.querySelectorAll('.tf-layer-block');
        layers.forEach((l, i) => {
            l.style.transform = 'none';
        });

        let lIdx = 0;
        function cycleLayer() {
            layers.forEach((l, i) => {
                const active = i === lIdx % layers.length;
                l.style.background = active ? 'rgba(91,94,244,0.15)' : 'rgba(91,94,244,0.06)';
                l.style.borderColor = active ? 'rgba(91,94,244,0.5)' : 'rgba(91,94,244,0.2)';
                l.style.transform = active ? 'scale(1.04)' : 'none';
            });
            lIdx++;
        }

        if (window._layerTimer) clearInterval(window._layerTimer);
        window._layerTimer = setInterval(cycleLayer, 700);
    }

    // =============================================
    // Slide 5: Text Generation Loop
    // =============================================
    const genTokens = [
        'AI', 'とは', '、', '人工', '知能', 'の', 'こと', 'で',
        '、', '人間', 'の', '知的', '活動', 'を', 'コンピュータ', 'で', '再現', 'する', '技術', 'です', '。'
    ];

    let genRunning = false;

    function startGenerationLoop() {
        if (genRunning) return;
        genRunning = true;

        const output = document.getElementById('genOutputText');
        const loopItems = [
            document.getElementById('gls1'),
            document.getElementById('gls2'),
            document.getElementById('gls3'),
            document.getElementById('gls4'),
        ];

        output.textContent = '';
        genIndex = 0;

        let loopStep = 0;

        function runNext() {
            loopItems.forEach((el, i) => el.classList.toggle('active', i === loopStep % 4));
            loopStep++;

            if (genIndex < genTokens.length) {
                output.textContent += genTokens[genIndex];
                genIndex++;
                genInterval = setTimeout(runNext, 230);
            } else {
                // All done – pause then restart
                loopItems.forEach(el => el.classList.remove('active'));
                genRunning = false;
                setTimeout(() => {
                    output.textContent = '';
                    genIndex = 0;
                    loopStep = 0;
                    genRunning = false;
                    startGenerationLoop();
                }, 2800);
            }
        }

        setTimeout(runNext, 500);
    }

    // Stop generation animation when leaving slide 5
    const origGoTo = goTo;

    // Watch for slide leaving
    const observer = new MutationObserver(() => {
        const slide5 = document.getElementById('slide-5');
        if (!slide5.classList.contains('active')) {
            clearTimeout(genInterval);
            genRunning = false;
            if (attAnimFrame) cancelAnimationFrame(attAnimFrame);
        }
    });

    const slide5 = document.getElementById('slide-5');
    observer.observe(slide5, { attributes: true, attributeFilter: ['class'] });

    // Also pause attention on leaving slide 3
    const slide3 = document.getElementById('slide-3');
    const obs3 = new MutationObserver(() => {
        if (!slide3.classList.contains('active')) {
            if (attAnimFrame) {
                cancelAnimationFrame(attAnimFrame);
                attAnimFrame = null;
            }
            if (window._layerTimer) clearInterval(window._layerTimer);
        }
    });
    obs3.observe(slide3, { attributes: true, attributeFilter: ['class'] });

    // Also pause vector on leaving slide 2
    const slide2 = document.getElementById('slide-2');
    const obs2 = new MutationObserver(() => {
        if (!slide2.classList.contains('active')) {
            if (vectorAnimFrame) {
                cancelAnimationFrame(vectorAnimFrame);
                vectorAnimFrame = null;
            }
        } else {
            // Re-draw when re-entering
            vectorAnimFrame = null;
            drawVectorSpace();
        }
    });
    obs2.observe(slide2, { attributes: true, attributeFilter: ['class'] });
});
