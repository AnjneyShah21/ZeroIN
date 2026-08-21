import React, { useEffect, useRef } from 'react';

export const MatrixCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;

    // Particle network system
    const PARTICLE_COUNT = 120;
    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; opacity: number;
    };

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: 1.5 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.5,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections between close particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Attract toward mouse (subtle pull)
        const dxm = mouseX - p.x;
        const dym = mouseY - p.y;
        const distMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distMouse < 220) {
          p.vx += (dxm / distMouse) * 0.03;
          p.vy += (dym / distMouse) * 0.03;
        }

        // Limit speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx *= 0.95; p.vy *= 0.95; }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const lineOpacity = (1 - dist / 140) * 0.5;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // Mouse glow connection
        const dxMouseP = p.x - mouseX;
        const dyMouseP = p.y - mouseY;
        const distMP = Math.sqrt(dxMouseP * dxMouseP + dyMouseP * dyMouseP);
        if (distMP < 180) {
          const glow = (1 - distMP / 180);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${glow * 0.6})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }

        // Draw particle dot
        const glowDist = distMP < 180 ? (1 - distMP / 180) : 0;
        ctx.beginPath();
        if (glowDist > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + glowDist * 0.3})`;
          ctx.arc(p.x, p.y, p.size * (1 + glowDist), 0, Math.PI * 2);
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Cursor glow orb
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ opacity: 1 }}
    />
  );
};
