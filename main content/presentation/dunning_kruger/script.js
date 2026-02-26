/* ==============================================
   Dunning-Kruger Effect Presentation
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
function setupParticleCanvas(canvasId, color = 'rgba(102,126,234,0.12)') {
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

    for (let i = 0; i < 35; i++) {
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
    const totalScenes = manager.scenes.length;

    // Register stagger animation for ALL scenes
    for (let idx = 0; idx < totalScenes; idx++) {
        const scene = document.getElementById('scene-' + idx);
        if (!scene) continue;
        manager.registerAnimation(idx, {
            enter() { animateChildren(scene, '.stagger-item', 180); },
            exit() { resetChildren(scene, '.stagger-item'); }
        });
    }

    // Canvas particle scenes - merge with existing stagger handler
    const canvasScenes = {
        0: 'rgba(102,126,234,0.10)',
        1: 'rgba(102,126,234,0.08)',
        2: 'rgba(232,93,88,0.10)',
        5: 'rgba(102,126,234,0.08)',
        7: 'rgba(232,93,88,0.08)',
        10: 'rgba(42,166,160,0.08)',
        13: 'rgba(42,166,160,0.10)',
        15: 'rgba(45,49,66,0.06)',
        16: 'rgba(232,93,88,0.10)',
        19: 'rgba(232,93,88,0.10)',
        22: 'rgba(102,126,234,0.08)',
        23: 'rgba(45,49,66,0.06)',
        24: 'rgba(42,166,160,0.08)',
        28: 'rgba(42,166,160,0.10)',
        30: 'rgba(102,126,234,0.08)',
        32: 'rgba(102,126,234,0.08)',
        33: 'rgba(102,126,234,0.10)',
    };

    Object.entries(canvasScenes).forEach(([idxStr, color]) => {
        const idx = parseInt(idxStr);
        const canvasId = 'canvas-' + idx;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const pc = setupParticleCanvas(canvasId, color);

        const existing = manager.animationControllers[idx];
        if (existing) {
            const origEnter = existing.enter;
            const origExit = existing.exit;
            manager.registerAnimation(idx, {
                enter() { pc.enter(); origEnter(); },
                exit() { pc.exit(); origExit(); }
            });
        } else {
            manager.registerAnimation(idx, {
                enter() { pc.enter(); },
                exit() { pc.exit(); }
            });
        }
    });
});
