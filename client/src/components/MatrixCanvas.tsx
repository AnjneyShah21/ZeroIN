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

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()_+-=[]{}|;:<>?/\\\\ZeroINv2.0AES256GCMWEBCRYPTO';
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const speeds: number[] = Array(columns).fill(0).map(() => 0.5 + Math.random() * 0.5);
    const opacity: number[] = Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);

    let mouseX = -1;
    let mouseY = -1;

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
      // Dark fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Distance from mouse cursor
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const boost = dist < 150 ? 2.5 : 1;

        // Brighter columns near the cursor
        if (dist < 120) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, (120 - dist) / 120 * 0.9 + 0.1)})`;
          ctx.font = `bold ${fontSize + 2}px monospace`;
        } else if (dist < 200) {
          ctx.fillStyle = `rgba(16, 185, 129, ${opacity[i] * 0.85})`;
          ctx.font = `${fontSize}px monospace`;
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${opacity[i] * 0.55})`;
          ctx.font = `${fontSize}px monospace`;
        }

        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speeds[i] * boost;
      }

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
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};
