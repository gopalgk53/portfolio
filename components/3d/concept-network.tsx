"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// The multi-agent case study's hero visual: this project's own agent
// pipeline, not a generic ML concept cloud. Nodes and edges mirror the
// architecture doc — intake, research, evidence and discrepancy agents
// running under the Foundry layer, a correction branch, QC, then human
// review — and packets travel the edges in flow order so the picture
// shows work orders moving through the system rather than a graph
// spinning for its own sake.

type AgentNode = { id: string; label: string; position: THREE.Vector3; kind: "endpoint" | "agent" };

export type NetworkVariant = "agents" | "pipeline";

const AGENT_NODES: AgentNode[] = [
  { id: "intake-wo", label: "Work order", position: new THREE.Vector3(-3.05, -0.15, 0), kind: "endpoint" },
  { id: "intake", label: "Intake agent", position: new THREE.Vector3(-1.95, 0.8, 0.25), kind: "agent" },
  { id: "research", label: "Research agent", position: new THREE.Vector3(-0.95, -0.7, -0.3), kind: "agent" },
  { id: "evidence", label: "Evidence agent", position: new THREE.Vector3(0.1, 0.95, 0.3), kind: "agent" },
  { id: "discrepancy", label: "Discrepancy agent", position: new THREE.Vector3(1.15, -0.45, -0.25), kind: "agent" },
  { id: "correction", label: "Research correction", position: new THREE.Vector3(0.7, -1.75, 0.2), kind: "agent" },
  { id: "qc", label: "QC agent", position: new THREE.Vector3(2.15, 0.75, 0.2), kind: "agent" },
  { id: "human", label: "Human review", position: new THREE.Vector3(3.05, -0.55, 0), kind: "endpoint" },
];

// Ordered: packets follow this sequence, so it reads as the real path a
// work order takes rather than an arbitrary set of connections.
const AGENT_EDGES: [string, string][] = [
  ["intake-wo", "intake"],
  ["intake", "research"],
  ["research", "evidence"],
  ["evidence", "discrepancy"],
  ["discrepancy", "correction"],
  ["correction", "qc"],
  ["discrepancy", "qc"],
  ["qc", "human"],
];

// The payment-risk pipeline: the same governed path the case study
// describes, from raw data in S3 through to a served, monitored score.
const PIPELINE_NODES: AgentNode[] = [
  { id: "s3", label: "S3", position: new THREE.Vector3(-3.05, -0.2, 0), kind: "endpoint" },
  { id: "glue", label: "Glue ETL", position: new THREE.Vector3(-1.95, 0.8, 0.25), kind: "agent" },
  { id: "athena", label: "Athena", position: new THREE.Vector3(-0.85, -0.7, -0.3), kind: "agent" },
  { id: "sagemaker", label: "SageMaker", position: new THREE.Vector3(0.25, 0.95, 0.3), kind: "agent" },
  { id: "shap", label: "SHAP", position: new THREE.Vector3(0.7, -1.7, 0.2), kind: "agent" },
  { id: "ecs", label: "ECS", position: new THREE.Vector3(1.6, -0.4, -0.25) , kind: "agent" },
  { id: "cloudwatch", label: "CloudWatch", position: new THREE.Vector3(2.4, 0.8, 0.2), kind: "agent" },
  { id: "review", label: "Human review", position: new THREE.Vector3(3.15, -0.6, 0), kind: "endpoint" },
];

const PIPELINE_EDGES: [string, string][] = [
  ["s3", "glue"],
  ["glue", "athena"],
  ["athena", "sagemaker"],
  ["sagemaker", "shap"],
  ["shap", "ecs"],
  ["sagemaker", "ecs"],
  ["ecs", "cloudwatch"],
  ["cloudwatch", "review"],
];

const GRAPHS: Record<NetworkVariant, { nodes: AgentNode[]; edges: [string, string][] }> = {
  agents: { nodes: AGENT_NODES, edges: AGENT_EDGES },
  pipeline: { nodes: PIPELINE_NODES, edges: PIPELINE_EDGES },
};

const ACCENT = 0x2563eb;
const PACKETS = 3;

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

export function ConceptNetwork({ variant = "agents" }: { variant?: NetworkVariant }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { nodes: NODES, edges: EDGES } = GRAPHS[variant];
    const mount = mountRef.current;
    const labelHost = labelHostRef.current;
    if (!mount || !labelHost) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const disposables: { dispose: () => void }[] = [];
    const glowTexture = createGlowTexture();
    disposables.push(glowTexture);

    const nodeOf = (id: string) => NODES.find((n) => n.id === id);

    // Each node keeps its own material so a packet arriving can brighten
    // that stage specifically.
    const nodeVisuals = new Map<string, { glow: THREE.Sprite; material: THREE.MeshBasicMaterial; base: number }>();
    for (const node of NODES) {
      const radius = node.kind === "endpoint" ? 0.13 : 0.1;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      disposables.push(geometry);
      const material = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.85 });
      disposables.push(material);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(node.position);
      group.add(mesh);

      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: ACCENT,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(glowMaterial);
      const glow = new THREE.Sprite(glowMaterial);
      const baseScale = node.kind === "endpoint" ? 0.85 : 0.7;
      glow.scale.set(baseScale, baseScale, 1);
      glow.position.copy(node.position);
      group.add(glow);

      nodeVisuals.set(node.id, { glow, material, base: baseScale });
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.3 });
    disposables.push(lineMaterial);
    const segments: { from: THREE.Vector3; to: THREE.Vector3; toId: string }[] = [];
    for (const [a, b] of EDGES) {
      const nodeA = nodeOf(a);
      const nodeB = nodeOf(b);
      if (!nodeA || !nodeB) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
      disposables.push(geometry);
      group.add(new THREE.Line(geometry, lineMaterial));
      segments.push({ from: nodeA.position, to: nodeB.position, toId: b });
    }

    const packetGeometry = new THREE.SphereGeometry(0.075, 12, 12);
    disposables.push(packetGeometry);
    const packetMaterial = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    disposables.push(packetMaterial);
    const packets = Array.from({ length: PACKETS }, () => {
      const mesh = new THREE.Mesh(packetGeometry, packetMaterial);
      group.add(mesh);
      return mesh;
    });

    const labelEls = new Map<string, HTMLDivElement>();
    for (const node of NODES) {
      const el = document.createElement("div");
      el.textContent = node.label;
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.top = "0";
      el.style.font = '600 11px "Inter", ui-sans-serif, sans-serif';
      el.style.letterSpacing = "-.005em";
      el.style.color = "var(--accent)";
      el.style.whiteSpace = "nowrap";
      el.style.willChange = "transform";
      el.style.transition = "opacity .3s ease";
      labelHost.appendChild(el);
      labelEls.set(node.id, el);
    }

    const worldPosition = new THREE.Vector3();
    const activation = new Map<string, number>();
    let frameId = 0;

    function renderFrame() {
      const now = performance.now() / 1000;

      if (!reduceMotion) {
        // A gentle sway rather than a full spin: the pipeline reads left to
        // right, and rotating it past a certain point makes the order
        // illegible.
        group.rotation.y = Math.sin(now * 0.18) * 0.22;
        group.rotation.x = Math.sin(now * 0.13) * 0.07;
      }

      for (const id of activation.keys()) activation.set(id, Math.max(0, (activation.get(id) || 0) - 0.02));

      if (!reduceMotion) {
        packets.forEach((packet, index) => {
          const t = (now * 0.13 + index / PACKETS) % 1;
          const scaled = t * segments.length;
          const segmentIndex = Math.min(segments.length - 1, Math.floor(scaled));
          const local = scaled - segmentIndex;
          const segment = segments[segmentIndex];
          packet.position.lerpVectors(segment.from, segment.to, local);
          if (local > 0.82) activation.set(segment.toId, 1);
        });
      }

      group.updateMatrixWorld();

      for (const node of NODES) {
        const visual = nodeVisuals.get(node.id);
        const level = activation.get(node.id) || 0;
        if (visual) {
          const scale = visual.base * (1 + level * 0.85);
          visual.glow.scale.set(scale, scale, 1);
          visual.glow.material.opacity = 0.4 + level * 0.45;
          visual.material.opacity = 0.85 + level * 0.15;
        }
        worldPosition.copy(node.position).applyMatrix4(group.matrixWorld).project(camera);
        const x = (worldPosition.x * 0.5 + 0.5) * width;
        const y = (-worldPosition.y * 0.5 + 0.5) * height;
        const el = labelEls.get(node.id);
        if (el) {
          el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y - 18}px)`;
          el.style.opacity = String(0.72 + level * 0.28);
        }
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
  }, [variant]);

  return (
    <div ref={mountRef} className="relative h-full w-full" aria-hidden="true">
      <div ref={labelHostRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}
