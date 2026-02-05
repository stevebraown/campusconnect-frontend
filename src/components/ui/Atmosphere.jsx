import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Background mesh/bokeh canvas for deep-space atmosphere.
 * Lightweight animated blobs rendered via canvas; falls back to gradient layers.
 */
function Atmosphere() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const blobs = new Array(9).fill(0).map((_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 180 + Math.random() * 120,
      hue: 130 + idx * 12,
      speed: 0.12 + Math.random() * 0.2,
      dir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      blobs.forEach((b, i) => {
        b.x += Math.cos((Date.now() * b.speed) / 2000 + i) * 0.45 * b.dir;
        b.y += Math.sin((Date.now() * b.speed) / 2200 + i) * 0.35 * b.dir;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;

        const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r);
        gradient.addColorStop(0, `hsla(${b.hue}, 70%, 62%, 0.35)`);
        gradient.addColorStop(1, 'hsla(220, 40%, 10%, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-indigo-500/6 to-cyan-400/8"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 backdrop-blur-2xl opacity-60" />
    </div>
  );
}

export default Atmosphere;
