/* ==============================================
   Diffusion Model Presentation
   Scene Management + All Animations
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
        this.scenes.forEach((s, i) => {
            if (i === 0) s.classList.add('active');
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight' || e.key === ' ') this.next();
            if (e.key === 'ArrowLeft') this.prev();
        });
        window.goTo = (index) => this.goTo(index);
        // Activate scene 0
        this.activateScene(0);
    }

    goTo(index) {
        if (index < 0 || index >= this.scenes.length || index === this.currentIndex) return;
        this.deactivateScene(this.currentIndex);
        this.scenes[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        this.scenes[this.currentIndex].classList.add('active');
        this.activateScene(this.currentIndex);
    }

    next() {
        if (this.currentIndex < this.scenes.length - 1) this.goTo(this.currentIndex + 1);
    }

    prev() {
        if (this.currentIndex > 0) this.goTo(this.currentIndex - 1);
    }

    registerAnimation(sceneIndex, controller) {
        this.animationControllers[sceneIndex] = controller;
    }

    activateScene(index) {
        const ctrl = this.animationControllers[index];
        if (ctrl && ctrl.enter) ctrl.enter();
    }

    deactivateScene(index) {
        const ctrl = this.animationControllers[index];
        if (ctrl && ctrl.exit) ctrl.exit();
    }
}

// ===== Canvas Particle Background =====
function setupParticleCanvas(canvasId, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return { enter: () => { }, exit: () => { } };
    const ctx = canvas.getContext('2d');
    let animId = null;

    function resize() {
        canvas.width = 1920;
        canvas.height = 1080;
    }
    resize();

    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * 1920,
            y: Math.random() * 1080,
            r: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.3 + 0.05
        });
    }

    function draw() {
        ctx.clearRect(0, 0, 1920, 1080);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = 1920;
            if (p.x > 1920) p.x = 0;
            if (p.y < 0) p.y = 1080;
            if (p.y > 1080) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
            ctx.fill();
        });
        animId = requestAnimationFrame(draw);
    }

    return {
        enter: () => { draw(); },
        exit: () => { if (animId) cancelAnimationFrame(animId); animId = null; }
    };
}

// ===== Staggered Visibility Animation =====
function animateChildren(sceneEl, selector, delayMs) {
    const items = sceneEl.querySelectorAll(selector);
    items.forEach((item, i) => {
        item.classList.remove('visible');
        setTimeout(() => item.classList.add('visible'), delayMs * (i + 1));
    });
}

function resetChildren(sceneEl, selector) {
    const items = sceneEl.querySelectorAll(selector);
    items.forEach(item => item.classList.remove('visible'));
}

// ===== Scene Initializers =====

function initScene0(manager) {
    const ctrl = setupParticleCanvas('canvas-title', '99,102,241');
    manager.registerAnimation(0, ctrl);
}

function initScene1(manager) {
    manager.registerAnimation(1, { enter: () => { }, exit: () => { } });
}

function initScene2(manager) {
    const scene = document.querySelector('.scene-2');
    manager.registerAnimation(2, {
        enter: () => {
            animateChildren(scene, '.history-node, .history-arrow', 400);
        },
        exit: () => {
            resetChildren(scene, '.history-node, .history-arrow');
        }
    });
}

function initScene3(manager) {
    const scene = document.querySelector('.scene-3');
    manager.registerAnimation(3, {
        enter: () => {
            animateChildren(scene, '.compare-card', 500);
        },
        exit: () => {
            resetChildren(scene, '.compare-card');
        }
    });
}

function initScene4(manager) {
    manager.registerAnimation(4, { enter: () => { }, exit: () => { } });
}

function initScene5(manager) {
    const ctrl = setupParticleCanvas('canvas-noise', '148,163,184');
    manager.registerAnimation(5, ctrl);
}

function initScene6(manager) {
    const scene = document.querySelector('.scene-6');
    manager.registerAnimation(6, {
        enter: () => {
            animateChildren(scene, '.process-step, .process-arrow', 400);
        },
        exit: () => {
            resetChildren(scene, '.process-step, .process-arrow');
        }
    });
}

function initScene7(manager) {
    const scene = document.querySelector('.scene-7');
    manager.registerAnimation(7, {
        enter: () => {
            animateChildren(scene, '.process-step, .process-arrow', 400);
        },
        exit: () => {
            resetChildren(scene, '.process-step, .process-arrow');
        }
    });
}

function initScene8(manager) {
    manager.registerAnimation(8, { enter: () => { }, exit: () => { } });
}

function initScene9(manager) {
    const scene = document.querySelector('.scene-9');
    manager.registerAnimation(9, {
        enter: () => {
            animateChildren(scene, '.arch-block', 400);
        },
        exit: () => {
            resetChildren(scene, '.arch-block');
        }
    });
}

function initScene10(manager) {
    manager.registerAnimation(10, { enter: () => { }, exit: () => { } });
}

function initScene11(manager) {
    const scene = document.querySelector('.scene-11');
    manager.registerAnimation(11, {
        enter: () => {
            animateChildren(scene, '.clip-step, .clip-arrow', 350);
        },
        exit: () => {
            resetChildren(scene, '.clip-step, .clip-arrow');
        }
    });
}

function initScene12(manager) {
    manager.registerAnimation(12, { enter: () => { }, exit: () => { } });
}

function initScene13(manager) {
    manager.registerAnimation(13, { enter: () => { }, exit: () => { } });
}

function initScene14(manager) {
    const scene = document.querySelector('.scene-14');
    manager.registerAnimation(14, {
        enter: () => {
            animateChildren(scene, '.reason-card', 500);
        },
        exit: () => {
            resetChildren(scene, '.reason-card');
        }
    });
}

function initScene15(manager) {
    const scene = document.querySelector('.scene-15');
    manager.registerAnimation(15, {
        enter: () => {
            animateChildren(scene, '.myth-wrong, .myth-correct', 600);
        },
        exit: () => {
            resetChildren(scene, '.myth-wrong, .myth-correct');
        }
    });
}

function initScene16(manager) {
    manager.registerAnimation(16, { enter: () => { }, exit: () => { } });
}

function initScene17(manager) {
    const scene = document.querySelector('.scene-17');
    manager.registerAnimation(17, {
        enter: () => {
            animateChildren(scene, '.summary-card', 500);
        },
        exit: () => {
            resetChildren(scene, '.summary-card');
        }
    });
}

function initScene18(manager) {
    const scene = document.querySelector('.scene-18');
    manager.registerAnimation(18, {
        enter: () => {
            animateChildren(scene, '.app-card', 400);
        },
        exit: () => {
            resetChildren(scene, '.app-card');
        }
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    const manager = new SceneManager();
    initScene0(manager);
    initScene1(manager);
    initScene2(manager);
    initScene3(manager);
    initScene4(manager);
    initScene5(manager);
    initScene6(manager);
    initScene7(manager);
    initScene8(manager);
    initScene9(manager);
    initScene10(manager);
    initScene11(manager);
    initScene12(manager);
    initScene13(manager);
    initScene14(manager);
    initScene15(manager);
    initScene16(manager);
    initScene17(manager);
    initScene18(manager);
});
