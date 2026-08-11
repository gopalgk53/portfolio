"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; color: "cyan" | "purple" };

const NODE_COUNT = 100;
const LINK_DISTANCE = 118;
const CURSOR_RADIUS = 150;
const CYAN = "0,242,254";
const PURPLE = "79,172,254";

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const activeCanvas = canvas;
    const ctx = context;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = innerWidth;
    let height = innerHeight;
    let animationFrame = 0;
    let previousTime = performance.now();
    let nodes: Node[] = [];
    const mouse = { x: 0, y: 0, active: false };

    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        color: index % 2 === 0 ? "cyan" : "purple",
      }));
    }

    function resize() {
      const pixelRatio = Math.min(devicePixelRatio, 1.25);
      width = innerWidth;
      height = innerHeight;
      activeCanvas.width = Math.round(width * pixelRatio);
      activeCanvas.height = Math.round(height * pixelRatio);
      activeCanvas.style.width = `${width}px`;
      activeCanvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createNodes();
    }

    function updateNode(node: Node, delta: number) {
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > 4 && distanceSquared < CURSOR_RADIUS * CURSOR_RADIUS) {
          const distance = Math.sqrt(distanceSquared);
          const strength = (1 - distance / CURSOR_RADIUS) * 20;
          node.vx += (dx / distance) * strength * delta;
          node.vy += (dy / distance) * strength * delta;
        }
      }

      // Light damping prevents cursor attraction from creating runaway velocity.
      const damping = Math.pow(0.985, delta * 60);
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx * delta;
      node.y += node.vy * delta;

      if (node.x < 0) { node.x = 0; node.vx = Math.abs(node.vx); }
      if (node.x > width) { node.x = width; node.vx = -Math.abs(node.vx); }
      if (node.y < 0) { node.y = 0; node.vy = Math.abs(node.vy); }
      if (node.y > height) { node.y = height; node.vy = -Math.abs(node.vy); }
    }

    function render(time: number) {
      const delta = Math.min((time - previousTime) / 1000, 0.033);
      previousTime = time;
      ctx.clearRect(0, 0, width, height);

      if (!reducedMotion) nodes.forEach((node) => updateNode(node, delta));

      // Squared-distance comparisons avoid thousands of unnecessary square roots.
      for (let i = 0; i < nodes.length; i += 1) {
        const first = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const second = nodes[j];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared >= LINK_DISTANCE * LINK_DISTANCE) continue;
          const opacity = (1 - Math.sqrt(distanceSquared) / LINK_DISTANCE) * 0.15;
          ctx.strokeStyle = `rgba(${i % 2 === 0 ? CYAN : PURPLE},${opacity})`;
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(first.x, first.y);
          ctx.lineTo(second.x, second.y);
          ctx.stroke();
        }
      }

      nodes.forEach((node) => {
        const rgb = node.color === "cyan" ? CYAN : PURPLE;
        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < CURSOR_RADIUS * CURSOR_RADIUS) {
            const opacity = (1 - Math.sqrt(distanceSquared) / CURSOR_RADIUS) * 0.7;
            ctx.strokeStyle = `rgba(${rgb},${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 7;
        ctx.shadowColor = `rgb(${rgb})`;
        ctx.fillStyle = `rgba(${rgb},0.82)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.35, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      if (!reducedMotion) animationFrame = requestAnimationFrame(render);
    }

    const trackPointer = (event: PointerEvent) => { mouse.x = event.clientX; mouse.y = event.clientY; mouse.active = true; };
    const clearPointer = () => { mouse.active = false; };
    const handleVisibility = () => {
      cancelAnimationFrame(animationFrame);
      if (!document.hidden && !reducedMotion) { previousTime = performance.now(); animationFrame = requestAnimationFrame(render); }
    };

    resize();
    addEventListener("resize", resize, { passive: true });
    addEventListener("pointermove", trackPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", handleVisibility);
    if (reducedMotion) render(performance.now());
    else animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", trackPointer);
      document.documentElement.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 bg-[#05070b] opacity-80" aria-hidden="true" />;
}
