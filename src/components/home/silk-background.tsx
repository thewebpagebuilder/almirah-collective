"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight canvas silk/gradient mesh animation.
 * Avoids Three.js bundle cost while delivering a luxury ambient backdrop.
 */
export function SilkBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.2,
      s: 0.15 + Math.random() * 0.35,
      a: 0.08 + Math.random() * 0.18,
    }));

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      t += 0.004;

      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#FAF7F2");
      g.addColorStop(0.45, "#F0E8DC");
      g.addColorStop(1, "#E8DFD0");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Soft morphing silk bands
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yBase = height * (0.15 + i * 0.16);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= width; x += 12) {
          const y =
            yBase +
            Math.sin(x * 0.008 + t * (1 + i * 0.2) + i) * (18 + i * 6) +
            Math.cos(x * 0.004 - t * 0.7 + i) * 10;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(201, 169, 110, ${0.06 + i * 0.02})`;
        ctx.lineWidth = 40 + i * 12;
        ctx.stroke();
      }

      // Floating champagne particles
      for (const p of particles) {
        p.y -= p.s * 0.0015;
        p.x += Math.sin(t + p.y * 8) * 0.0004;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}
