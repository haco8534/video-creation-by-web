(() => {
    const scenes = document.querySelectorAll('.scene');
    let current = 0;

    function showScene(idx) {
        if (idx < 0 || idx >= scenes.length) return;
        scenes[current].classList.remove('active');
        current = idx;
        scenes[current].classList.add('active');
        initCanvasIfNeeded(current);
    }

    // Global goTo for recording script
    window.goTo = showScene;

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            showScene(current + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showScene(current - 1);
        }
    });

    // ===== Canvas Animations =====
    const canvasAnimations = {};

    function initCanvasIfNeeded(sceneIdx) {
        const sceneEl = scenes[sceneIdx];
        const canvas = sceneEl.querySelector('.bg-canvas');
        if (!canvas || canvasAnimations[sceneIdx]) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#4f46e5', '#6366f1', '#f59e0b', '#14b8a6', '#ef4444'];
        const particleCount = 35;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.25 + 0.05,
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
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

            // Draw connections
            ctx.globalAlpha = 0.03;
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
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

    // Initialize first scene
    showScene(0);
})();
