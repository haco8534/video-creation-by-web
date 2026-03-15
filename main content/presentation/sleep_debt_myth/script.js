/* ============================================
   「寝だめ」は効かない──週末の寝坊では取り戻せない
   script.js - Scene management & Canvas effects
   ============================================ */

(function () {
  'use strict';

  const scenes = document.querySelectorAll('.scene');
  let currentScene = 0;

  function showScene(index) {
    if (index < 0 || index >= scenes.length) return;
    scenes.forEach((s) => {
      s.classList.remove('active');
      s.querySelectorAll('.stagger-item').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
      });
    });
    currentScene = index;
    scenes[currentScene].classList.add('active');
    initCanvasForScene(currentScene);
  }

  window.goTo = function (index) { showScene(index); };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      showScene(currentScene + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showScene(currentScene - 1);
    }
  });

  // Canvas configs – light theme colors (softer, lower opacity)
  const canvasConfigs = {
    0:  { type: 'particles', color: '#4A6CF7' },
    1:  { type: 'particles', color: '#4A6CF7' },
    4:  { type: 'nodes', color: '#4A6CF7' },
    5:  { type: 'particles', color: '#4A6CF7' },
    8:  { type: 'particles', color: '#E74C3C' },
    9:  { type: 'nodes', color: '#F7B731' },
    14: { type: 'nodes', color: '#E74C3C' },
    15: { type: 'particles', color: '#E74C3C' },
    20: { type: 'nodes', color: '#F7B731' },
    21: { type: 'particles', color: '#F7B731' },
    26: { type: 'nodes', color: '#2ECC71' },
    31: { type: 'particles', color: '#2ECC71' },
  };

  const activeAnimations = {};

  function initCanvasForScene(sceneIndex) {
    Object.keys(activeAnimations).forEach(key => {
      cancelAnimationFrame(activeAnimations[key]);
      delete activeAnimations[key];
    });

    const config = canvasConfigs[sceneIndex];
    if (!config) return;

    const canvas = document.getElementById('canvas-' + sceneIndex);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }
    resize();

    if (config.type === 'nodes') {
      animateNodes(ctx, canvas, config.color, sceneIndex);
    } else if (config.type === 'particles') {
      animateParticles(ctx, canvas, config.color, sceneIndex);
    }
  }

  function animateNodes(ctx, canvas, color, sceneId) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const nodes = [];
    const nodeCount = 25;
    const connectionDist = 160;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 1.5, pulse: Math.random() * Math.PI * 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.08;
            ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            const mx = (nodes[i].x + nodes[j].x) / 2 + (Math.random() - 0.5) * 12;
            const my = (nodes[i].y + nodes[j].y) / 2 + (Math.random() - 0.5) * 12;
            ctx.quadraticCurveTo(mx, my, nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(node => {
        node.pulse += 0.02;
        const pulseR = node.r + Math.sin(node.pulse) * 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color + '06';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = color + '15';
        ctx.fill();
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });
      activeAnimations[sceneId] = requestAnimationFrame(draw);
    }
    draw();
  }

  function animateParticles(ctx, canvas, color, sceneId) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const particles = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 3 + 1, speed: Math.random() * 0.2 + 0.06,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.12 + 0.03
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed - 0.1;
        p.angle += (Math.random() - 0.5) * 0.03;
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      });
      activeAnimations[sceneId] = requestAnimationFrame(draw);
    }
    draw();
  }

  showScene(0);
})();
