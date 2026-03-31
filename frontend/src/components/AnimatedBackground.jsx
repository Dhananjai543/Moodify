import { useEffect, useRef } from 'react';

const GREEN_COUNT = 350;
const WHITE_COUNT = 290;
const REPULSE_RADIUS = 140;
const REPULSE_FORCE = 8;
const RETURN_SPEED = 0.03;

function createParticle(canvas, color) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  return {
    x,
    y,
    homeX: x,
    homeY: y,
    size: Math.random() * (color === 'white' ? 1.8 : 2.8) + 0.4,
    speedX: (Math.random() - 0.5) * 0.25,
    speedY: (Math.random() - 0.5) * 0.25,
    opacity: Math.random() * (color === 'white' ? 0.35 : 0.6) + 0.1,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    vx: 0,
    vy: 0,
    color,
  };
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const buildParticles = () => {
      const greens = Array.from({ length: GREEN_COUNT }, () => createParticle(canvas, 'green'));
      const whites = Array.from({ length: WHITE_COUNT }, () => createParticle(canvas, 'white'));
      particlesRef.current = [...greens, ...whites];
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) buildParticles();
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    if (particlesRef.current.length === 0) buildParticles();

    const drawAurora = (time) => {
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.0003) * 200,
        canvas.height * 0.4 + Math.cos(time * 0.0004) * 100,
        0,
        canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.5
      );
      g1.addColorStop(0, 'rgba(0, 255, 135, 0.06)');
      g1.addColorStop(0.5, 'rgba(0, 108, 72, 0.03)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.0005) * 150,
        canvas.height * 0.6 + Math.sin(time * 0.0003) * 120,
        0,
        canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.4
      );
      g2.addColorStop(0, 'rgba(0, 237, 125, 0.04)');
      g2.addColorStop(0.5, 'rgba(0, 108, 72, 0.02)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g3 = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(time * 0.0002) * 300,
        canvas.height * 0.2 + Math.cos(time * 0.0006) * 80,
        0,
        canvas.width * 0.5, canvas.height * 0.2, canvas.width * 0.3
      );
      g3.addColorStop(0, 'rgba(164, 255, 185, 0.03)');
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawParticles = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPULSE_RADIUS && dist > 0) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / REPULSE_RADIUS) * REPULSE_FORCE;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }

        p.vx *= 0.92;
        p.vy *= 0.92;

        p.homeX += p.speedX;
        p.homeY += p.speedY;

        if (p.homeX < 0) p.homeX = canvas.width;
        if (p.homeX > canvas.width) p.homeX = 0;
        if (p.homeY < 0) p.homeY = canvas.height;
        if (p.homeY > canvas.height) p.homeY = 0;

        p.x += (p.homeX - p.x) * RETURN_SPEED + p.vx;
        p.y += (p.homeY - p.y) * RETURN_SPEED + p.vy;

        p.pulse += p.pulseSpeed;
        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const glowBoost = Math.min(speed * 0.15, 0.4);

        const isWhite = p.color === 'white';
        const r = isWhite ? 255 : 0;
        const g = isWhite ? 255 : 255;
        const b = isWhite ? 255 : 135;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(currentOpacity * 0.1) + glowBoost * 0.06})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity + glowBoost})`;
        ctx.fill();
      });
    };

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAurora(timestamp);
      drawParticles();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#030A06' }}
    />
  );
}
