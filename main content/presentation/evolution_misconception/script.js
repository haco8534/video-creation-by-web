/* ============================================
   「進化論」の最大の誤解──人間はサルから進化していない
   script.js - Scene management & Canvas effects
   ============================================ */

(function () {
  'use strict';

  // --- Scene Management ---
  const scenes = document.querySelectorAll('.scene');
  let currentScene = 0;

  function showScene(index) {
    if (index < 0 || index >= scenes.length) return;
    scenes.forEach((s, i) => {
      s.classList.remove('active');
      // Reset stagger items
      s.querySelectorAll('.stagger-item').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // trigger reflow
        el.style.animation = '';
      });
    });
    currentScene = index;
    scenes[currentScene].classList.add('active');
    initCanvasForScene(currentScene);
  }

  // Expose goTo globally for recording script
  window.goTo = function (index) {
    showScene(index);
  };

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      showScene(currentScene + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showScene(currentScene - 1);
    }
  });

  // --- Canvas Background Effects ---
  const canvasConfigs = {
    0: { type: 'tree', color: '#4A6CF7' },
    1: { type: 'particles', color: '#4A6CF7' },
    3: { type: 'particles', color: '#2ECC71' },
    7: { type: 'tree', color: '#E74C3C' },
    13: { type: 'tree', color: '#4A6CF7' },
    18: { type: 'particles', color: '#F7B731' },
    25: { type: 'tree', color: '#2ECC71' }
  };

  const activeAnimations = {};

  function initCanvasForScene(sceneIndex) {
    // Cancel all previous animations
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

    if (config.type === 'tree') {
      animateTree(ctx, canvas, config.color, sceneIndex);
    } else if (config.type === 'particles') {
      animateParticles(ctx, canvas, config.color, sceneIndex);
    }
  }

  // --- Branching Tree Animation (evolution-themed) ---
  function animateTree(ctx, canvas, color, sceneId) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const nodes = [];
    const nodeCount = 35;
    const connectionDist = 200;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 3 + 2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Draw connections (branching lines)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.12;
            ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            // Curved connections for organic feel
            const mx = (nodes[i].x + nodes[j].x) / 2 + (Math.random() - 0.5) * 20;
            const my = (nodes[i].y + nodes[j].y) / 2 + (Math.random() - 0.5) * 20;
            ctx.quadraticCurveTo(mx, my, nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & update nodes
      nodes.forEach(node => {
        node.pulse += 0.02;
        const pulseR = node.r + Math.sin(node.pulse) * 1.5;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR * 3, 0, Math.PI * 2);
        ctx.fillStyle = color + '08';
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = color + '25';
        ctx.fill();

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });

      activeAnimations[sceneId] = requestAnimationFrame(draw);
    }

    draw();
  }

  // --- Floating Particles Animation ---
  function animateParticles(ctx, canvas, color, sceneId) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const particles = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 4 + 1,
        speed: Math.random() * 0.3 + 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.3 + 0.05
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Move
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed - 0.15;
        p.angle += (Math.random() - 0.5) * 0.05;

        // Wrap
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      });

      activeAnimations[sceneId] = requestAnimationFrame(draw);
    }

    draw();
  }

  // --- Initialize ---
  showScene(0);
})();
