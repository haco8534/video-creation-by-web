/* ===============================================
   依存症は意志の弱さじゃなかった
   Script - addiction_brain_science
   Scene navigation + Canvas backgrounds
   =============================================== */

(function () {
    'use strict';

    const scenes = document.querySelectorAll('.scene');
    let currentIndex = 0;

    /* --- goTo: scene navigation --- */
    function goTo(index) {
        if (index < 0 || index >= scenes.length) return;
        scenes.forEach((s, i) => {
            s.classList.remove('active');
            if (i === index) {
                s.classList.add('active');
                resetAnimations(s);
            }
        });
        currentIndex = index;
    }

    /* Reset stagger animations on scene enter */
    function resetAnimations(scene) {
        const items = scene.querySelectorAll('.stagger-item');
        items.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // reflow
            el.style.animation = '';
        });
        // Re-trigger bar & path animations
        scene.querySelectorAll('.dopa-bar, .pf-bar, .brake-bar, .sens-bar, .stage-bar, .untreated-fill, .cycle-path').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = '';
        });
    }

    window.goTo = goTo;

    /* --- Keyboard navigation --- */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goTo(currentIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(currentIndex - 1);
        }
    });

    /* ===========================
       Canvas Background Effects
       =========================== */

    const canvasIds = ['canvas-0', 'canvas-1', 'canvas-4', 'canvas-7', 'canvas-8', 'canvas-14', 'canvas-15', 'canvas-19', 'canvas-20', 'canvas-25', 'canvas-28', 'canvas-29'];

    const canvasMap = {};
    canvasIds.forEach(id => {
        const c = document.getElementById(id);
        if (c) {
            const ctx = c.getContext('2d');
            canvasMap[id] = { canvas: c, ctx };
        }
    });

    function resizeAllCanvas() {
        Object.values(canvasMap).forEach(({ canvas }) => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        });
    }
    resizeAllCanvas();
    window.addEventListener('resize', resizeAllCanvas);

    /* --- Particle system --- */
    class Particle {
        constructor(w, h, color) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.r = Math.random() * 3 + 1;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.alpha = Math.random() * 0.4 + 0.1;
            this.color = color;
            this.w = w;
            this.h = h;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = this.w;
            if (this.x > this.w) this.x = 0;
            if (this.y < 0) this.y = this.h;
            if (this.y > this.h) this.y = 0;
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    const particleSets = {};
    const colorMap = {
        'canvas-0': '#6366f1',
        'canvas-1': '#f87171',
        'canvas-4': '#f87171',
        'canvas-7': '#6366f1',
        'canvas-8': '#6366f1',
        'canvas-14': '#f87171',
        'canvas-15': '#f87171',
        'canvas-19': '#f59e0b',
        'canvas-20': '#14b8a6',
        'canvas-25': '#14b8a6',
        'canvas-28': '#6366f1',
        'canvas-29': '#6366f1'
    };

    function initParticles() {
        Object.entries(canvasMap).forEach(([id, { canvas }]) => {
            const particles = [];
            const count = 50;
            const color = colorMap[id] || '#6366f1';
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(canvas.width, canvas.height, color));
            }
            particleSets[id] = particles;
        });
    }
    initParticles();

    function animate() {
        Object.entries(canvasMap).forEach(([id, { canvas, ctx }]) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particleSets[id];
            if (!particles) return;
            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });
            // Connect nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = colorMap[id] || '#6366f1';
                        ctx.globalAlpha = 0.05 * (1 - dist / 100);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        });
        requestAnimationFrame(animate);
    }
    animate();

    /* --- Initialize first scene --- */
    goTo(0);
})();
