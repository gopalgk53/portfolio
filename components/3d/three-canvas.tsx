"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SceneDomain, useSceneDomain } from "./scene-state";

// ---------------------------------------------------------------------------
// AI Knowledge Network — the hero/background visual metaphor. Ten named
// nodes (the real stages of a retrieval + agentic system) laid out as a
// sparse graph, not a decorative particle cloud. A single accent color is
// used throughout; scroll position only changes which cluster reads as
// "active" (brighter dots, brighter edges, traveling pulses) — never hue.
// ---------------------------------------------------------------------------

type NodeGroup = "retrieval" | "agents" | "infra";
type NodeId = "documents" | "embeddings" | "vectordb" | "retriever" | "llm" | "memory" | "agents" | "tools" | "apis" | "aws";

type NetworkNode = { id: NodeId; label: string; group: NodeGroup; position: THREE.Vector3; primary?: boolean };

const NODES: NetworkNode[] = [
  { id: "documents", label: "Documents", group: "retrieval", position: new THREE.Vector3(-5.4, 1.5, -0.8), primary: true },
  { id: "embeddings", label: "Embeddings", group: "retrieval", position: new THREE.Vector3(-3.35, 0.55, 0.5) },
  { id: "vectordb", label: "Vector DB", group: "retrieval", position: new THREE.Vector3(-1.35, 1.45, -0.6), primary: true },
  { id: "retriever", label: "Retriever", group: "retrieval", position: new THREE.Vector3(0.55, 0.2, 0.65) },
  { id: "llm", label: "LLM", group: "retrieval", position: new THREE.Vector3(2.55, 1.05, -0.3), primary: true },
  { id: "memory", label: "Memory", group: "agents", position: new THREE.Vector3(4.35, 2.15, 0.55) },
  { id: "agents", label: "Agents", group: "agents", position: new THREE.Vector3(4.75, 0.05, 1.05), primary: true },
  { id: "tools", label: "Tools", group: "agents", position: new THREE.Vector3(6.55, 1.05, -0.35) },
  { id: "apis", label: "APIs", group: "infra", position: new THREE.Vector3(6.35, -1.55, 0.6) },
  { id: "aws", label: "AWS", group: "infra", position: new THREE.Vector3(8.15, -0.55, -0.2), primary: true },
];

const EDGES: Array<[NodeId, NodeId, NodeGroup]> = [
  ["documents", "embeddings", "retrieval"],
  ["embeddings", "vectordb", "retrieval"],
  ["vectordb", "retriever", "retrieval"],
  ["retriever", "llm", "retrieval"],
  ["llm", "memory", "agents"],
  ["llm", "agents", "agents"],
  ["memory", "agents", "agents"],
  ["agents", "tools", "agents"],
  ["agents", "apis", "infra"],
  ["apis", "aws", "infra"],
];

const GROUPS: NodeGroup[] = ["retrieval", "agents", "infra"];

const domainEmphasis: Record<SceneDomain, Partial<Record<NodeGroup, number>>> = {
  identity: {},
  retrieval: { retrieval: 1 },
  agents: { agents: 1, retrieval: 0.3 },
  infra: { infra: 1, agents: 0.25 },
  capabilities: {},
  close: {},
};

const ACCENT = 0xd9ff43;
const DOT_BASE = 0xd7d8dc;

// ---------------------------------------------------------------------------
// Capabilities motifs — five small, self-contained constructs, one per
// execution-stack category, that only surface while that section is
// centered. Same rule as the network above: shape carries the meaning, not
// color — a layered lattice for Models, a chasing pulse train for
// Inference, a hub with orbiting spokes for Orchestration/Agents, a rising
// stream for Vector/RAG, a flat grid for Engineering.
// ---------------------------------------------------------------------------
type CapabilityId = "models" | "inference" | "orchestration" | "vectorRag" | "engineering";

interface CapabilitySpec {
  id: CapabilityId;
  label: string;
  x: number;
  points: THREE.Vector3[];
  edges: Array<[number, number]>;
  motion?: "chase" | "orbit";
}

const CAPABILITY_Y = 2.7;

const CAPABILITIES: CapabilitySpec[] = [
  {
    id: "models",
    label: "Models & Fine-Tuning",
    x: -6.4,
    points: [
      new THREE.Vector3(-0.5, 0.5, 0), new THREE.Vector3(0, 0.5, 0.3), new THREE.Vector3(0.5, 0.5, 0),
      new THREE.Vector3(-0.5, 0, -0.2), new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(0.5, 0, -0.2),
      new THREE.Vector3(-0.5, -0.5, 0), new THREE.Vector3(0, -0.5, 0.3), new THREE.Vector3(0.5, -0.5, 0),
    ],
    edges: [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]],
  },
  {
    id: "inference",
    label: "Inference & Optimization",
    x: -3.2,
    points: [
      new THREE.Vector3(-0.6, 0, 0), new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, 0, 0), new THREE.Vector3(0.6, 0, 0),
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
    motion: "chase",
  },
  {
    id: "orchestration",
    label: "Orchestration & Agents",
    x: 0,
    points: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.55, 0, 0), new THREE.Vector3(-0.55, 0, 0),
      new THREE.Vector3(0, 0.55, 0), new THREE.Vector3(0, -0.55, 0),
    ],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4]],
    motion: "orbit",
  },
  {
    id: "vectorRag",
    label: "Vector Databases & RAG",
    x: 3.2,
    points: [new THREE.Vector3(0, -0.6, 0), new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0, 0.6, 0)],
    edges: [[0, 1], [1, 2], [2, 3]],
    motion: "chase",
  },
  {
    id: "engineering",
    label: "Engineering & Infrastructure",
    x: 6.4,
    points: [new THREE.Vector3(-0.4, 0.35, 0), new THREE.Vector3(0.4, 0.35, 0), new THREE.Vector3(-0.4, -0.35, 0), new THREE.Vector3(0.4, -0.35, 0)],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3]],
  },
];

function circleTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelHostRef = useRef<HTMLDivElement>(null);
  const activeDomain = useSceneDomain();
  const activeRef = useRef(activeDomain);
  useEffect(() => {
    activeRef.current = activeDomain;
  }, [activeDomain]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const labelHost = labelHostRef.current;
    if (!canvas || !labelHost) return;

    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const savedMode = localStorage.getItem("gopal-effects-mode");
    let effectsMode: "low" | "balanced" | "immersive" = savedMode === "low" || savedMode === "immersive" ? savedMode : "balanced";

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile && effectsMode !== "low" && !reduceMotion, powerPreference: effectsMode === "immersive" && !reduceMotion ? "high-performance" : "low-power" });
      canvas.dataset.webgl = "ready";
    } catch {
      canvas.dataset.webgl = "unavailable";
      return;
    }

    const basePixelRatio = Math.min(window.devicePixelRatio, mobile ? 1 : 1.35);
    let qualityScale = reduceMotion ? 0.62 : effectsMode === "low" ? 0.72 : 1;
    let contextLost = false;
    renderer.setPixelRatio(basePixelRatio);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.set(0.4, 0, 11);

    const graph = new THREE.Group();
    scene.add(graph);
    const texture = circleTexture();

    // Node dots — one sprite each so every node can pulse/emphasize on its own.
    const dotState = NODES.map((node) => {
      const material = new THREE.SpriteMaterial({ map: texture, color: DOT_BASE, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(node.position);
      sprite.scale.setScalar(node.primary ? 0.56 : 0.36);
      graph.add(sprite);
      return { node, sprite, material, boost: 0, seed: Math.random() * 10 };
    });

    // Edges — grouped by domain so opacity can move independently per cluster.
    const edgeState = GROUPS.map((group) => {
      const pairs = EDGES.filter(([, , g]) => g === group);
      const positions: number[] = [];
      pairs.forEach(([a, b]) => {
        const from = NODES.find((n) => n.id === a)!.position;
        const to = NODES.find((n) => n.id === b)!.position;
        positions.push(from.x, from.y, from.z, to.x, to.y, to.z);
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const lines = new THREE.LineSegments(geometry, material);
      graph.add(lines);

      // A handful of pulses travel each active edge group to suggest data flow.
      const pulseCount = reduceMotion ? 0 : Math.min(pairs.length * 2, mobile || effectsMode === "low" ? 4 : 8);
      const pulseGeometry = new THREE.SphereGeometry(0.045, 8, 8);
      const pulseMaterial = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const pulses = new THREE.InstancedMesh(pulseGeometry, pulseMaterial, pulseCount);
      graph.add(pulses);

      return { group, pairs, geometry, material, pulses, pulseGeometry, pulseMaterial, boost: 0 };
    });

    // Sparse ambient dust for depth — not decorative particles standing in
    // for the network itself, just atmosphere behind it.
    const dustCount = reduceMotion ? 45 : mobile || effectsMode === "low" ? 90 : 240;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 18;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({ color: 0x53565c, size: 0.02, transparent: true, opacity: 0.35, depthWrite: false, sizeAttenuation: true });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    // Its own group, siblings with (not a child of) the network graph, so it
    // drifts at a different rate under the cursor — a cheap depth-of-field
    // parallax layer instead of everything moving in perfect lockstep.
    const dustGroup = new THREE.Group();
    dustGroup.add(dust);
    scene.add(dustGroup);

    // Pointer-tracking accent ring — the only "cursor response" element.
    const cursorGeometry = new THREE.RingGeometry(0.11, 0.13, 32);
    const cursorMaterial = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const cursorRing = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursorRing.visible = !mobile && !reduceMotion && effectsMode !== "low";
    scene.add(cursorRing);

    // Label elements — real DOM text kept in perfect sync with projected
    // node positions, so labels stay crisp regardless of pixel ratio.
    const labelEls = NODES.map((node) => {
      const el = document.createElement("span");
      el.textContent = node.label.toUpperCase();
      el.className = `node-label${node.primary ? "" : " node-label--secondary"}`;
      labelHost.appendChild(el);
      return el;
    });

    // Capabilities motifs — see CAPABILITIES above. Each is its own small
    // group (points + connecting edges + one label), hidden until the
    // Capabilities section is centered.
    const capabilityMotifs = CAPABILITIES.map((cap) => {
      const group = new THREE.Group();
      group.position.set(cap.x, CAPABILITY_Y, 0);
      graph.add(group);

      const points = cap.points.map((local) => {
        const material = new THREE.SpriteMaterial({ map: texture, color: DOT_BASE, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(local);
        sprite.scale.setScalar(0.22);
        group.add(sprite);
        return { material, sprite };
      });

      const edgePositions: number[] = [];
      cap.edges.forEach(([a, b]) => {
        const from = cap.points[a];
        const to = cap.points[b];
        edgePositions.push(from.x, from.y, from.z, to.x, to.y, to.z);
      });
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);

      const labelEl = document.createElement("span");
      labelEl.textContent = cap.label.toUpperCase();
      labelEl.className = "node-label node-label--secondary";
      labelHost.appendChild(labelEl);

      return { spec: cap, group, points, lineGeometry, lineMaterial, labelEl };
    });
    let capabilitiesBoost = 0;

    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const cursorGlowStyle = document.documentElement.style;
    const onPointerMove = (event: PointerEvent) => {
      targetPointer.set((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1));
      // Drives the CSS ambient glow (.three-stage::before/::after) — cheap,
      // no React re-render, sibling to the WebGL parallax below.
      cursorGlowStyle.setProperty("--cursor-x", `${((event.clientX / window.innerWidth) * 100).toFixed(1)}%`);
      cursorGlowStyle.setProperty("--cursor-y", `${((event.clientY / window.innerHeight) * 100).toFixed(1)}%`);
    };
    const intensityByMode = { low: 0.32, balanced: 0.7, immersive: 1 } as const;
    const frameIntervalByMode = { low: 1000 / 12, balanced: 1000 / 30, immersive: 1000 / 60 } as const;
    const qualityCapByMode = { low: 0.72, balanced: 0.9, immersive: 1 } as const;
    let intensity = intensityByMode[effectsMode];
    const onEffects = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: keyof typeof intensityByMode }>).detail?.mode || "balanced";
      effectsMode = mode;
      intensity = intensityByMode[mode];
      qualityScale = reduceMotion ? 0.62 : qualityCapByMode[mode];
      cursorRing.visible = !mobile && !reduceMotion && mode !== "low";
      canvas.dataset.frameRate = String(reduceMotion ? 4 : Math.round(1000 / frameIntervalByMode[mode]));
      resize();
    };
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(basePixelRatio * qualityScale);
      renderer.setSize(width, height, false);
    };
    const onVisibilityChange = () => {
      previous = performance.now();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      canvas.dataset.webgl = "recovering";
    };
    const onContextRestored = () => {
      contextLost = false;
      qualityScale = Math.min(qualityScale, 0.8);
      canvas.dataset.webgl = "ready";
      previous = performance.now();
      resize();
    };

    if (!mobile && !reduceMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("gopal-effects", onEffects);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    resize();
    canvas.dataset.frameRate = String(reduceMotion ? 4 : Math.round(1000 / frameIntervalByMode[effectsMode]));

    let animationFrame = 0;
    let previous = performance.now();
    let lastRendered = 0;
    let sampledFrames = 0;
    let sampledTime = 0;
    const projected = new THREE.Vector3();
    const pulseDummy = new THREE.Object3D();
    const groupBoost: Record<NodeGroup, number> = { retrieval: 0, agents: 0, infra: 0 };

    const animate = (now: number) => {
      animationFrame = requestAnimationFrame(animate);
      if (document.hidden || contextLost) return;
      const minimumFrameInterval = reduceMotion ? 250 : frameIntervalByMode[effectsMode];
      if (now - lastRendered < minimumFrameInterval - 1) return;
      lastRendered = now;
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      sampledFrames++;
      sampledTime += delta;
      if (effectsMode !== "immersive") {
        sampledFrames = 0;
        sampledTime = 0;
      }
      if (!reduceMotion && effectsMode === "immersive" && sampledTime >= 2.5) {
        const fps = sampledFrames / sampledTime;
        const nextQuality = fps < 43 ? Math.max(0.68, qualityScale - 0.12) : fps > 57 ? Math.min(1, qualityScale + 0.08) : qualityScale;
        if (Math.abs(nextQuality - qualityScale) > 0.01) {
          qualityScale = nextQuality;
          renderer.setPixelRatio(basePixelRatio * qualityScale);
          renderer.setSize(window.innerWidth, window.innerHeight, false);
        }
        sampledFrames = 0;
        sampledTime = 0;
      }

      pointer.lerp(targetPointer, 1 - Math.pow(0.001, delta));
      const time = now / 1000;
      const domain = activeRef.current;
      const closing = domain === "close";
      const emphasis = domainEmphasis[domain];
      // In the hero ("identity") the whole network reads as the scene's
      // primary visual — much brighter than the ambient glow it settles
      // into once section-specific emphasis takes over.
      const ambient = closing ? 0 : domain === "identity" ? 0.6 : 0.32;

      for (const group of GROUPS) {
        const target = closing ? 0 : ambient + (emphasis[group] ?? 0) * (1 - ambient);
        groupBoost[group] = THREE.MathUtils.lerp(groupBoost[group], target, reduceMotion ? 1 : 1 - Math.pow(0.0006, delta));
      }

      dotState.forEach((dot, i) => {
        const boost = groupBoost[dot.node.group];
        dot.material.opacity = reduceMotion ? boost : THREE.MathUtils.lerp(dot.material.opacity, boost, 1 - Math.pow(0.0008, delta));
        const pulse = 1 + Math.sin(time * 1.4 + dot.seed) * 0.08 * intensity;
        dot.sprite.scale.setScalar((dot.node.primary ? 0.56 : 0.36) * pulse * (0.7 + boost * 0.5));
        if (!reduceMotion) {
          dot.sprite.position.y = dot.node.position.y + Math.sin(time * 0.6 + dot.seed) * 0.05;
        }

        const el = labelEls[i];
        projected.copy(dot.sprite.position).project(camera);
        const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
        const behind = projected.z > 1;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = behind ? "0" : String(0.25 + boost * 0.65 * intensity);
      });

      const capabilitiesTarget = closing || domain !== "capabilities" ? 0 : 1;
      capabilitiesBoost = reduceMotion ? capabilitiesTarget : THREE.MathUtils.lerp(capabilitiesBoost, capabilitiesTarget, 1 - Math.pow(0.0006, delta));

      capabilityMotifs.forEach((motif) => {
        if (motif.spec.motion === "orbit") {
          motif.group.rotation.z = reduceMotion ? 0 : time * 0.4;
        }
        motif.points.forEach((point, idx) => {
          let localOpacity = capabilitiesBoost;
          if (motif.spec.motion === "chase") {
            const wave = Math.max(0, Math.sin(time * 1.8 - idx * 0.85));
            localOpacity = capabilitiesBoost * (0.35 + 0.65 * wave);
          }
          point.material.opacity = localOpacity * intensity;
        });
        motif.lineMaterial.opacity = capabilitiesBoost * intensity * 0.6;

        projected.copy(motif.group.position).project(camera);
        const cx = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const cy = (-projected.y * 0.5 + 0.5) * window.innerHeight + 34;
        const behind = projected.z > 1;
        motif.labelEl.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
        motif.labelEl.style.opacity = behind ? "0" : String(capabilitiesBoost * 0.9 * intensity);
      });

      edgeState.forEach((edge) => {
        const target = closing ? 0 : ambient * 0.5 + (emphasis[edge.group] ?? 0) * 0.5;
        edge.boost = reduceMotion ? target : THREE.MathUtils.lerp(edge.boost, target, 1 - Math.pow(0.0008, delta));
        edge.material.opacity = edge.boost * intensity;
        edge.pulseMaterial.opacity = reduceMotion ? 0 : edge.boost * intensity * 1.4;
        if (!reduceMotion && edge.boost > 0.05) {
          const count = edge.pulses.count;
          for (let i = 0; i < count; i++) {
            const pairIndex = i % edge.pairs.length;
            const [a, b] = edge.pairs[pairIndex];
            const from = NODES.find((n) => n.id === a)!.position;
            const to = NODES.find((n) => n.id === b)!.position;
            const progress = (time * 0.35 + i / count) % 1;
            pulseDummy.position.lerpVectors(from, to, progress);
            pulseDummy.scale.setScalar(0.6 + Math.sin(progress * Math.PI) * 0.9);
            pulseDummy.updateMatrix();
            edge.pulses.setMatrixAt(i, pulseDummy.matrix);
          }
          edge.pulses.instanceMatrix.needsUpdate = true;
        }
      });

      // A slow independent twinkle on top of the domain-driven target keeps
      // the field reading as alive even when nothing else is changing.
      const dustTwinkle = reduceMotion ? 1 : 0.85 + Math.sin(time * 0.35) * 0.15;
      dustMaterial.opacity = closing ? 0 : 0.35 * intensity * dustTwinkle;

      graph.rotation.y = reduceMotion ? 0.05 : Math.sin(time * 0.05) * 0.13 + pointer.x * 0.15;
      graph.rotation.x = reduceMotion ? 0 : pointer.y * 0.09;
      graph.position.x = THREE.MathUtils.lerp(graph.position.x, pointer.x * 0.55, 0.04);
      graph.position.y = THREE.MathUtils.lerp(graph.position.y, pointer.y * 0.32, 0.04);

      // Dust drifts on its own slower rotation and a weaker, lagged pointer
      // response than the graph — the parallax gap between the two is what
      // reads as depth rather than one flat plane of motion.
      dustGroup.rotation.y = reduceMotion ? 0 : Math.sin(time * 0.025) * 0.2 + pointer.x * 0.06;
      dustGroup.rotation.x = reduceMotion ? 0 : Math.cos(time * 0.02) * 0.1 + pointer.y * 0.03;
      dustGroup.position.x = THREE.MathUtils.lerp(dustGroup.position.x, pointer.x * 0.15, 0.015);
      dustGroup.position.y = THREE.MathUtils.lerp(dustGroup.position.y, pointer.y * 0.1, 0.015);

      // SceneProvider remains the director: each editorial chapter shifts the
      // same knowledge graph and camera toward the corresponding subsystem.
      const cameraTarget: Record<SceneDomain, { x: number; y: number; z: number; look: number }> = {
        identity: { x: -1.2, y: .1, z: 11.5, look: 1.2 },
        retrieval: { x: -2.4, y: .45, z: 8.2, look: -1.4 },
        agents: { x: 3.1, y: -.15, z: 7.2, look: 4.7 },
        infra: { x: 5.2, y: -.8, z: 8.5, look: 6.7 },
        capabilities: { x: 0, y: 2.15, z: 12.5, look: 0 },
        close: { x: 7.8, y: -1.4, z: 12.5, look: 8.1 },
      };
      const destination = cameraTarget[domain];
      const cameraEase = reduceMotion ? 1 : 1 - Math.pow(0.002, delta);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, destination.z, cameraEase);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, destination.x + pointer.x * .5 * intensity, cameraEase);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, destination.y + pointer.y * .28 * intensity, cameraEase);
      camera.lookAt(destination.look, 0, 0);

      projected.set(pointer.x * 5.2, pointer.y * 3, 1.2);
      cursorRing.position.copy(projected);
      cursorRing.scale.setScalar(1 + Math.sin(time * 3.4) * 0.1);
      cursorMaterial.opacity = closing ? 0 : 0.42 * intensity;

      renderer.render(scene, camera);
    };
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (!mobile && !reduceMotion) window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("gopal-effects", onEffects);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      texture.dispose();
      dotState.forEach((dot) => dot.material.dispose());
      edgeState.forEach((edge) => {
        edge.geometry.dispose();
        edge.material.dispose();
        edge.pulseGeometry.dispose();
        edge.pulseMaterial.dispose();
      });
      dustGeometry.dispose();
      dustMaterial.dispose();
      cursorGeometry.dispose();
      cursorMaterial.dispose();
      labelEls.forEach((el) => el.remove());
      capabilityMotifs.forEach((motif) => {
        motif.points.forEach((point) => point.material.dispose());
        motif.lineGeometry.dispose();
        motif.lineMaterial.dispose();
        motif.labelEl.remove();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div className="three-stage" aria-hidden="true">
      <canvas ref={canvasRef} id="webgl-canvas" />
      <div ref={labelHostRef} className="node-label-host" />
    </div>
  );
}
