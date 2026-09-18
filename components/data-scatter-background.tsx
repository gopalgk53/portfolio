"use client";

import { useEffect, useRef } from "react";

// A sitewide ambient background: a drifting field of blue "data points"
// linked by lines when they pass close enough, with pulses running along
// the strongest links so the network reads as live traffic rather than a
// still image. Deliberately a lightweight 2D canvas, not another three.js
// scene, so it can run fixed behind every page without the cost of a
// second WebGL context.

type Point = { x: number; y: number; vx: number; vy: number; r: number; phase: number };

const ACCENT = "37,99,235";
const LINK_DISTANCE = 150;
// Links closer than this fraction of LINK_DISTANCE carry a travelling
// pulse. Running one on every link at once reads as noise.
const PULSE_RANGE = 0.62;

export function DataScatterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio, 2);
    let points: Point[] = [];

    function seed() {
      const count = Math.max(34, Math.min(84, Math.round((width * height) / 22000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Fast enough to read as motion at a glance. The previous 0.12
        // range worked out to ~3px/second, which the eye reads as a still
        // image however long you look at it.
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.5) * 1.1,
        r: Math.random() < 0.2 ? 5 : 3,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    resize();
    window.addEventListener("resize", resize);

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},.9)`;
        ctx.fill();
      }
    }

    if (reduceMotion) {
      drawStatic();
      return () => window.removeEventListener("resize", resize);
    }

    let frameId = 0;
    function tick() {
      const now = performance.now() / 1000;
      ctx.clearRect(0, 0, width, height);

      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        // A slow sway across the direction of travel, so paths curve
        // instead of running dead straight.
        p.x += Math.sin(now * 0.4 + p.phase) * 0.25;
        p.y += Math.cos(now * 0.33 + p.phase) * 0.25;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      const pulses: Array<{ x: number; y: number; strength: number }> = [];
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= LINK_DISTANCE) continue;
          const strength = 1 - dist / LINK_DISTANCE;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${ACCENT},${0.5 * strength})`;
          ctx.lineWidth = 2.2;
          ctx.stroke();
          if (strength > 1 - PULSE_RANGE) {
            // Offset per pair so the pulses don't march in lockstep.
            const t = (now * 0.5 + (i * 0.37 + j * 0.11)) % 1;
            pulses.push({ x: a.x - dx * t, y: a.y - dy * t, strength });
          }
        }
      }

      ctx.shadowColor = `rgba(${ACCENT},.55)`;
      ctx.shadowBlur = 12;
      for (const pulse of pulses) {
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},${0.9 * pulse.strength})`;
        ctx.fill();
      }
      for (const p of points) {
        const breathe = 1 + Math.sin(now * 1.7 + p.phase) * 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * breathe, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},.95)`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="no-print pointer-events-none fixed inset-0 z-[2]" />;
}
