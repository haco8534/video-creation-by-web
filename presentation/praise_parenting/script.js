/* Scene Management & Canvas Background */
/* praise_parenting presentation - 37 scenes */
/* Controls: ArrowRight/Space = next, ArrowLeft = prev */
/* External API: window.goTo(index) for recording script */

/* Keyboard navigation */
/* Canvas particle system for chapter backgrounds */
/* Connection lines between nearby particles */

/* Color scheme: blue-teal for light scenes, white for dark */
/* Target: 1920x1080 recording resolution */

(function () {
    const scenes = document.querySelectorAll('.scene');
    let current = 0;

    function showScene(idx) {
        if (idx < 0 || idx >= scenes.length) return;
        scenes[current].classList.remove('active');
        current = idx;
        scenes[current].classList.add('active');
    }

    showScene(0);

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') showScene(current + 1);
        if (e.key === 'ArrowLeft') showScene(current - 1);
    });

    window.goTo = showScene;

    /* Canvas particle backgrounds */
    const canvasIds = ['canvas-0', 'canvas-6', 'canvas-13', 'canvas-20', 'canvas-27', 'canvas-33', 'canvas-36'];

    canvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1920;
        canvas.height = 1080;

        const particles = [];
        const count = 55;
        const isDark = id === 'canvas-27';

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * 1920,
                y: Math.random() * 1080,
                r: Math.random() * 3 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5,
                alpha: Math.random() * 0.3 + 0.05
            });
        }

        function draw() {
            ctx.clearRect(0, 0, 1920, 1080);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                if (isDark) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                } else {
                    ctx.fillStyle = `rgba(43, 135, 209, ${p.alpha})`;
                }
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0) p.x = 1920;
                if (p.x > 1920) p.x = 0;
                if (p.y < 0) p.y = 1080;
                if (p.y > 1080) p.y = 0;
            });

            /* Draw connection lines between nearby particles */
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        if (isDark) {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 150)})`;
                        } else {
                            ctx.strokeStyle = `rgba(43, 135, 209, ${0.06 * (1 - dist / 150)})`;
                        }
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw);
        }
        draw();
    });
})();
