/* ==============================================
   LLM Text Generation Presentation
   Scene Management + Block A Animations
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
        // Keyboard navigation
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

        // Expose global goTo
        window.goTo = (index) => this.goTo(index);

        // Activate first scene animations
        this.activateScene(0);
    }

    goTo(index) {
        if (index < 0 || index >= this.scenes.length || index === this.currentIndex || this.transitioning) return;
        this.transitioning = true;

        // Deactivate current
        this.deactivateScene(this.currentIndex);
        this.scenes[this.currentIndex].classList.remove('active');

        // Activate target
        this.currentIndex = index;
        this.scenes[index].classList.add('active');
        this.activateScene(index);

        setTimeout(() => {
            this.transitioning = false;
        }, 750);
    }

    next() {
        if (this.currentIndex < this.scenes.length - 1) {
            this.goTo(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goTo(this.currentIndex - 1);
        }
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

// ===== Scene 1: Neural Network Background =====
function initScene1(manager) {
    const c = setupCanvas('canvas-1');
    if (!c) return;

    const nodes = [];
    const NODE_COUNT = 60;
    const CONNECTION_DIST = 180;

    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
            x: Math.random() * c.w(),
            y: Math.random() * c.h(),
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2.5 + 1.5,
            opacity: Math.random() * 0.4 + 0.2
        });
    }

    let animId = null;

    function draw() {
        const w = c.w(), h = c.h();
        c.ctx.clearRect(0, 0, w, h);

        // Update positions
        for (const node of nodes) {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0 || node.x > w) node.vx *= -1;
            if (node.y < 0 || node.y > h) node.vy *= -1;
            node.x = Math.max(0, Math.min(w, node.x));
            node.y = Math.max(0, Math.min(h, node.y));
        }

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
                    c.ctx.beginPath();
                    c.ctx.moveTo(nodes[i].x, nodes[i].y);
                    c.ctx.lineTo(nodes[j].x, nodes[j].y);
                    c.ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
                    c.ctx.lineWidth = 1;
                    c.ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (const node of nodes) {
            c.ctx.beginPath();
            c.ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            c.ctx.fillStyle = `rgba(59,130,246,${node.opacity})`;
            c.ctx.fill();
        }

        animId = requestAnimationFrame(draw);
    }

    manager.registerAnimation(0, {
        enter() { draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; }
    });
}

// ===== Scene 3: Floating Words =====
function initScene3(manager) {
    const container = document.getElementById('floating-words-3');
    if (!container) return;

    const words = [
        'predict', 'token', 'probability', 'pattern',
        'context', 'vector', 'neural', 'weight',
        'attention', 'layer', 'gradient', 'loss',
        'embedding', 'softmax', 'transformer', 'encoder',
        'decoder', 'sequence', 'model', 'parameter',
        '確率', 'パターン', '予測', '文脈',
        '学習', 'ベクトル', '重み', '損失'
    ];

    let elements = [];
    let intervalId = null;

    function createWord() {
        const el = document.createElement('div');
        el.className = 'floating-word';
        el.textContent = words[Math.floor(Math.random() * words.length)];
        el.style.left = Math.random() * 90 + 5 + '%';
        el.style.fontSize = Math.random() * 18 + 14 + 'px';
        const duration = Math.random() * 15 + 15;
        el.style.animationDuration = duration + 's';
        el.style.animationDelay = '0s';
        container.appendChild(el);
        elements.push(el);

        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
            elements = elements.filter(e => e !== el);
        }, duration * 1000);
    }

    function populate() {
        // Create initial batch in staggered positions
        for (let i = 0; i < 20; i++) {
            setTimeout(() => createWord(), i * 300);
        }
        // Keep spawning
        intervalId = setInterval(createWord, 1500);
    }

    manager.registerAnimation(2, {
        enter() { populate(); },
        exit() {
            clearInterval(intervalId);
            elements.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
            elements = [];
        }
    });
}

// ===== Scene 4: Flow Chart Animation =====
function initScene4(manager) {
    const steps = document.querySelectorAll('#flow-chart-4 .flow-step');
    const arrows = document.querySelectorAll('#flow-chart-4 .flow-arrow');
    let timeouts = [];
    let loopInterval = null;

    function animateFlow() {
        // Reset
        steps.forEach(s => {
            s.classList.remove('visible', 'highlighted');
            s.querySelector('.flow-card').classList.remove('flow-card--active');
        });
        arrows.forEach(a => a.classList.remove('visible'));

        // Sequential reveal
        const totalSteps = steps.length;
        for (let i = 0; i < totalSteps; i++) {
            // Show step
            const tid1 = setTimeout(() => {
                steps[i].classList.add('visible');
                steps[i].querySelector('.flow-card').classList.add('flow-card--active');
            }, i * 400);
            timeouts.push(tid1);

            // Show arrow after step (if not last)
            if (i < arrows.length) {
                const tid2 = setTimeout(() => {
                    arrows[i].classList.add('visible');
                }, i * 400 + 200);
                timeouts.push(tid2);
            }
        }

        // Highlight loop after all revealed
        const highlightStart = totalSteps * 400 + 600;
        let highlightIndex = 0;

        const tid3 = setTimeout(() => {
            loopInterval = setInterval(() => {
                steps.forEach(s => s.classList.remove('highlighted'));
                steps[highlightIndex].classList.add('highlighted');
                highlightIndex = (highlightIndex + 1) % totalSteps;
            }, 1200);
        }, highlightStart);
        timeouts.push(tid3);
    }

    manager.registerAnimation(3, {
        enter() { animateFlow(); },
        exit() {
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];
            clearInterval(loopInterval);
            loopInterval = null;
        }
    });
}

// ===== Scene 5: Warp Speed Canvas =====
function initScene5(manager) {
    const c = setupCanvas('canvas-5');
    if (!c) return;

    const particles = [];
    const PARTICLE_COUNT = 250;

    function resetParticle(p) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 400 + 300;
        p.x = c.w() / 2 + Math.cos(angle) * dist;
        p.y = c.h() / 2 + Math.sin(angle) * dist;
        p.speed = Math.random() * 1.5 + 0.5;
        p.size = Math.random() * 2 + 0.5;
        p.alpha = Math.random() * 0.6 + 0.2;
        p.trail = [];
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = {};
        resetParticle(p);
        // Spread initial positions
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(c.w(), c.h());
        p.x = c.w() / 2 + Math.cos(angle) * dist;
        p.y = c.h() / 2 + Math.sin(angle) * dist;
        particles.push(p);
    }

    let animId = null;

    function draw() {
        const w = c.w(), h = c.h();
        const cx = w / 2, cy = h / 2;

        c.ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
        c.ctx.fillRect(0, 0, w, h);

        for (const p of particles) {
            // Move toward center
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
                resetParticle(p);
                continue;
            }

            const nx = dx / dist;
            const ny = dy / dist;
            const accel = Math.max(0.5, 400 / dist);
            p.x += nx * p.speed * accel * 0.5;
            p.y += ny * p.speed * accel * 0.5;

            // Trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 6) p.trail.shift();

            // Draw trail
            if (p.trail.length > 1) {
                c.ctx.beginPath();
                c.ctx.moveTo(p.trail[0].x, p.trail[0].y);
                for (let j = 1; j < p.trail.length; j++) {
                    c.ctx.lineTo(p.trail[j].x, p.trail[j].y);
                }
                c.ctx.strokeStyle = `rgba(139, 92, 246, ${p.alpha * 0.3})`;
                c.ctx.lineWidth = p.size * 0.8;
                c.ctx.stroke();
            }

            // Draw particle
            c.ctx.beginPath();
            c.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            c.ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
            c.ctx.fill();
        }

        // Center glow
        const grad = c.ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        c.ctx.fillStyle = grad;
        c.ctx.fillRect(cx - 80, cy - 80, 160, 160);

        animId = requestAnimationFrame(draw);
    }

    manager.registerAnimation(4, {
        enter() {
            // Clear canvas first
            const w = c.w(), h = c.h();
            c.ctx.fillStyle = '#0F172A';
            c.ctx.fillRect(0, 0, w, h);
            draw();
        },
        exit() {
            cancelAnimationFrame(animId);
            animId = null;
        }
    });
}

// ===== Scene 2: Gradient ambient (just CSS, but register for consistency) =====
function initScene2(manager) {
    manager.registerAnimation(1, {
        enter() { },
        exit() { }
    });
}

// ===== Block B: Scenes 6-11 =====

// Scene 6: Input Typewriter
function initScene6(manager) {
    const text = '東京の天気は？';
    const textEl = document.getElementById('typed-text-6');
    const device = document.querySelector('#scene-6 .input-device');
    const arrow = document.getElementById('send-arrow-6');
    const server = document.getElementById('server-6');
    if (!textEl) return;

    let timeouts = [];
    let loopTimeout = null;

    function animate() {
        // Reset
        textEl.textContent = '';
        if (device) { device.style.opacity = '0'; device.style.transform = 'translateX(-30px)'; }
        if (arrow) { arrow.style.opacity = '0'; arrow.style.transform = 'scale(0.8)'; }
        if (server) { server.style.opacity = '0'; server.style.transform = 'translateX(30px)'; }

        // Show device
        const t0 = setTimeout(() => {
            if (device) {
                device.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                device.style.opacity = '1';
                device.style.transform = 'translateX(0)';
            }
        }, 200);
        timeouts.push(t0);

        // Typewriter
        for (let i = 0; i < text.length; i++) {
            const t = setTimeout(() => {
                textEl.textContent = text.slice(0, i + 1);
            }, 600 + i * 150);
            timeouts.push(t);
        }

        // Show arrow
        const t1 = setTimeout(() => {
            if (arrow) {
                arrow.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                arrow.style.opacity = '1';
                arrow.style.transform = 'scale(1)';
            }
        }, 600 + text.length * 150 + 300);
        timeouts.push(t1);

        // Show server
        const t2 = setTimeout(() => {
            if (server) {
                server.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                server.style.opacity = '1';
                server.style.transform = 'translateX(0)';
            }
        }, 600 + text.length * 150 + 700);
        timeouts.push(t2);

        // Loop
        loopTimeout = setTimeout(() => animate(), 600 + text.length * 150 + 5000);
    }

    manager.registerAnimation(5, {
        enter() { animate(); },
        exit() {
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];
            clearTimeout(loopTimeout);
        }
    });
}

// Scene 7: Tokenization
function initScene7(manager) {
    const original = document.getElementById('token-original-7');
    const arrowDown = document.getElementById('token-arrow-down-7');
    const blocks = document.querySelectorAll('#token-blocks-7 .token-block');
    let timeouts = [];

    function animate() {
        // Reset
        if (original) { original.style.opacity = '0'; original.style.transform = 'scale(0.95)'; }
        if (arrowDown) { arrowDown.style.opacity = '0'; }
        blocks.forEach(b => b.classList.remove('visible'));

        // Show original text
        const t0 = setTimeout(() => {
            if (original) {
                original.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                original.style.opacity = '1';
                original.style.transform = 'scale(1)';
            }
        }, 300);
        timeouts.push(t0);

        // Show arrow
        const t1 = setTimeout(() => {
            if (arrowDown) {
                arrowDown.style.transition = 'opacity 0.4s ease';
                arrowDown.style.opacity = '1';
            }
        }, 900);
        timeouts.push(t1);

        // Reveal token blocks one by one
        blocks.forEach((block, i) => {
            const t = setTimeout(() => {
                block.classList.add('visible');
            }, 1200 + i * 250);
            timeouts.push(t);
        });
    }

    manager.registerAnimation(6, {
        enter() { animate(); },
        exit() {
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];
        }
    });
}

// Scene 8: Token ID Assignment
function initScene8(manager) {
    const cards = document.querySelectorAll('#token-id-demo-8 .token-id-card');
    let timeouts = [];

    function animate() {
        cards.forEach(c => c.classList.remove('visible'));

        cards.forEach((card, i) => {
            const tid = setTimeout(() => {
                card.classList.add('visible');
            }, 300 + i * 350);
            timeouts.push(tid);
        });
    }

    manager.registerAnimation(7, {
        enter() { animate(); },
        exit() {
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];
        }
    });
}

// Scene 9: Embedding
function initScene9(manager) {
    const rows = document.querySelectorAll('#embed-demo-9 .embed-row');
    let timeouts = [];

    function animate() {
        rows.forEach(r => r.classList.remove('visible'));

        rows.forEach((row, i) => {
            const tid = setTimeout(() => {
                row.classList.add('visible');
            }, 400 + i * 500);
            timeouts.push(tid);
        });
    }

    manager.registerAnimation(8, {
        enter() { animate(); },
        exit() {
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];
        }
    });
}

// Scene 10: Semantic Space Canvas
function initScene10(manager) {
    const wrapper = document.querySelector('.semantic-space-wrapper');
    const canvas = document.getElementById('canvas-10');
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');

    const words = [
        { label: '犬', x: 0.35, y: 0.40, color: '#3B82F6', group: 'animal' },
        { label: '猫', x: 0.42, y: 0.35, color: '#3B82F6', group: 'animal' },
        { label: '鳥', x: 0.30, y: 0.32, color: '#3B82F6', group: 'animal' },
        { label: '東京', x: 0.70, y: 0.30, color: '#8B5CF6', group: 'place' },
        { label: '大阪', x: 0.76, y: 0.35, color: '#8B5CF6', group: 'place' },
        { label: '天気', x: 0.65, y: 0.60, color: '#F59E0B', group: 'nature' },
        { label: '空', x: 0.60, y: 0.65, color: '#F59E0B', group: 'nature' },
        { label: '消しゴム', x: 0.20, y: 0.75, color: '#94A3B8', group: 'tool' },
        { label: '走る', x: 0.50, y: 0.55, color: '#10B981', group: 'verb' },
        { label: '食べる', x: 0.45, y: 0.50, color: '#10B981', group: 'verb' },
    ];

    let animId = null;
    let time = 0;

    function resize() {
        const rect = wrapper.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    function draw() {
        resize();
        const w = wrapper.getBoundingClientRect().width;
        const h = wrapper.getBoundingClientRect().height;

        ctx.clearRect(0, 0, w, h);
        time += 0.005;

        // Draw grid lines
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * w / 10, 0);
            ctx.lineTo(i * w / 10, h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * h / 10);
            ctx.lineTo(w, i * h / 10);
            ctx.stroke();
        }

        // Draw connections within groups
        const groups = {};
        words.forEach(word => {
            if (!groups[word.group]) groups[word.group] = [];
            groups[word.group].push(word);
        });

        Object.values(groups).forEach(members => {
            if (members.length < 2) return;
            for (let i = 0; i < members.length; i++) {
                for (let j = i + 1; j < members.length; j++) {
                    const a = members[i], b = members[j];
                    const ax = a.x * w + Math.sin(time + a.x * 10) * 5;
                    const ay = a.y * h + Math.cos(time + a.y * 10) * 5;
                    const bx = b.x * w + Math.sin(time + b.x * 10) * 5;
                    const by = b.y * h + Math.cos(time + b.y * 10) * 5;
                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(bx, by);
                    ctx.strokeStyle = a.color + '30';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        });

        // Draw words
        words.forEach(word => {
            const x = word.x * w + Math.sin(time + word.x * 10) * 5;
            const y = word.y * h + Math.cos(time + word.y * 10) * 5;

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = word.color;
            ctx.fill();

            // Glow
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.fillStyle = word.color + '15';
            ctx.fill();

            // Label
            ctx.font = '600 16px "Noto Sans JP", sans-serif';
            ctx.fillStyle = '#1E293B';
            ctx.textAlign = 'center';
            ctx.fillText(word.label, x, y - 18);
        });

        // Legend
        const legendItems = [
            { label: '動物', color: '#3B82F6' },
            { label: '場所', color: '#8B5CF6' },
            { label: '自然', color: '#F59E0B' },
            { label: '動詞', color: '#10B981' },
        ];
        legendItems.forEach((item, i) => {
            const lx = 20;
            const ly = h - 20 - (legendItems.length - 1 - i) * 24;
            ctx.beginPath();
            ctx.arc(lx, ly - 4, 5, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.font = '500 12px "Noto Sans JP", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, lx + 12, ly);
        });

        animId = requestAnimationFrame(draw);
    }

    manager.registerAnimation(9, {
        enter() { draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; }
    });
}

// Scene 11: Bridge to Transformer
function initScene11(manager) {
    const vecs = document.querySelectorAll('#bridge-vectors-11 .bridge-vec');
    const arrow = document.getElementById('bridge-arrow-11');
    const target = document.getElementById('bridge-target-11');
    let timeouts = [];

    function animate() {
        vecs.forEach(v => v.classList.remove('visible'));
        if (arrow) arrow.classList.remove('visible');
        if (target) target.classList.remove('visible');

        // Show vectors one by one
        vecs.forEach((vec, i) => {
            const tid = setTimeout(() => vec.classList.add('visible'), 200 + i * 200);
            timeouts.push(tid);
        });

        // Show arrow
        const t1 = setTimeout(() => {
            if (arrow) arrow.classList.add('visible');
        }, 200 + vecs.length * 200 + 400);
        timeouts.push(t1);

        // Show Transformer target
        const t2 = setTimeout(() => {
            if (target) target.classList.add('visible');
        }, 200 + vecs.length * 200 + 900);
        timeouts.push(t2);
    }

    manager.registerAnimation(10, {
        enter() { animate(); },
        exit() {
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];
        }
    });
}

// ==============================================
// Block C: Attention (Scenes 12-18)
// ==============================================

function initScene12(manager) {
    manager.registerAnimation(11, { enter() { }, exit() { } });
}

// Scene 13: RNN Limitation
function initScene13(manager) {
    const words = document.querySelectorAll('#rnn-demo-13 .rnn-word');
    const arrows = document.querySelectorAll('#rnn-demo-13 .rnn-arrow-r');
    const caption = document.querySelector('#rnn-demo-13 .rnn-caption');
    let timeouts = [];

    function animate() {
        words.forEach(w => { w.classList.remove('visible', 'faded'); });
        arrows.forEach(a => a.classList.remove('visible'));
        if (caption) caption.classList.remove('visible');

        words.forEach((w, i) => {
            timeouts.push(setTimeout(() => {
                w.classList.add('visible');
                if (i > 0) arrows[i - 1].classList.add('visible');
                // Fade earlier words
                if (i >= 3) words.forEach((ww, j) => { if (j < i - 1) ww.classList.add('faded'); });
            }, 300 + i * 500));
        });

        timeouts.push(setTimeout(() => { if (caption) caption.classList.add('visible'); }, 300 + words.length * 500 + 400));
    }

    manager.registerAnimation(12, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 14: Self-Attention Canvas
function initScene14(manager) {
    const canvas = document.getElementById('canvas-14');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tokens = ['東京', 'の', '天気', 'は', '？'];
    const positions = [];
    let animId = null, time = 0;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 800 * dpr;
        canvas.height = 350 * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        // Recalculate positions
        positions.length = 0;
        const spacing = 800 / (tokens.length + 1);
        tokens.forEach((_, i) => {
            positions.push({ x: spacing * (i + 1), y: 175 });
        });
    }
    resize();

    function draw() {
        ctx.clearRect(0, 0, 800, 350);
        time += 0.02;

        // Draw connections between all pairs
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const alpha = 0.1 + 0.15 * Math.sin(time + i * 0.7 + j * 0.5);
                const lw = 1 + Math.sin(time + i + j) * 0.5;
                ctx.beginPath();
                // Arc connection
                const midX = (positions[i].x + positions[j].x) / 2;
                const midY = positions[i].y - 40 - (j - i) * 25;
                ctx.moveTo(positions[i].x, positions[i].y - 20);
                ctx.quadraticCurveTo(midX, midY, positions[j].x, positions[j].y - 20);
                ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0, alpha)})`;
                ctx.lineWidth = lw;
                ctx.stroke();
            }
        }

        // Draw tokens
        tokens.forEach((token, i) => {
            const p = positions[i];
            // Box
            ctx.fillStyle = '#F5F3FF';
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2;
            const bw = 70, bh = 40;
            ctx.beginPath();
            ctx.roundRect(p.x - bw / 2, p.y - bh / 2, bw, bh, 8);
            ctx.fill();
            ctx.stroke();
            // Text
            ctx.font = '700 18px "Noto Sans JP", sans-serif';
            ctx.fillStyle = '#1E293B';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(token, p.x, p.y);
        });

        animId = requestAnimationFrame(draw);
    }

    manager.registerAnimation(13, {
        enter() { resize(); draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; }
    });
}

// Scene 15: Context Reading
function initScene15(manager) {
    const words = document.querySelectorAll('#context-demo-15 .ctx-word');
    const result = document.getElementById('ctx-result-15');
    let timeouts = [];

    function animate() {
        words.forEach(w => { w.classList.remove('visible', 'active'); });
        if (result) result.classList.remove('visible');

        words.forEach((w, i) => {
            timeouts.push(setTimeout(() => w.classList.add('visible'), 200 + i * 300));
        });

        // Highlight context words
        timeouts.push(setTimeout(() => {
            words.forEach(w => { if (w.classList.contains('ctx-highlight')) w.classList.add('active'); });
        }, 200 + words.length * 300 + 500));

        // Show result
        timeouts.push(setTimeout(() => { if (result) result.classList.add('visible'); }, 200 + words.length * 300 + 1200));
    }

    manager.registerAnimation(14, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 16: QKV
function initScene16(manager) {
    const cards = document.querySelectorAll('#qkv-demo-16 .qkv-card');
    let timeouts = [];
    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        cards.forEach((c, i) => { timeouts.push(setTimeout(() => c.classList.add('visible'), 300 + i * 400)); });
    }
    manager.registerAnimation(15, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 17: Multi-Head
function initScene17(manager) {
    const heads = document.querySelectorAll('#multihead-demo-17 .mh-head');
    let timeouts = [];
    function animate() {
        heads.forEach(h => h.classList.remove('visible'));
        heads.forEach((h, i) => { timeouts.push(setTimeout(() => h.classList.add('visible'), 200 + i * 250)); });
    }
    manager.registerAnimation(16, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 18: Layer Stack
function initScene18(manager) {
    const items = document.querySelectorAll('#layer-stack-18 .layer-item');
    const repeat = document.querySelector('#scene-18 .layer-repeat');
    let timeouts = [];
    function animate() {
        items.forEach(it => it.classList.remove('visible'));
        if (repeat) repeat.classList.remove('visible');
        // Bottom to top
        const sorted = Array.from(items).reverse();
        sorted.forEach((it, i) => { timeouts.push(setTimeout(() => it.classList.add('visible'), 200 + i * 300)); });
        timeouts.push(setTimeout(() => { if (repeat) repeat.classList.add('visible'); }, 200 + sorted.length * 300 + 400));
    }
    manager.registerAnimation(17, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ==============================================
// Block D: Probability & Sampling (Scenes 19-24)
// ==============================================

function initScene19(manager) { manager.registerAnimation(18, { enter() { }, exit() { } }); }

// Scene 20: Probability Chart
function initScene20(manager) {
    const bars = document.querySelectorAll('#prob-chart-20 .prob-bar');
    let timeouts = [];
    function animate() {
        bars.forEach(b => {
            b.classList.remove('visible');
            const fill = b.querySelector('.prob-fill');
            const pct = fill.getAttribute('data-pct');
            fill.style.setProperty('--pct', pct);
        });
        bars.forEach((b, i) => { timeouts.push(setTimeout(() => b.classList.add('visible'), 300 + i * 200)); });
    }
    manager.registerAnimation(19, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 21: Autoregressive
function initScene21(manager) {
    const steps = document.querySelectorAll('#auto-loop-21 .auto-step');
    const arrow = document.getElementById('auto-loop-arrow-21');
    let timeouts = [], loopInterval = null;

    function animate() {
        steps.forEach(s => { s.classList.remove('visible', 'active'); });
        if (arrow) arrow.classList.remove('visible');

        let currentStep = 0;
        function showNext() {
            steps.forEach(s => s.classList.remove('active'));
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('visible', 'active');
                currentStep++;
            } else {
                currentStep = 0;
                steps.forEach(s => s.classList.remove('visible', 'active'));
            }
        }
        showNext();
        loopInterval = setInterval(showNext, 1200);

        timeouts.push(setTimeout(() => { if (arrow) arrow.classList.add('visible'); }, 800));
    }
    manager.registerAnimation(20, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; clearInterval(loopInterval); }
    });
}

// Scene 22: Temperature
function initScene22(manager) {
    const cols = document.querySelectorAll('#temp-demo-22 .temp-col');
    let timeouts = [];
    function animate() {
        cols.forEach(c => c.classList.remove('visible'));
        cols.forEach((c, i) => { timeouts.push(setTimeout(() => c.classList.add('visible'), 300 + i * 500)); });
    }
    manager.registerAnimation(21, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 23: Hallucination
function initScene23(manager) {
    const cards = document.querySelectorAll('#hallu-demo-23 .hallu-card');
    const vs = document.querySelector('#hallu-demo-23 .hallu-vs');
    let timeouts = [];
    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        if (vs) vs.classList.remove('visible');
        timeouts.push(setTimeout(() => { cards[0].classList.add('visible'); }, 300));
        timeouts.push(setTimeout(() => { if (vs) vs.classList.add('visible'); }, 700));
        timeouts.push(setTimeout(() => { cards[1].classList.add('visible'); }, 1100));
    }
    manager.registerAnimation(22, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

function initScene24(manager) { manager.registerAnimation(23, { enter() { }, exit() { } }); }

// ==============================================
// Block E: Learning (Scenes 25-29)
// ==============================================

// Scene 25: Pre-training flow
function initScene25(manager) {
    const steps = document.querySelectorAll('#pretrain-demo-25 .pt-step');
    const arrows = document.querySelectorAll('#pretrain-demo-25 .pt-arrow');
    let timeouts = [];
    function animate() {
        steps.forEach(s => s.classList.remove('visible'));
        arrows.forEach(a => a.classList.remove('visible'));
        steps.forEach((s, i) => {
            timeouts.push(setTimeout(() => {
                s.classList.add('visible');
                if (i > 0 && arrows[i - 1]) arrows[i - 1].classList.add('visible');
            }, 300 + i * 400));
        });
    }
    manager.registerAnimation(24, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 26: Scale Chart
function initScene26(manager) {
    const bars = document.querySelectorAll('#scale-chart-26 .scale-bar');
    let timeouts = [];
    function animate() {
        bars.forEach(b => {
            b.classList.remove('visible');
            const fill = b.querySelector('.scale-fill');
            const pct = fill.getAttribute('data-pct');
            fill.style.setProperty('--pct', pct);
        });
        bars.forEach((b, i) => { timeouts.push(setTimeout(() => b.classList.add('visible'), 400 + i * 500)); });
    }
    manager.registerAnimation(25, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 27: Fine-tuning
function initScene27(manager) {
    const cards = document.querySelectorAll('#ft-demo-27 .ft-card');
    const arrows = document.querySelectorAll('#ft-demo-27 .ft-arrow');
    let timeouts = [];
    function animate() {
        cards.forEach(c => c.classList.remove('visible'));
        arrows.forEach(a => a.classList.remove('visible'));
        cards.forEach((c, i) => {
            timeouts.push(setTimeout(() => {
                c.classList.add('visible');
                if (i > 0 && arrows[i - 1]) arrows[i - 1].classList.add('visible');
            }, 300 + i * 500));
        });
    }
    manager.registerAnimation(26, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 28: RLHF
function initScene28(manager) {
    const steps = document.querySelectorAll('#rlhf-demo-28 .rlhf-step');
    const arrows = document.querySelectorAll('#rlhf-demo-28 .rlhf-arrow');
    let timeouts = [];
    function animate() {
        steps.forEach(s => s.classList.remove('visible'));
        arrows.forEach(a => a.classList.remove('visible'));
        steps.forEach((s, i) => {
            timeouts.push(setTimeout(() => {
                s.classList.add('visible');
                if (i > 0 && arrows[i - 1]) arrows[i - 1].classList.add('visible');
            }, 300 + i * 500));
        });
    }
    manager.registerAnimation(27, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// Scene 29: Pyramid
function initScene29(manager) {
    const levels = document.querySelectorAll('#pyramid-29 .pyramid-level');
    let timeouts = [];
    function animate() {
        levels.forEach(l => l.classList.remove('visible'));
        // Bottom to top (reverse DOM order)
        const sorted = Array.from(levels).reverse();
        sorted.forEach((l, i) => { timeouts.push(setTimeout(() => l.classList.add('visible'), 300 + i * 500)); });
    }
    manager.registerAnimation(28, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    });
}

// ==============================================
// Block F: Summary (Scenes 30-33)
// ==============================================

// Scene 30: Review Flow
function initScene30(manager) {
    const steps = document.querySelectorAll('#review-flow-30 .rv-step');
    const arrows = document.querySelectorAll('#review-flow-30 .rv-arrow');
    let timeouts = [], loopInterval = null;

    function animate() {
        steps.forEach(s => { s.classList.remove('visible', 'highlighted'); });
        arrows.forEach(a => a.classList.remove('visible'));

        const total = steps.length;
        for (let i = 0; i < total; i++) {
            timeouts.push(setTimeout(() => {
                steps[i].classList.add('visible');
                if (i > 0 && arrows[i - 1]) arrows[i - 1].classList.add('visible');
            }, 200 + i * 300));
        }

        let hlIdx = 0;
        timeouts.push(setTimeout(() => {
            loopInterval = setInterval(() => {
                steps.forEach(s => s.classList.remove('highlighted'));
                steps[hlIdx].classList.add('highlighted');
                hlIdx = (hlIdx + 1) % total;
            }, 1000);
        }, 200 + total * 300 + 500));
    }
    manager.registerAnimation(29, {
        enter() { animate(); },
        exit() { timeouts.forEach(t => clearTimeout(t)); timeouts = []; clearInterval(loopInterval); }
    });
}

function initScene31(manager) { manager.registerAnimation(30, { enter() { }, exit() { } }); }
function initScene32(manager) { manager.registerAnimation(31, { enter() { }, exit() { } }); }

// Scene 33: Ending Canvas (reuse warp style)
function initScene33(manager) {
    const c = setupCanvas('canvas-33');
    if (!c) return;

    const particles = [];
    const COUNT = 150;
    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * c.w(), y: Math.random() * c.h(),
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 1, alpha: Math.random() * 0.5 + 0.1
        });
    }
    let animId = null;
    function draw() {
        const w = c.w(), h = c.h();
        c.ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
        c.ctx.fillRect(0, 0, w, h);
        for (const p of particles) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            c.ctx.beginPath();
            c.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            c.ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
            c.ctx.fill();
        }
        // Connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    c.ctx.beginPath();
                    c.ctx.moveTo(particles[i].x, particles[i].y);
                    c.ctx.lineTo(particles[j].x, particles[j].y);
                    c.ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 120) * 0.08})`;
                    c.ctx.lineWidth = 1;
                    c.ctx.stroke();
                }
            }
        }
        animId = requestAnimationFrame(draw);
    }
    manager.registerAnimation(32, {
        enter() { c.ctx.fillStyle = '#0F172A'; c.ctx.fillRect(0, 0, c.w(), c.h()); draw(); },
        exit() { cancelAnimationFrame(animId); animId = null; }
    });
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    const manager = new SceneManager();
    // Block A
    initScene1(manager);
    initScene2(manager);
    initScene3(manager);
    initScene4(manager);
    initScene5(manager);
    // Block B
    initScene6(manager);
    initScene7(manager);
    initScene8(manager);
    initScene9(manager);
    initScene10(manager);
    initScene11(manager);
    // Block C
    initScene12(manager);
    initScene13(manager);
    initScene14(manager);
    initScene15(manager);
    initScene16(manager);
    initScene17(manager);
    initScene18(manager);
    // Block D
    initScene19(manager);
    initScene20(manager);
    initScene21(manager);
    initScene22(manager);
    initScene23(manager);
    initScene24(manager);
    // Block E
    initScene25(manager);
    initScene26(manager);
    initScene27(manager);
    initScene28(manager);
    initScene29(manager);
    // Block F
    initScene30(manager);
    initScene31(manager);
    initScene32(manager);
    initScene33(manager);

    // =============================================
    // Global Progress Bar Controller
    // =============================================
    const gpBar = document.getElementById('global-progress');
    const gpSteps = gpBar.querySelectorAll('.gp-step');
    const gpKeys = ['input', 'token', 'embed', 'attn', 'prob', 'output'];

    // Map scene indices to progress step key
    const sceneToProgress = {
        5: 'input',       // Scene 6
        6: 'token', 7: 'token',  // Scene 7-8
        8: 'embed', 9: 'embed', 10: 'embed',  // Scene 9-11
        11: 'attn', 12: 'attn', 13: 'attn', 14: 'attn', 15: 'attn', 16: 'attn', 17: 'attn',  // Scene 12-18
        18: 'prob', 19: 'prob', 20: 'prob', 21: 'prob', 22: 'prob', 23: 'prob',  // Scene 19-24
        29: 'output'  // Scene 30
    };

    // Which scenes show the bar at all (6 to 24, 30)
    const showBarScenes = new Set([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 29]);
    const darkScenes = new Set([32]); // Scene 33

    function updateProgress(sceneIdx) {
        const show = showBarScenes.has(sceneIdx);
        gpBar.classList.toggle('visible', show);
        gpBar.classList.toggle('dark-mode', darkScenes.has(sceneIdx));

        if (!show) return;

        const activeKey = sceneToProgress[sceneIdx] || null;
        const activeIdx = gpKeys.indexOf(activeKey);

        gpSteps.forEach(step => {
            step.classList.remove('gp-active', 'gp-done');
            const key = step.getAttribute('data-gp');
            const idx = gpKeys.indexOf(key);
            if (key === activeKey) step.classList.add('gp-active');
            else if (idx < activeIdx) step.classList.add('gp-done');
        });
    }

    // Hook into SceneManager's goTo
    const origGoTo = manager.goTo.bind(manager);
    manager.goTo = function (idx) {
        origGoTo(idx);
        updateProgress(idx);
    };
    window.goTo = (i) => manager.goTo(i);

    // Hook into keyboard navigation
    const origKeyHandler = window.onkeydown;
    window.addEventListener('keydown', () => {
        setTimeout(() => updateProgress(manager.current), 50);
    });

    // Initial update
    updateProgress(0);

    // =============================================
    // Dynamic Info Card Injection
    // =============================================

    // Helper to create and inject info cards
    function injectInfoCard(sceneId, config) {
        const scene = document.getElementById(sceneId);
        if (!scene) return;
        const content = scene.querySelector('.scene-content');
        if (!content) return;
        content.style.position = 'relative';

        config.forEach(card => {
            const el = document.createElement('div');
            el.className = `info-card-float ${card.color || ''}`;
            el.style.cssText = card.pos;
            el.innerHTML = `
                <div class="icf-title">${card.title}</div>
                <div class="icf-value">${card.value}</div>
                ${card.desc ? `<div class="icf-desc">${card.desc}</div>` : ''}
            `;
            content.appendChild(el);

            // Show with delay
            manager.registerAnimation(card.sceneAnimIdx, (() => {
                const prev = manager.animations[card.sceneAnimIdx];
                return {
                    enter() { if (prev) prev.enter(); setTimeout(() => el.classList.add('visible'), card.delay || 600); },
                    exit() { if (prev) prev.exit(); el.classList.remove('visible'); }
                };
            })());
        });
    }

    // Helper to inject stat chips at bottom of a scene
    function injectStats(sceneId, chips, animIdx) {
        const scene = document.getElementById(sceneId);
        if (!scene) return;
        const content = scene.querySelector('.scene-content');
        if (!content) return;
        content.style.position = 'relative';

        const row = document.createElement('div');
        row.className = 'stats-row';
        chips.forEach(chip => {
            const el = document.createElement('div');
            el.className = 'stat-chip';
            el.innerHTML = `
                <span class="sc-dot" style="background:${chip.color}"></span>
                <span class="sc-label">${chip.label}</span>
                <span class="sc-value">${chip.value}</span>
            `;
            row.appendChild(el);
        });
        content.appendChild(row);

        const prev = manager.animations[animIdx];
        manager.registerAnimation(animIdx, {
            enter() {
                if (prev) prev.enter();
                row.querySelectorAll('.stat-chip').forEach((c, i) => {
                    setTimeout(() => c.classList.add('visible'), 800 + i * 200);
                });
            },
            exit() {
                if (prev) prev.exit();
                row.querySelectorAll('.stat-chip').forEach(c => c.classList.remove('visible'));
            }
        });
    }

    // Helper to inject info pills (small labels)
    function injectPill(sceneId, pills, animIdx) {
        const scene = document.getElementById(sceneId);
        if (!scene) return;
        const content = scene.querySelector('.scene-content');
        if (!content) return;
        content.style.position = 'relative';

        const pilEls = [];
        pills.forEach(p => {
            const el = document.createElement('div');
            el.className = 'info-pill';
            el.style.cssText = p.pos;
            el.innerHTML = `<span class="pill-dot" style="background:${p.color}"></span>${p.text}`;
            content.appendChild(el);
            pilEls.push(el);
        });

        const prev = manager.animations[animIdx];
        manager.registerAnimation(animIdx, {
            enter() {
                if (prev) prev.enter();
                pilEls.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 500 + i * 200));
            },
            exit() {
                if (prev) prev.exit();
                pilEls.forEach(el => el.classList.remove('visible'));
            }
        });
    }

    // --- Scene 7: Tokenization info ---
    injectStats('scene-7', [
        { label: 'Algorithm', value: 'BPE', color: 'var(--blue)' },
        { label: 'Vocab', value: '~100K tokens', color: 'var(--purple)' },
        { label: 'Encoding', value: 'UTF-8 bytes', color: 'var(--emerald)' }
    ], 6);

    injectPill('scene-7', [
        { text: 'Byte Pair Encoding', color: 'var(--blue)', pos: 'top:20px;right:40px;' },
        { text: '頻出パターンを結合', color: 'var(--purple)', pos: 'top:20px;left:40px;' }
    ], 6);

    // --- Scene 8: Token ID info ---
    injectStats('scene-8', [
        { label: 'Lookup', value: 'Vocab Table', color: 'var(--blue)' },
        { label: 'ID Range', value: '0~100K', color: 'var(--purple)' },
        { label: 'Unique', value: '1対1対応', color: 'var(--amber)' }
    ], 7);

    // --- Scene 9: Embedding info ---
    injectStats('scene-9', [
        { label: 'Dimensions', value: '12,288', color: 'var(--blue)' },
        { label: 'Type', value: 'Float32', color: 'var(--purple)' },
        { label: 'Learned', value: '学習で獲得', color: 'var(--emerald)' }
    ], 8);

    injectPill('scene-9', [
        { text: 'Word2Vec / GloVe の発展形', color: 'var(--blue)', pos: 'top:16px;right:40px;' }
    ], 8);

    // --- Scene 10: Semantic Space info ---
    injectPill('scene-10', [
        { text: '12,288次元から2Dに射影', color: 'var(--purple)', pos: 'top:20px;right:40px;' },
        { text: '意味が近い→距離が近い', color: 'var(--blue)', pos: 'top:20px;left:40px;' }
    ], 9);

    // --- Scene 13: RNN info ---
    injectStats('scene-13', [
        { label: '問題', value: '勾配消失', color: 'var(--rose)' },
        { label: '解決', value: 'Attention', color: 'var(--emerald)' },
        { label: 'Era', value: '~2017以前', color: 'var(--text-muted)' }
    ], 12);

    // --- Scene 14: Self-Attention info ---
    injectPill('scene-14', [
        { text: '全ペアの関連度を計算', color: 'var(--purple)', pos: 'top:20px;right:40px;' },
        { text: 'O(n²) 計算量', color: 'var(--amber)', pos: 'top:20px;left:40px;' }
    ], 13);

    injectStats('scene-14', [
        { label: 'Complexity', value: 'O(n²)', color: 'var(--amber)' },
        { label: '並列処理', value: 'GPU最適化', color: 'var(--emerald)' },
        { label: 'Key Innovation', value: '2017', color: 'var(--blue)' }
    ], 13);

    // --- Scene 15: Context info ---
    injectStats('scene-15', [
        { label: '「銀行」の意味', value: '2通り', color: 'var(--purple)' },
        { label: '決め手', value: '周囲の文脈', color: 'var(--amber)' },
        { label: '手法', value: 'Attention Weight', color: 'var(--emerald)' }
    ], 14);

    // --- Scene 16: QKV info ---
    injectPill('scene-16', [
        { text: 'Scaled Dot-Product', color: 'var(--purple)', pos: 'top:20px;right:40px;' },
        { text: 'Attention(Q,K,V) = softmax(QK^T/√d)V', color: 'var(--blue)', pos: 'top:20px;left:40px;' }
    ], 15);

    injectStats('scene-16', [
        { label: '比喩', value: '合コン方式', color: 'var(--rose)' },
        { label: 'Q×K', value: '相性スコア', color: 'var(--amber)' },
        { label: '×V', value: '情報抽出', color: 'var(--emerald)' }
    ], 15);

    // --- Scene 17: Multi-Head info ---
    injectStats('scene-17', [
        { label: 'GPT-4', value: '128 heads', color: 'var(--purple)' },
        { label: '並列', value: '独立に計算', color: 'var(--blue)' },
        { label: '結合', value: 'Concat + Linear', color: 'var(--amber)' }
    ], 16);

    // --- Scene 18: Layer Stack info ---
    injectPill('scene-18', [
        { text: 'GPT-4: 約120層', color: 'var(--purple)', pos: 'top:20px;right:40px;' },
        { text: 'Skip Connection で勾配を保持', color: 'var(--emerald)', pos: 'top:20px;left:40px;' }
    ], 17);

    // --- Scene 20: Probability Chart info ---
    injectPill('scene-20', [
        { text: '入力: 「東京の天気は？」→ 次は？', color: 'var(--amber)', pos: 'top:16px;left:40px;' },
        { text: 'Softmax で正規化', color: 'var(--purple)', pos: 'top:16px;right:40px;' }
    ], 19);

    injectStats('scene-20', [
        { label: '辞書全体', value: '~100K候補', color: 'var(--amber)' },
        { label: '選択', value: 'Top-p / Top-k', color: 'var(--blue)' }
    ], 19);

    // --- Scene 21: Autoregressive info ---
    injectStats('scene-21', [
        { label: '方式', value: '自己回帰', color: 'var(--amber)' },
        { label: '1回の予測', value: '1トークン', color: 'var(--blue)' },
        { label: '停止条件', value: '<EOS>トークン', color: 'var(--text-muted)' }
    ], 20);

    // --- Scene 22: Temperature info ---
    injectPill('scene-22', [
        { text: 'T → 0: 決定的  T → ∞: ランダム', color: 'var(--amber)', pos: 'top:16px;left:50%;transform:translateX(-50%);' }
    ], 21);

    injectStats('scene-22', [
        { label: 'ChatGPT Default', value: 'T = 0.7', color: 'var(--blue)' },
        { label: 'Code', value: 'T = 0.2', color: 'var(--emerald)' },
        { label: 'Creative', value: 'T = 1.2', color: 'var(--amber)' }
    ], 21);

    // --- Scene 23: Hallucination info ---
    injectStats('scene-23', [
        { label: '原因', value: '確率モデル', color: 'var(--rose)' },
        { label: '対策', value: 'RAG / Grounding', color: 'var(--blue)' },
        { label: '検出', value: '別モデルで検証', color: 'var(--emerald)' }
    ], 22);

    // --- Scene 25: Pre-training info ---
    injectStats('scene-25', [
        { label: 'データ量', value: '~13兆トークン', color: 'var(--blue)' },
        { label: '費用', value: '$100M+', color: 'var(--amber)' },
        { label: '目的', value: '次トークン予測', color: 'var(--emerald)' }
    ], 24);

    injectPill('scene-25', [
        { text: 'インターネットのテキストを学習', color: 'var(--blue)', pos: 'top:20px;right:40px;' }
    ], 24);

    // --- Scene 26: Scale info ---
    injectPill('scene-26', [
        { text: 'Scaling Law: 大きいほど賢い', color: 'var(--emerald)', pos: 'top:20px;right:40px;' },
        { text: '2年で100倍のペース', color: 'var(--amber)', pos: 'top:20px;left:40px;' }
    ], 25);

    // --- Scene 27: Fine-tuning info ---
    injectStats('scene-27', [
        { label: 'データ', value: '~10万対話', color: 'var(--amber)' },
        { label: '手法', value: 'SFT', color: 'var(--blue)' },
        { label: '目的', value: '指示に従う', color: 'var(--emerald)' }
    ], 26);

    // --- Scene 28: RLHF info ---
    injectStats('scene-28', [
        { label: 'PPO', value: '強化学習', color: 'var(--emerald)' },
        { label: '人間の判断', value: 'A vs B比較', color: 'var(--rose)' },
        { label: '効果', value: '安全性↑', color: 'var(--blue)' }
    ], 27);

    // --- Scene 29: Pyramid info ---
    injectStats('scene-29', [
        { label: '合計訓練時間', value: '~数ヶ月', color: 'var(--blue)' },
        { label: 'GPU', value: '数万台', color: 'var(--purple)' }
    ], 28);

    // --- Scene 31: Illusion extra ---
    injectStats('scene-31', [
        { label: 'パラメータ', value: '1兆+', color: 'var(--purple)' },
        { label: '学習データ', value: '13兆+トークン', color: 'var(--blue)' },
        { label: '理解？', value: '統計パターン', color: 'var(--amber)' }
    ], 30);
});
