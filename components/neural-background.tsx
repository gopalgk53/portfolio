"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let nodes: Node[] = [];

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 1.5);
      width = innerWidth;
      height = innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 720 ? 34 : 72;
      nodes = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12, r: Math.random() * 1.2 + .5 }));
    };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!reduced) { node.x += node.vx; node.y += node.vy; }
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        context.fillStyle = i % 4 === 0 ? "rgba(139,92,246,.55)" : i % 3 === 0 ? "rgba(16,185,129,.5)" : "rgba(59,130,246,.5)";
        context.beginPath(); context.arc(node.x, node.y, node.r, 0, Math.PI * 2); context.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const target = nodes[j], distance = Math.hypot(node.x - target.x, node.y - target.y);
          if (distance < 125) { context.strokeStyle = `rgba(99,102,241,${(1 - distance / 125) * .09})`; context.beginPath(); context.moveTo(node.x, node.y); context.lineTo(target.x, target.y); context.stroke(); }
        }
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    resize(); draw();
    addEventListener("resize", resize, { passive: true });
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden="true" />;
}
