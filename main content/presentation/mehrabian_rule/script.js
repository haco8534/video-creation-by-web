/* ============================================================
   Scene Navigation + Per-Scene Particle Canvas
   ============================================================ */
(function () {
    const scenes = document.querySelectorAll('.scene');
    let current = 0;
    const TOTAL = scenes.length;

    /* --- Scene Navigation --- */
    function goTo(idx) {
        if (idx < 0 || idx >= TOTAL) return;
        scenes[current].classList.remove('active');
        resetAnimations(scenes[current]);
        current = idx;
        scenes[current].classList.add('active');
        // Init canvas lazily
        setTimeout(() => initCanvasForScene(scenes[current]), 100);
    }

    function resetAnimations(scene) {
        scene.querySelectorAll('.stagger-item').forEach(el => {
            el.style.animation = 'none'; void el.offsetHeight; el.style.animation = '';
        });
        scene.querySelectorAll('.sum-fill').forEach(el => {
            el.style.animation = 'none'; void el.offsetHeight; el.style.animation = '';
        });
        scene.querySelectorAll('.svg-draw').forEach(el => {
            el.style.animation = 'none'; void el.offsetHeight; el.style.animation = '';
        });
    }

    // Expose globally IMMEDIATELY before any async work
    window.goTo = goTo;
    window.getCurrentScene = () => current;
    window.TOTAL_SCENES = TOTAL;

    // Init first scene
    scenes[0].classList.add('active');

    /* --- Per-Scene Particle Canvas --- */
    const initializedCanvases = new Set();

    function initCanvasForScene(scene) {
        const canvas = scene.querySelector('.bg-canvas');
        if (!canvas || initializedCanvases.has(canvas)) return;
        initializedCanvases.add(canvas);

        const ctx = canvas.getContext('2d');
        const W = 1280, H = 720;
        canvas.width = W;
        canvas.height = H;

        const count = parseInt(canvas.dataset.particles) || 30;
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.8 + 0.4,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.18 + 0.04,
                hue: Math.random() > 0.5 ? '99,102,241' : '13,148,136'
            });
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Connection lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99,102,241,${0.05 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
                ctx.fill();

                // Glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.hue}, ${p.alpha * 0.12})`;
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
                if (p.y < -10) p.y = H + 10;
                if (p.y > H + 10) p.y = -10;
            });

            requestAnimationFrame(draw);
        }

        draw();
    }

    // Init canvas for first scene after DOM is ready
    initCanvasForScene(scenes[0]);
})();
