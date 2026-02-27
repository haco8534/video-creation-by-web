// ============================================================
// Scene Management for mozart_effect
// ============================================================
(function () {
    'use strict';

    // --- Scene elements ---
    var scenes = document.querySelectorAll('.scene');
    var current = 0;

    // --- Go to scene by index ---
    function goTo(index) {
        if (index < 0 || index >= scenes.length) return;
        scenes[current].classList.remove('active');
        current = index;
        scenes[current].classList.add('active');
    }
    window.goTo = goTo;

    // --- Keyboard navigation ---
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goTo(current + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(current - 1);
        }
    });

    // ============================================================
    // Canvas Particle Background
    // ============================================================
    var canvasIds = [
        'canvas-title',
        'canvas-ch1',
        'canvas-ch2',
        'canvas-ch3',
        'canvas-ch4',
        'canvas-ch5',
        'canvas-ch6',
        'canvas-summary',
        'canvas-ending'
    ];

    // Particle class definition
    function Particle(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.3 + 0.1;
    }

    Particle.prototype.update = function () {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;
    };

    Particle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, ' + this.opacity + ')';
        ctx.fill();
    };

    // Initialize canvases
    canvasIds.forEach(function (id) {
        var canvas = document.getElementById(id);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var particles = [];
        var count = 60;

        function resize() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        for (var i = 0; i < count; i++) {
            particles.push(new Particle(canvas));
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(function (p) {
                p.update();
                p.draw(ctx);
            });
            requestAnimationFrame(animate);
        }
        animate();
    });

    // ============================================================
    // End of module
    // ============================================================
})();
