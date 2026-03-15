// Cold Shower Presentation - Scene Controller
(function() {
    const scenes = document.querySelectorAll('.scene');
    let current = 0;
    const canvasAnimations = {};

    function goTo(index) {
        if (index < 0 || index >= scenes.length) return;
        scenes[current].classList.remove('active');
        if (canvasAnimations[current]) {
            cancelAnimationFrame(canvasAnimations[current]);
            canvasAnimations[current] = null;
        }
        current = index;
        scenes[current].classList.add('active');
        initCanvasIfNeeded(current);
    }
    window.goTo = goTo;

    function initCanvasIfNeeded(sceneIdx) {
        const sceneEl = scenes[sceneIdx];
        const canvas = sceneEl.querySelector('.bg-canvas');
        if (!canvas || canvasAnimations[sceneIdx]) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#3b82f6', '#60a5fa', '#06b6d4', '#22d3ee', '#f59e0b'];
        const particleCount = 35;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.2 + 0.05
            });
        }
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });
            ctx.globalAlpha = 0.03;
            ctx.strokeStyle = colors[0];
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    if (Math.sqrt(dx * dx + dy * dy) < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
            canvasAnimations[sceneIdx] = requestAnimationFrame(draw);
        }
        draw();
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') goTo(current + 1);
        if (e.key === 'ArrowLeft') goTo(current - 1);
    });

    window.addEventListener('resize', () => {
        Object.keys(canvasAnimations).forEach(idx => {
            const canvas = scenes[idx].querySelector('.bg-canvas');
            if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        });
    });

    scenes[0].classList.add('active');
    initCanvasIfNeeded(0);
})();
