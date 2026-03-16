/* ==============================================
   10,000 Hour Rule - Scene Management + Animations
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
function setupParticleCanvas(canvasId, color = 'rgba(42,166,160,0.10)') {
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
            r: Math.random() * 3.5 + 1.5,
            vx: (Math.random() - 0.5) * 0.0008,
            vy: (Math.random() - 0.5) * 0.0008,
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

// ===== Animate Impact Number =====
function animateImpactNumber(sceneEl) {
    const num = sceneEl.querySelector('.impact-number');
    if (num) {
        setTimeout(() => num.classList.add('animate-in'), 200);
    }
}

function resetImpactNumber(sceneEl) {
    const num = sceneEl.querySelector('.impact-number');
    if (num) num.classList.remove('animate-in');
}

// ===== Animate Bar Chart =====
function animateBars(sceneEl) {
    const fills = sceneEl.querySelectorAll('.bar-fill');
    fills.forEach((fill, i) => {
        setTimeout(() => fill.classList.add('animate-bar'), 300 + i * 300);
    });
}

function resetBars(sceneEl) {
    const fills = sceneEl.querySelectorAll('.bar-fill');
    fills.forEach(fill => fill.classList.remove('animate-bar'));
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    const manager = new SceneManager();
    const totalScenes = document.querySelectorAll('.scene').length;

    // Canvas color palette per scene category
    const canvasColors = {
        // Block 1: Introduction (warm teal)
        0: 'rgba(42,166,160,0.08)', 1: 'rgba(42,166,160,0.06)',
        2: 'rgba(232,102,92,0.08)', 3: 'rgba(42,166,160,0.10)',
        // Block 2: Origin (neutral teal)
        4: 'rgba(42,166,160,0.08)', 5: 'rgba(42,166,160,0.06)',
        6: 'rgba(232,102,92,0.06)', 7: 'rgba(42,166,160,0.08)',
        8: 'rgba(42,166,160,0.06)', 9: 'rgba(42,166,160,0.08)',
        // Block 3: Cruel Data 1 (amber/red)
        10: 'rgba(232,102,92,0.08)', 11: 'rgba(42,166,160,0.06)',
        12: 'rgba(42,166,160,0.08)', 13: 'rgba(212,149,42,0.08)',
        14: 'rgba(42,166,160,0.10)', 15: 'rgba(232,102,92,0.06)',
        16: 'rgba(42,166,160,0.06)', 17: 'rgba(232,102,92,0.10)',
        18: 'rgba(42,166,160,0.08)',
        // Block 4: Genetics (blue/red)
        19: 'rgba(232,102,92,0.08)', 20: 'rgba(42,166,160,0.06)',
        21: 'rgba(42,166,160,0.10)', 22: 'rgba(42,166,160,0.06)',
        23: 'rgba(232,102,92,0.06)', 24: 'rgba(232,102,92,0.10)',
        25: 'rgba(42,166,160,0.06)', 26: 'rgba(232,102,92,0.08)',
        27: 'rgba(42,166,160,0.08)',
        // Block 5: Right effort (teal)
        28: 'rgba(42,166,160,0.08)', 29: 'rgba(42,166,160,0.06)',
        30: 'rgba(42,166,160,0.06)', 31: 'rgba(42,166,160,0.08)',
        32: 'rgba(212,149,42,0.08)', 33: 'rgba(42,166,160,0.06)',
        34: 'rgba(42,166,160,0.08)',
        // Block 6: Conclusion
        35: 'rgba(42,166,160,0.08)', 36: 'rgba(42,166,160,0.08)',
        37: 'rgba(42,166,160,0.06)', 38: 'rgba(42,166,160,0.10)',
        39: 'rgba(212,149,42,0.06)', 40: 'rgba(42,166,160,0.10)',
    };

    // Scenes with impact numbers
    const impactScenes = [3, 14, 17, 21, 24];

    // Scenes with bar charts
    const barScenes = [12, 13];

    for (let idx = 0; idx < totalScenes; idx++) {
        const scene = document.getElementById('scene-' + idx);
        if (!scene) continue;

        const canvasColor = canvasColors[idx] || 'rgba(42,166,160,0.06)';
        const pc = setupParticleCanvas('canvas-' + idx, canvasColor);
        const isImpact = impactScenes.includes(idx);
        const isBar = barScenes.includes(idx);

        manager.registerAnimation(idx, {
            enter() {
                pc.enter();
                animateChildren(scene, '.stagger-item', 200);
                if (isImpact) animateImpactNumber(scene);
                if (isBar) animateBars(scene);
            },
            exit() {
                pc.exit();
                resetChildren(scene, '.stagger-item');
                if (isImpact) resetImpactNumber(scene);
                if (isBar) resetBars(scene);
            }
        });
    }
});
