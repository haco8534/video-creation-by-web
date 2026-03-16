/* ============================================================
   Scene Management + Canvas Background Animation
   ============================================================ */
(function () {
    const scenes = document.querySelectorAll('.scene');
    let current = 0;

    function show(index) {
        if (index < 0 || index >= scenes.length) return;
        scenes[current].classList.remove('active');
        current = index;
        scenes[current].classList.add('active');
    }

    // Global function for recording script
    window.goTo = show;

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            show(current + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            show(current - 1);
        }
    });

    // Initialize first scene
    show(0);

    /* ── Canvas Background Animations ── */
    const canvasIds = ['canvas-0', 'canvas-2', 'canvas-4', 'canvas-9', 'canvas-15', 'canvas-21', 'canvas-25', 'canvas-29'];
    const canvasMap = {};

    canvasIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const ctx = el.getContext('2d');
        canvasMap[id] = { el, ctx, particles: [] };
        resize(canvasMap[id]);
        initParticles(canvasMap[id], id);
    });

    function resize(c) {
        c.el.width = c.el.parentElement.offsetWidth;
        c.el.height = c.el.parentElement.offsetHeight;
    }

    function initParticles(c, id) {
        const count = 40;
        const palette = getPalette(id);
        for (let i = 0; i < count; i++) {
            c.particles.push({
                x: Math.random() * c.el.width,
                y: Math.random() * c.el.height,
                r: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                color: palette[Math.floor(Math.random() * palette.length)],
                alpha: Math.random() * 0.3 + 0.05
            });
        }
    }

    function getPalette(id) {
        const palettes = {
            'canvas-0': ['#ef4444', '#4f46e5', '#f59e0b'],
            'canvas-2': ['#4f46e5', '#818cf8', '#c7d2fe'],
            'canvas-4': ['#4f46e5', '#14b8a6', '#f59e0b'],
            'canvas-9': ['#ef4444', '#fb923c', '#fbbf24'],
            'canvas-15': ['#f59e0b', '#fbbf24', '#fde68a'],
            'canvas-21': ['#1a1a2e', '#4f46e5', '#ef4444'],
            'canvas-25': ['#14b8a6', '#2dd4bf', '#99f6e4'],
            'canvas-29': ['#ef4444', '#4f46e5', '#14b8a6']
        };
        return palettes[id] || ['#4f46e5'];
    }

    function animate() {
        Object.values(canvasMap).forEach(c => {
            c.ctx.clearRect(0, 0, c.el.width, c.el.height);
            c.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = c.el.width;
                if (p.x > c.el.width) p.x = 0;
                if (p.y < 0) p.y = c.el.height;
                if (p.y > c.el.height) p.y = 0;
                c.ctx.beginPath();
                c.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                c.ctx.fillStyle = p.color;
                c.ctx.globalAlpha = p.alpha;
                c.ctx.fill();
            });
            c.ctx.globalAlpha = 1;
        });
        requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('resize', () => Object.values(canvasMap).forEach(resize));
})();
