/* ===================================
   Scene Manager & Canvas Animations
   skipping_breakfast
   =================================== */

const scenes = document.querySelectorAll('.scene');
let current = 0;
const canvasAnimations = {};

function showScene(idx) {
    if (idx < 0 || idx >= scenes.length) return;
    scenes.forEach((s, i) => {
        s.classList.remove('active');
        if (canvasAnimations[i]) {
            cancelAnimationFrame(canvasAnimations[i]);
            canvasAnimations[i] = null;
        }
    });
    current = idx;
    scenes[current].classList.add('active');
    initCanvasIfNeeded(current);
}

window.goTo = function (index) {
    showScene(index);
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        showScene(current + 1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showScene(current - 1);
    }
});

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
            alpha: Math.random() * 0.2 + 0.05,
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

window.addEventListener('resize', () => {
    Object.keys(canvasAnimations).forEach(idx => {
        const canvas = scenes[idx].querySelector('.bg-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
});

showScene(0);
