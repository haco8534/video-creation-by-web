/* ==============================================
   10,000 Hour Rule Presentation
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
        document.addEventListener('keydown', (e) => {
            if (this.transitioning) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.prev();
            }
        });

        window.goTo = (index) => this.goTo(index);
        this.activateScene(0);
    }

    goTo(index) {
        if (index < 0 || index >= this.scenes.length || index === this.currentIndex || this.transitioning) return;
        this.transitioning = true;
        this.deactivateScene(this.currentIndex);
        this.scenes[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        this.scenes[index].classList.add('active');
        this.activateScene(index);
        setTimeout(() => { this.transitioning = false; }, 750);
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

// ===== Canvas Utilities =====
function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        resize();
    });

    return { canvas, ctx, w: () => window.innerWidth, h: () => window.innerHeight };
}

// ===== Scene 0: Title - Particles =====
function initScene0(manager) {
    const c = setupCanvas('canvas-0');
    if (!c) return;

    const particles = [];
    const COUNT = 25;
    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * c.w(),
            y: Math.random() * c.h(),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 3 + 2,
            opacity: Math.random() * 0.25 + 0.1
        });
    }

    let animId = null;
    function draw() {
        const w = c.w(), h = c.h();
        c.ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        // Draw particles only (no O(n²) connections)
        for (const p of particles) {
            c.ctx.beginPath();
            c.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            c.ctx.fillStyle = `rgba(244,63,94,${p.opacity})`;
            c.ctx.fill();
            // Soft glow
            c.ctx.beginPath();
            c.ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            c.ctx.fillStyle = `rgba(244,63,94,${p.opacity * 0.15})`;
            c.ctx.fill();
        }

        animId = requestAnimationFrame(draw);
    }

    manager.registerAnimation(0, {
        enter() { draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; }
    });
}

// ===== Scene 1: Counter =====
function initScene1(manager) {
    const numEl = document.getElementById('counter-number-1');
    const handEl = document.getElementById('clock-hand-1');
    if (!numEl) return;

    let animId = null;
    let startTime = 0;
    const DURATION = 4000;
    const TARGET = 10000;

    function animate(ts) {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.floor(eased * TARGET);
        numEl.textContent = val.toLocaleString();
        if (handEl) handEl.style.transform = `translate(-50%, -100%) rotate(${eased * 360 * 10}deg)`;
        if (progress < 1) {
            animId = requestAnimationFrame(animate);
        } else {
            // Loop after pause
            setTimeout(() => {
                startTime = 0;
                animId = requestAnimationFrame(animate);
            }, 3000);
        }
    }

    manager.registerAnimation(1, {
        enter() { startTime = 0; animId = requestAnimationFrame(animate); },
        exit() { cancelAnimationFrame(animId); animId = null; }
    });
}

// ===== Scene 2: Formula =====
function initScene2(manager) {
    const items = document.querySelectorAll('#formula-demo-2 .formula-card, #formula-demo-2 .formula-op');
    let timeouts = [];
    let loopTimeout = null;

    function animate() {
        items.forEach(el => el.classList.remove('visible'));
        items.forEach((el, i) => {
            const t = setTimeout(() => el.classList.add('visible'), 300 + i * 300);
            timeouts.push(t);
        });
        loopTimeout = setTimeout(() => animate(), 300 + items.length * 300 + 5000);
    }

    manager.registerAnimation(2, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; clearTimeout(loopTimeout); }
    });
}

// ===== Scene 3: Strike Line =====
function initScene3(manager) {
    const line = document.getElementById('strike-line-3');
    let timeout = null;

    manager.registerAnimation(3, {
        enter() {
            if (line) { line.classList.remove('visible'); }
            timeout = setTimeout(() => { if (line) line.classList.add('visible'); }, 1500);
        },
        exit() { clearTimeout(timeout); if (line) line.classList.remove('visible'); }
    });
}

// ===== Scene 4: Giant 12% (ambient only) =====
function initScene4(manager) {
    manager.registerAnimation(4, { enter() { }, exit() { } });
}

// ===== Scene 5: Timeline =====
function initScene5(manager) {
    const items = document.querySelectorAll('#timeline-demo-5 .tl-item');
    const connector = document.querySelector('#timeline-demo-5 .tl-connector');
    let timeouts = [];

    function animate() {
        items.forEach(i => i.classList.remove('visible'));
        if (connector) connector.classList.remove('visible');

        timeouts.push(setTimeout(() => items[0]?.classList.add('visible'), 400));
        timeouts.push(setTimeout(() => { if (connector) connector.classList.add('visible'); }, 1000));
        timeouts.push(setTimeout(() => items[1]?.classList.add('visible'), 1500));
    }

    manager.registerAnimation(5, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 6: Violin Chart =====
function initScene6(manager) {
    const bars = document.querySelectorAll('#violin-chart-6 .violin-bar');
    let timeouts = [];

    function animate() {
        bars.forEach(b => {
            b.classList.remove('visible');
            const fill = b.querySelector('.violin-fill');
            if (fill) fill.style.setProperty('--pct', fill.dataset.pct);
        });

        bars.forEach((bar, i) => {
            const t = setTimeout(() => bar.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(6, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 7: Average Badge =====
function initScene7(manager) {
    const badge = document.getElementById('avg-badge-7');
    const note = document.querySelector('#avg-demo-7 .avg-note');
    const note2 = document.querySelector('#avg-demo-7 .avg-note2');
    let timeouts = [];

    function animate() {
        if (badge) badge.classList.remove('visible');
        if (note) note.classList.remove('visible');
        if (note2) note2.classList.remove('visible');

        timeouts.push(setTimeout(() => { if (badge) badge.classList.add('visible'); }, 800));
        timeouts.push(setTimeout(() => { if (note) note.classList.add('visible'); }, 1500));
        timeouts.push(setTimeout(() => { if (note2) note2.classList.add('visible'); }, 2200));
    }

    manager.registerAnimation(7, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 8: DP Cards =====
function initScene8(manager) {
    const cards = document.querySelectorAll('#dp-cards-8 .dp-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 300 + i * 400);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(8, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 9: Quote (CSS animations only) =====
function initScene9(manager) {
    manager.registerAnimation(9, { enter() { }, exit() { } });
}

// ===== Scene 10: Meta Stats =====
function initScene10(manager) {
    const stats = document.querySelectorAll('#meta-stats-10 .meta-stat');
    let timeouts = [];

    function animate() {
        stats.forEach(s => s.classList.remove('visible'));
        stats.forEach((stat, i) => {
            const t = setTimeout(() => stat.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(10, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 11: Domain Chart =====
function initScene11(manager) {
    const bars = document.querySelectorAll('#domain-chart-11 .domain-bar');
    let timeouts = [];

    function animate() {
        bars.forEach(b => {
            b.classList.remove('visible');
            const fill = b.querySelector('.domain-fill');
            if (fill) fill.style.setProperty('--pct', fill.dataset.pct);
        });

        bars.forEach((bar, i) => {
            const t = setTimeout(() => bar.classList.add('visible'), 300 + i * 400);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(11, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 12: Pie Chart =====
function initScene12(manager) {
    const canvas = document.getElementById('canvas-12');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId = null;
    let progress = 0;

    let initialized = false;
    function initCanvas() {
        if (initialized) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 320 * dpr;
        canvas.height = 320 * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        initialized = true;
    }

    function draw() {
        initCanvas();
        const cx = 160, cy = 160, r = 130, inner = 70;
        ctx.clearRect(0, 0, 320, 320);

        // 88% grey
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
        ctx.fillStyle = '#E2E8F0';
        ctx.fill();

        // 12% rose (animated)
        const angle = progress * 0.12 * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
        ctx.arc(cx, cy, inner, -Math.PI / 2 + angle, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = '#F43F5E';
        ctx.fill();

        if (progress < 1) {
            progress += 0.02;
            animId = requestAnimationFrame(draw);
        }
        // No continuous pulse loop - static after animation completes
    }

    manager.registerAnimation(12, {
        enter() { progress = 0; initialized = false; draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; initialized = false; }
    });
}

// ===== Scene 13: Chess Compare =====
function initScene13(manager) {
    const bars = document.querySelectorAll('#chess-compare-13 .chess-bar');
    const ratio = document.querySelector('#chess-compare-13 .chess-ratio');
    let timeouts = [];

    function animate() {
        bars.forEach(b => {
            b.classList.remove('visible');
            const fill = b.querySelector('.chess-fill');
            if (fill) fill.style.setProperty('--pct', fill.dataset.pct);
        });
        if (ratio) ratio.classList.remove('visible');

        bars.forEach((bar, i) => {
            const t = setTimeout(() => bar.classList.add('visible'), 400 + i * 600);
            timeouts.push(t);
        });
        timeouts.push(setTimeout(() => { if (ratio) ratio.classList.add('visible'); }, 400 + bars.length * 600 + 500));
    }

    manager.registerAnimation(13, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 14: Limit Bar =====
function initScene14(manager) {
    const fill = document.getElementById('limit-fill-14');
    const caption = document.querySelector('#limit-demo-14 .limit-caption');
    let timeouts = [];

    function animate() {
        if (fill) fill.classList.remove('visible');
        if (caption) caption.classList.remove('visible');

        timeouts.push(setTimeout(() => { if (fill) fill.classList.add('visible'); }, 600));
        timeouts.push(setTimeout(() => { if (caption) caption.classList.add('visible'); }, 2500));
    }

    manager.registerAnimation(14, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 15: Donut Chart =====
function initScene15(manager) {
    const canvas = document.getElementById('canvas-15');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId = null;
    let progress = 0;

    let initialized15 = false;
    function initCanvas15() {
        if (initialized15) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 300 * dpr;
        canvas.height = 300 * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        initialized15 = true;
    }

    function draw() {
        initCanvas15();
        const cx = 150, cy = 150, r = 120, inner = 65;
        ctx.clearRect(0, 0, 300, 300);

        // 70% grey
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
        ctx.fillStyle = '#E2E8F0';
        ctx.fill();

        // 30% amber
        const angle = progress * 0.30 * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
        ctx.arc(cx, cy, inner, -Math.PI / 2 + angle, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = '#F59E0B';
        ctx.fill();

        if (progress < 1) {
            progress += 0.02;
            animId = requestAnimationFrame(draw);
        }
        // No continuous pulse loop - static after animation completes
    }

    manager.registerAnimation(15, {
        enter() { progress = 0; initialized15 = false; draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; initialized15 = false; }
    });
}

// ===== Scene 16: Genetics Title (CSS only) =====
function initScene16(manager) {
    manager.registerAnimation(16, { enter() { }, exit() { } });
}

// ===== Scene 17: Range Fill =====
function initScene17(manager) {
    const fill = document.getElementById('range-fill-17');
    let timeout = null;

    manager.registerAnimation(17, {
        enter() {
            if (fill) fill.classList.remove('visible');
            timeout = setTimeout(() => { if (fill) fill.classList.add('visible'); }, 600);
        },
        exit() { clearTimeout(timeout); }
    });
}

// ===== Scene 18: Gene Cards =====
function initScene18(manager) {
    const cards = document.querySelectorAll('#gene-cards-18 .gene-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(18, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 19: Engine Cards =====
function initScene19(manager) {
    const cards = document.querySelectorAll('#engine-demo-19 .engine-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 400 + i * 600);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(19, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 20: Response Demo =====
function initScene20(manager) {
    const persons = document.querySelectorAll('#response-demo-20 .response-person');
    const note = document.querySelector('#response-demo-20 .response-note');
    let timeouts = [];

    function animate() {
        persons.forEach(p => p.classList.remove('visible'));
        if (note) note.classList.remove('visible');

        persons.forEach((p, i) => {
            const t = setTimeout(() => p.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
        timeouts.push(setTimeout(() => { if (note) note.classList.add('visible'); }, 400 + persons.length * 500 + 800));
    }

    manager.registerAnimation(20, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 21: Cognitive Cards =====
function initScene21(manager) {
    const cards = document.querySelectorAll('#cog-cards-21 .cog-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(21, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 22: Quality (CSS only) =====
function initScene22(manager) {
    manager.registerAnimation(22, { enter() { }, exit() { } });
}

// ===== Scene 23: Kind vs Wicked =====
function initScene23(manager) {
    const cards = document.querySelectorAll('#kw-demo-23 .kw-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(23, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 24: Woods vs Federer =====
function initScene24(manager) {
    const cards = document.querySelectorAll('#compare-demo-24 .compare-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 400 + i * 600);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(24, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 25: Hour Switch =====
function initScene25(manager) {
    const hourOld = document.querySelector('#hour-switch-25 .hour-old');
    const arrowDown = document.querySelector('#hour-switch-25 .hour-arrow-down');
    const hourNew = document.querySelector('#hour-switch-25 .hour-new');
    let timeouts = [];

    function animate() {
        if (hourOld) hourOld.classList.remove('visible');
        if (arrowDown) arrowDown.classList.remove('visible');
        if (hourNew) hourNew.classList.remove('visible');

        timeouts.push(setTimeout(() => { if (hourOld) hourOld.classList.add('visible'); }, 400));
        timeouts.push(setTimeout(() => { if (arrowDown) arrowDown.classList.add('visible'); }, 1200));
        timeouts.push(setTimeout(() => { if (hourNew) hourNew.classList.add('visible'); }, 1800));
    }

    manager.registerAnimation(25, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 26: Direction Flow =====
function initScene26(manager) {
    const cards = document.querySelectorAll('#direction-flow-26 .dir-card');
    const arrows = document.querySelectorAll('#direction-flow-26 .dir-arrow');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        arrows.forEach(a => a.classList.remove('visible'));

        cards.forEach((card, i) => {
            timeouts.push(setTimeout(() => card.classList.add('visible'), 400 + i * 500));
            if (i < arrows.length) {
                timeouts.push(setTimeout(() => arrows[i].classList.add('visible'), 400 + i * 500 + 250));
            }
        });
    }

    manager.registerAnimation(26, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 27: Verdict Stamp =====
function initScene27(manager) {
    const stamp = document.getElementById('verdict-stamp-27');
    let timeout = null;

    manager.registerAnimation(27, {
        enter() {
            if (stamp) stamp.classList.remove('visible');
            timeout = setTimeout(() => { if (stamp) stamp.classList.add('visible'); }, 1200);
        },
        exit() { clearTimeout(timeout); }
    });
}

// ===== Scene 28: Message Cards =====
function initScene28(manager) {
    const cards = document.querySelectorAll('#message-cards-28 .msg-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((card, i) => {
            const t = setTimeout(() => card.classList.add('visible'), 400 + i * 500);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(28, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ===== Scene 29: Ceiling Arrow =====
function initScene29(manager) {
    const arrow = document.getElementById('ceiling-arrow-29');
    let timeout = null;

    manager.registerAnimation(29, {
        enter() {
            if (arrow) arrow.classList.remove('visible');
            timeout = setTimeout(() => { if (arrow) arrow.classList.add('visible'); }, 800);
        },
        exit() { clearTimeout(timeout); }
    });
}

// ===== Scene 30: Ending Particles =====
function initScene30(manager) {
    const c = setupCanvas('canvas-30');
    if (!c) return;

    const particles = [];
    const COUNT = 25;
    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * c.w(),
            y: Math.random() * c.h(),
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 3 + 2,
            opacity: Math.random() * 0.25 + 0.1,
            hue: Math.random() * 60 + 140
        });
    }

    let animId = null;
    function draw() {
        const w = c.w(), h = c.h();
        c.ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            c.ctx.beginPath();
            c.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            c.ctx.fillStyle = `hsla(${p.hue}, 70%, 50%, ${p.opacity})`;
            c.ctx.fill();
            // Soft glow
            c.ctx.beginPath();
            c.ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            c.ctx.fillStyle = `hsla(${p.hue}, 70%, 50%, ${p.opacity * 0.15})`;
            c.ctx.fill();
        }

        animId = requestAnimationFrame(draw);
    }

    manager.registerAnimation(30, {
        enter() { draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; }
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
    initScene19(manager);
    initScene20(manager);
    initScene21(manager);
    initScene22(manager);
    initScene23(manager);
    initScene24(manager);
    initScene25(manager);
    initScene26(manager);
    initScene27(manager);
    initScene28(manager);
    initScene29(manager);
    initScene30(manager);
});
