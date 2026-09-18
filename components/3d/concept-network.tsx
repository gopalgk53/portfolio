"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// A small, self-contained knowledge-graph visual for the multi-agent case
// study's hero — the same single-accent-color node/edge language as the
// homepage's AI Knowledge Network (components/3d/three-canvas.tsx), scoped
// down to a standalone scene with its own six labeled concepts rather than
// sharing that component's scroll-domain wiring.

type ConceptNode = { id: string; label: string; position: THREE.Vector3 };

const NODES: ConceptNode[] = [
  { id: "stats", label: "Statistics", position: new THREE.Vector3(-2.5, 0.7, 0.2) },
  { id: "ml", label: "ML Models", position: new THREE.Vector3(-1.15, -0.85, 0.7) },
  { id: "dl", label: "Deep Learning", position: new THREE.Vector3(0.35, 1.15, -0.5) },
  { id: "aimodels", label: "AI Models", position: new THREE.Vector3(1.55, -0.35, 0.6) },
  { id: "agents", label: "AI Agents", position: new THREE.Vector3(2.65, 1.05, -0.25) },
  { id: "multiagents", label: "Multi-Agents", position: new THREE.Vector3(3.65, -0.55, 0.35) },
];

const EDGES: [string, string][] = [
  ["stats", "ml"],
  ["ml", "dl"],
  ["dl", "aimodels"],
  ["ml", "aimodels"],
  ["aimodels", "agents"],
  ["agents", "multiagents"],
];

const ACCENT = 0x2563eb;

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,.9)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

export function ConceptNetwork() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const labelHost = labelHostRef.current;
    if (!mount || !labelHost) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const disposables: { dispose: () => void }[] = [];
    const glowTexture = createGlowTexture();
    disposables.push(glowTexture);

    const dotGeometry = new THREE.SphereGeometry(0.09, 16, 16);
    disposables.push(dotGeometry);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: ACCENT });
    disposables.push(dotMaterial);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: ACCENT,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(glowMaterial);

    for (const node of NODES) {
      const mesh = new THREE.Mesh(dotGeometry, dotMaterial);
      mesh.position.copy(node.position);
      group.add(mesh);

      const glow = new THREE.Sprite(glowMaterial);
      glow.scale.set(0.7, 0.7, 1);
      glow.position.copy(node.position);
      group.add(glow);
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.32 });
    disposables.push(lineMaterial);
    for (const [a, b] of EDGES) {
      const nodeA = NODES.find((n) => n.id === a);
      const nodeB = NODES.find((n) => n.id === b);
      if (!nodeA || !nodeB) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
      disposables.push(geometry);
      group.add(new THREE.Line(geometry, lineMaterial));
    }

    const labelEls = new Map<string, HTMLDivElement>();
    for (const node of NODES) {
      const el = document.createElement("div");
      el.textContent = node.label;
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.top = "0";
      el.style.font = '500 12px "Inter", ui-sans-serif, sans-serif';
      el.style.letterSpacing = "-.005em";
      el.style.color = "var(--accent)";
      el.style.whiteSpace = "nowrap";
      el.style.willChange = "transform";
      labelHost.appendChild(el);
      labelEls.set(node.id, el);
    }

    const worldPosition = new THREE.Vector3();
    let frameId = 0;
    function renderFrame() {
      if (!reduceMotion) {
        group.rotation.y += 0.0022;
        group.rotation.x = Math.sin(Date.now() * 0.00018) * 0.1;
      }
      group.updateMatrixWorld();
      for (const node of NODES) {
        worldPosition.copy(node.position).applyMatrix4(group.matrixWorld).project(camera);
        const x = (worldPosition.x * 0.5 + 0.5) * width;
        const y = (-worldPosition.y * 0.5 + 0.5) * height;
        const el = labelEls.get(node.id);
        if (el) el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderFrame);
    }
    renderFrame();

    function handleResize() {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      labelEls.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div ref={mountRef} className="relative h-full w-full" aria-hidden="true">
      <div ref={labelHostRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}
