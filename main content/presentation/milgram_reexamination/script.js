/* ============================================================
   Scene Management + Canvas Background
   ============================================================ */
(function () {
    const scenes = document.querySelectorAll('.scene');
    let current = 0;

    function showScene(idx) {
        if (idx < 0 || idx >= scenes.length) return;
        scenes[current].classList.remove('active');
        current = idx;
        scenes[current].classList.add('active');
        resetAnimations(scenes[current]);
    }

    function resetAnimations(scene) {
        scene.querySelectorAll('[class*="fade-in"],[class*="slide-up"],[class*="pop-in"],[class*="bounce-in"]').forEach(el => {
            const saved = el.className;
            el.className = '';
            void el.offsetWidth;
            el.className = saved;
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') showScene(current + 1);
        if (e.key === 'ArrowLeft') showScene(current - 1);
    });

    /* URL hash support for recorder */
    function hashScene() {
        const m = location.hash.match(/scene=(\d+)/);
        if (m) showScene(parseInt(m[1], 10));
    }
    window.addEventListener('hashchange', hashScene);
    hashScene();

    /* Expose for external tools */
    window.__totalScenes = scenes.length;
    window.__showScene = showScene;
    window.goTo = showScene;

    /* ---- Canvas background ---- */
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 50 }, () => ({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        r: 1.5 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        o: 0.06 + Math.random() * 0.06
    }));

    function draw() {
        ctx.clearRect(0, 0, W, H);
        dots.forEach(d => {
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
            if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79,70,229,${d.o})`;
            ctx.fill();
        });
        /* lines */
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 160) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(79,70,229,${0.03 * (1 - dist / 160)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();
