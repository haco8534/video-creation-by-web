/* ==============================================
   Marshmallow Experiment Presentation
   Scene Management + Animations
   ============================================== */

// ===== Scene Manager =====
class SceneManager {
    constructor() {
        this.scenes = Array.from(document.querySelectorAll('.scene'));
        this.currentIndex = 0;
        this.transitioning = false;
        this.animationControllers = {};
        this.init();
    }

    init() {
        if (this.scenes.length > 0) {
            this.scenes[0].classList.add('active');
            this.activateScene(0);
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') this.next();
            if (e.key === 'ArrowLeft') this.prev();
        });
        window.goTo = (index) => this.goTo(index);
    }

    goTo(index) {
        if (index < 0 || index >= this.scenes.length || index === this.currentIndex) return;
        this.deactivateScene(this.currentIndex);
        this.scenes[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        this.scenes[this.currentIndex].classList.add('active');
        this.activateScene(this.currentIndex);
    }

    next() { if (this.currentIndex < this.scenes.length - 1) this.goTo(this.currentIndex + 1); }
    prev() { if (this.currentIndex > 0) this.goTo(this.currentIndex - 1); }

    registerAnimation(idx, controller) { this.animationControllers[idx] = controller; }

    activateScene(idx) {
        const ctrl = this.animationControllers[idx];
        if (ctrl && ctrl.enter) ctrl.enter();
    }

    deactivateScene(idx) {
        const ctrl = this.animationControllers[idx];
        if (ctrl && ctrl.exit) ctrl.exit();
    }
}

// ===== Canvas Particle Background =====
function setupParticleCanvas(canvasId, color = 'rgba(232,102,92,0.15)') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return { enter() { }, exit() { } };
    const ctx = canvas.getContext('2d');
    let running = false;
    let animId;
    const particles = [];

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random(), y: Math.random(),
            r: Math.random() * 4 + 2,
            vx: (Math.random() - 0.5) * 0.001,
            vy: (Math.random() - 0.5) * 0.001,
        });
    }

    function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > 1) p.vx *= -1;
            if (p.y < 0 || p.y > 1) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
        animId = requestAnimationFrame(draw);
    }

    return {
        enter() { resize(); running = true; draw(); },
        exit() { running = false; cancelAnimationFrame(animId); }
    };
}

// ===== Staggered Visibility Animation =====
function animateChildren(sceneEl, selector, delayMs = 200) {
    const items = sceneEl.querySelectorAll(selector);
    items.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), delayMs * (i + 1));
    });
}

function resetChildren(sceneEl, selector) {
    const items = sceneEl.querySelectorAll(selector);
    items.forEach(el => el.classList.remove('visible'));
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    const manager = new SceneManager();

    // --- Scene 0: Title ---
    const p0 = setupParticleCanvas('canvas-0', 'rgba(232,102,92,0.12)');
    manager.registerAnimation(0, {
        enter() { p0.enter(); },
        exit() { p0.exit(); }
    });

    // --- Scene 1: SAT Impact ---
    const p1 = setupParticleCanvas('canvas-1', 'rgba(232,102,92,0.08)');
    manager.registerAnimation(1, {
        enter() {
            p1.enter();
            const num = document.getElementById('sat-number');
            if (num) {
                num.style.transform = 'scale(0)'; num.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
                setTimeout(() => { num.style.transform = 'scale(1)'; }, 100);
            }
        },
        exit() { p1.exit(); }
    });

    // --- Scene 2: Emphasis ---
    const p2 = setupParticleCanvas('canvas-2', 'rgba(232,102,92,0.06)');
    manager.registerAnimation(2, {
        enter() { p2.enter(); },
        exit() { p2.exit(); }
    });

    // Scenes with stagger items (generic handler)
    const staggerScenes = [3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 16, 17, 18, 20, 21, 24, 25, 26, 27, 28, 29, 30, 32, 34];
    staggerScenes.forEach(idx => {
        const scene = document.getElementById('scene-' + idx);
        if (!scene) return;
        manager.registerAnimation(idx, {
            enter() { animateChildren(scene, '.stagger-item', 200); },
            exit() { resetChildren(scene, '.stagger-item'); }
        });
    });

    // --- Scenes with canvas backgrounds ---
    [5, 8, 13, 14, 19, 22, 23, 31, 33, 35, 36].forEach(idx => {
        const canvasId = 'canvas-' + idx;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const colors = {
            5: 'rgba(232,102,92,0.08)',
            8: 'rgba(42,166,160,0.10)',
            13: 'rgba(212,149,42,0.10)',
            14: 'rgba(212,149,42,0.10)',
            19: 'rgba(42,166,160,0.08)',
            22: 'rgba(42,166,160,0.10)',
            23: 'rgba(92,107,192,0.10)',
            31: 'rgba(92,107,192,0.08)',
            33: 'rgba(92,107,192,0.10)',
            35: 'rgba(42,166,160,0.08)',
            36: 'rgba(92,107,192,0.08)',
        };
        const pc = setupParticleCanvas(canvasId, colors[idx] || 'rgba(0,0,0,0.05)');

        // If already has a handler, merge
        const existing = manager.animationControllers[idx];
        if (existing) {
            const origEnter = existing.enter;
            const origExit = existing.exit;
            manager.registerAnimation(idx, {
                enter() { pc.enter(); origEnter(); },
                exit() { pc.exit(); origExit(); }
            });
        } else {
            // Some canvas scenes also have stagger items
            const scene = document.getElementById('scene-' + idx);
            manager.registerAnimation(idx, {
                enter() { pc.enter(); if (scene) animateChildren(scene, '.stagger-item', 200); },
                exit() { pc.exit(); if (scene) resetChildren(scene, '.stagger-item'); }
            });
        }
    });
});
