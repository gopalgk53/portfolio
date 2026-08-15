"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SceneDomain, useSceneDomain } from "./scene-state";

type Layer = {
  group: THREE.Group;
  materials: Array<THREE.Material & { opacity: number }>;
  update: (time: number, pointer: THREE.Vector2, burst: number) => void;
  dispose: () => void;
};

const palette: Record<SceneDomain, number> = {
  nlp: 0xa855f7,
  ml: 0x6366f1,
  dl: 0x6366f1,
  agents: 0x10b981,
};

const sceneFraming: Record<SceneDomain, { scale: number; depth: number; tilt: number }> = {
  nlp: { scale: 1, depth: 0, tilt: -0.035 },
  ml: { scale: .94, depth: -.35, tilt: 0.025 },
  dl: { scale: 1.08, depth: .15, tilt: 0 },
  agents: { scale: 1.02, depth: -.1, tilt: 0.04 },
};

const randomSphere = (radius: number) => {
  const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
  return v.multiplyScalar(radius * Math.cbrt(Math.random()));
};

function pointsLayer(domain: SceneDomain, count: number, layout: (i: number) => THREE.Vector3): Layer {
  const group = new THREE.Group();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) layout(i).toArray(positions, i * 3);
  const restPositions = positions.slice();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  const material = new THREE.PointsMaterial({
    color: palette[domain], size: domain === "dl" ? 0.13 : 0.055, sizeAttenuation: true,
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
  });
  const points = new THREE.Points(geometry, material);
  points.renderOrder = 2;
  group.add(points);
  return {
    group,
    materials: [material],
    update: (time, pointer, burst) => {
      const pointerX = pointer.x * 5.4;
      const pointerY = pointer.y * 3.2;
      for (let i = 0; i < count; i++) {
        const offset = i * 3;
        const restX = restPositions[offset];
        const restY = restPositions[offset + 1];
        const restZ = restPositions[offset + 2];
        const dx = pointerX - restX;
        const dy = pointerY - restY;
        const distanceSq = dx * dx + dy * dy;
        const influence = Math.max(0, 1 - distanceSq / 7.5);
        const stream = Math.sin(time * 1.8 + i * .071) * .055;
        const explosion = burst * (1 + (i % 11) / 22);
        positions[offset] = THREE.MathUtils.lerp(positions[offset], restX + dx * influence * .2 + restX * explosion, .075);
        positions[offset + 1] = THREE.MathUtils.lerp(positions[offset + 1], restY + dy * influence * .2 + stream * (1 + influence * 3) + restY * explosion, .075);
        positions[offset + 2] = THREE.MathUtils.lerp(positions[offset + 2], restZ + influence * .7 + restZ * explosion, .075);
      }
      geometry.attributes.position.needsUpdate = true;
      group.rotation.y = time * 0.025 + pointer.x * 0.16;
      group.rotation.x = Math.sin(time * 0.11) * 0.05 + pointer.y * 0.1;
      group.position.x = THREE.MathUtils.lerp(group.position.x, pointer.x * .28, .045);
      group.position.y = THREE.MathUtils.lerp(group.position.y, pointer.y * .18, .045);
    },
    dispose: () => { geometry.dispose(); material.dispose(); },
  };
}

function semanticLayer(count: number) {
  const centers = [new THREE.Vector3(-3, 1.6, 0), new THREE.Vector3(2.8, 1, -1), new THREE.Vector3(-1.2, -2, 1), new THREE.Vector3(3, -2, .5)];
  const layer = pointsLayer("nlp", count, i => randomSphere(1.6).add(centers[i % centers.length]));
  const ringGeometry = new THREE.RingGeometry(1.48, 1.5, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: palette.nlp, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true });
  const rings = centers.map((center, index) => {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(center);
    ring.rotation.set(index % 2 ? Math.PI / 2.7 : Math.PI / 2, index * .35, index * .5);
    ring.renderOrder = 1;
    layer.group.add(ring);
    return ring;
  });
  layer.materials.push(ringMaterial);
  const baseUpdate = layer.update;
  layer.update = (time, pointer, burst) => {
    baseUpdate(time * .72, pointer, burst);
    rings.forEach((ring, index) => {
      ring.rotation.z = time * (.08 + index * .018) * (index % 2 ? -1 : 1);
      ring.scale.setScalar(1 + Math.sin(time * .7 + index) * .08 + burst * .2);
    });
    layer.group.rotation.z = Math.sin(time * .12) * .08;
  };
  const baseDispose = layer.dispose;
  layer.dispose = () => { baseDispose(); ringGeometry.dispose(); ringMaterial.dispose(); };
  return layer;
}

function mlLayer(count: number): Layer {
  const layer = pointsLayer("ml", count, i => {
    const x = (Math.random() - .5) * 9;
    const z = (Math.random() - .5) * 5;
    const classOffset = i % 3 - 1;
    return new THREE.Vector3(x, Math.sin(x * .65) + classOffset * .9 + (Math.random() - .5) * .7, z);
  });
  const planePoints: THREE.Vector3[] = [];
  for (let z = -3; z <= 3; z += .75) planePoints.push(new THREE.Vector3(-5, -1.4, z), new THREE.Vector3(5, 1.4, z));
  for (let x = -5; x <= 5; x += 1) planePoints.push(new THREE.Vector3(x, x * .28 - 1.4, -3), new THREE.Vector3(x, x * .28 - 1.4, 3));
  const planeGeometry = new THREE.BufferGeometry().setFromPoints(planePoints);
  const planeMaterial = new THREE.LineBasicMaterial({ color: palette.ml, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true });
  const regression = new THREE.LineSegments(planeGeometry, planeMaterial);
  regression.renderOrder = 1;
  layer.group.add(regression);
  layer.materials.push(planeMaterial);
  const baseUpdate = layer.update;
  layer.update = (time, pointer, burst) => {
    baseUpdate(time * 1.25, pointer, burst * .45);
    regression.rotation.y = Math.sin(time * .32) * .22 + pointer.x * .08;
    regression.rotation.z = Math.sin(time * .22) * .06;
    regression.position.y = Math.sin(time * .85) * .16;
    layer.group.rotation.y = Math.sin(time * .18) * .12 + pointer.x * .1;
  };
  const baseDispose = layer.dispose;
  layer.dispose = () => { baseDispose(); planeGeometry.dispose(); planeMaterial.dispose(); };
  return layer;
}

function deepLearningLayer(): Layer {
  const sizes = [8, 12, 10, 5];
  const nodes: THREE.Vector3[][] = [];
  const flat: THREE.Vector3[] = [];
  sizes.forEach((size, layerIndex) => {
    const layer: THREE.Vector3[] = [];
    for (let i = 0; i < size; i++) {
      const position = new THREE.Vector3((layerIndex - 1.5) * 2.4, (i - (size - 1) / 2) * .55, Math.sin(layerIndex * 2 + i) * .55);
      layer.push(position); flat.push(position);
    }
    nodes.push(layer);
  });
  const result = pointsLayer("dl", flat.length, i => flat[i]);
  const connections: THREE.Vector3[] = [];
  for (let l = 0; l < nodes.length - 1; l++) for (const from of nodes[l]) for (const to of nodes[l + 1]) connections.push(from, to);
  const geometry = new THREE.BufferGeometry().setFromPoints(connections);
  const material = new THREE.LineBasicMaterial({ color: palette.dl, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true });
  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 1;
  result.group.add(lines);
  result.materials.push(material);
  const pulseCount = 28;
  const pulseGeometry = new THREE.SphereGeometry(.075, 6, 6);
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0x9fa8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true });
  const pulses = new THREE.InstancedMesh(pulseGeometry, pulseMaterial, pulseCount);
  const pulseDummy = new THREE.Object3D();
  pulses.renderOrder = 3;
  result.group.add(pulses);
  result.materials.push(pulseMaterial);
  const baseUpdate = result.update;
  result.update = (time, pointer, burst) => {
    baseUpdate(time * .28, pointer, burst * .4);
    material.opacity *= .78 + Math.sin(time * 3) * .16;
    for (let i = 0; i < pulseCount; i++) {
      const layerIndex = i % (nodes.length - 1);
      const fromLayer = nodes[layerIndex];
      const toLayer = nodes[layerIndex + 1];
      const from = fromLayer[i % fromLayer.length];
      const to = toLayer[(i * 3 + layerIndex) % toLayer.length];
      const progress = (time * .48 + i / pulseCount) % 1;
      pulseDummy.position.lerpVectors(from, to, progress);
      pulseDummy.scale.setScalar(.72 + Math.sin(progress * Math.PI) * .9 + burst);
      pulseDummy.updateMatrix();
      pulses.setMatrixAt(i, pulseDummy.matrix);
    }
    pulses.instanceMatrix.needsUpdate = true;
    result.group.rotation.y = Math.sin(time * .13) * .1 + pointer.x * .06;
  };
  const baseDispose = result.dispose;
  result.dispose = () => { baseDispose(); geometry.dispose(); material.dispose(); pulseGeometry.dispose(); pulseMaterial.dispose(); };
  return result;
}

function agentLayer(count: number): Layer {
  const group = new THREE.Group();
  const agents = Array.from({ length: count }, () => ({ position: randomSphere(4), velocity: randomSphere(.012), seed: Math.random() * 30 }));
  const sphere = new THREE.SphereGeometry(.09, 8, 8);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: palette.agents, transparent: true, opacity: 0, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending });
  const mesh = new THREE.InstancedMesh(sphere, nodeMaterial, count);
  mesh.renderOrder = 2;
  const maxConnections = Math.min(180, count * 3);
  const lineArray = new Float32Array(maxConnections * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(lineArray, 3).setUsage(THREE.DynamicDrawUsage));
  const lineMaterial = new THREE.LineBasicMaterial({ color: palette.agents, transparent: true, opacity: 0, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.renderOrder = 1;
  group.add(lines, mesh);
  const dummy = new THREE.Object3D();
  return {
    group, materials: [nodeMaterial, lineMaterial],
    update: (time, pointer, burst) => {
      let connection = 0;
      agents.forEach((agent, i) => {
        agent.position.add(agent.velocity);
        const cursorX = pointer.x * 4.2;
        const cursorY = pointer.y * 2.8;
        const cursorDistance = Math.hypot(cursorX - agent.position.x, cursorY - agent.position.y);
        const cursorInfluence = Math.max(0, 1 - cursorDistance / 3.2);
        agent.position.x += (cursorX - agent.position.x) * cursorInfluence * .007;
        agent.position.y += (cursorY - agent.position.y) * cursorInfluence * .007;
        agent.position.z += Math.sin(time * 1.4 + agent.seed) * .0025;
        agent.position.x += Math.sin(time + agent.seed) * .0015;
        if (agent.position.length() > 4.8) agent.velocity.multiplyScalar(-1);
        dummy.position.copy(agent.position).multiplyScalar(1 + burst * .9); dummy.scale.setScalar(.8 + Math.sin(time * 2 + agent.seed) * .22 + burst * .5); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < agents.length && connection < maxConnections; i++) for (let j = i + 1; j < agents.length && connection < maxConnections; j++) {
        if (agents[i].position.distanceToSquared(agents[j].position) < 1.5) {
          agents[i].position.toArray(lineArray, connection * 6); agents[j].position.toArray(lineArray, connection * 6 + 3); connection++;
        }
      }
      lineGeometry.setDrawRange(0, connection * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      group.rotation.y = time * .04 + pointer.x * .2;
      group.rotation.x = pointer.y * .08;
    },
    dispose: () => { sphere.dispose(); nodeMaterial.dispose(); lineGeometry.dispose(); lineMaterial.dispose(); },
  };
}

export function ThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeDomain = useSceneDomain();
  const activeRef = useRef(activeDomain);
  useEffect(() => { activeRef.current = activeDomain; }, [activeDomain]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
    const basePixelRatio = Math.min(window.devicePixelRatio, mobile ? 1 : 1.35);
    let qualityScale = 1;
    renderer.setPixelRatio(basePixelRatio);
    renderer.setClearColor(0x030307, 1);
    renderer.sortObjects = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 60);
    camera.position.set(0, 0, 10.5);
    const density = mobile ? .4 : 1;
    const layers: Record<SceneDomain, Layer> = {
      nlp: semanticLayer(Math.round(1800 * density)), ml: mlLayer(Math.round(1350 * density)), dl: deepLearningLayer(), agents: agentLayer(Math.round(80 * density)),
    };
    const sceneBlend: Record<SceneDomain, number> = { nlp: activeRef.current === "nlp" ? 1 : 0, ml: activeRef.current === "ml" ? 1 : 0, dl: activeRef.current === "dl" ? 1 : 0, agents: activeRef.current === "agents" ? 1 : 0 };
    Object.values(layers).forEach(layer => scene.add(layer.group));
    const cursorGeometry = new THREE.TorusGeometry(.19, .018, 8, 32);
    const cursorMaterial = new THREE.MeshBasicMaterial({ color: palette.nlp, transparent: true, opacity: .72, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const cursorCore = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursorCore.renderOrder = 10;
    scene.add(cursorCore);
    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const intensityByMode = { low: .28, balanced: .65, immersive: 1 } as const;
    let intensity = intensityByMode[(localStorage.getItem("gopal-effects-mode") as keyof typeof intensityByMode) || "balanced"] || intensityByMode.balanced;
    let burst = 0;
    const onPointerMove = (event: PointerEvent) => targetPointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
    const onPointerDown = () => { if (!reduceMotion) burst = 1; };
    const onEffects = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: keyof typeof intensityByMode }>).detail?.mode || "balanced";
      intensity = intensityByMode[mode];
    };
    const resize = () => {
      const width = window.innerWidth, height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(basePixelRatio * qualityScale);
      renderer.setSize(width, height, false);
    };
    const onVisibilityChange = () => { previous = performance.now(); };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("gopal-effects", onEffects);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();
    let animationFrame = 0;
    let previous = performance.now();
    let sampledFrames = 0;
    let sampledTime = 0;
    const animate = (now: number) => {
      animationFrame = requestAnimationFrame(animate);
      if (document.hidden) return;
      const delta = Math.min((now - previous) / 1000, .05); previous = now;
      sampledFrames++;
      sampledTime += delta;
      if (!reduceMotion && sampledTime >= 2.5) {
        const fps = sampledFrames / sampledTime;
        const nextQuality = fps < 43 ? Math.max(.68, qualityScale - .12) : fps > 57 ? Math.min(1, qualityScale + .08) : qualityScale;
        if (Math.abs(nextQuality - qualityScale) > .01) {
          qualityScale = nextQuality;
          renderer.setPixelRatio(basePixelRatio * qualityScale);
          renderer.setSize(window.innerWidth, window.innerHeight, false);
        }
        sampledFrames = 0;
        sampledTime = 0;
      }
      pointer.lerp(targetPointer, 1 - Math.pow(.001, delta));
      burst = THREE.MathUtils.lerp(burst, 0, 1 - Math.pow(.025, delta));
      const time = now / 1000;
      for (const [domain, layer] of Object.entries(layers) as [SceneDomain, Layer][]) {
        const target = domain === activeRef.current ? 1 : 0;
        const blendAlpha = reduceMotion ? 1 : 1 - Math.pow(.003, delta);
        sceneBlend[domain] = THREE.MathUtils.lerp(sceneBlend[domain], target, blendAlpha);
        const framing = sceneFraming[domain];
        const entrance = THREE.MathUtils.smootherstep(sceneBlend[domain], 0, 1);
        let opacity = 0;
        for (const material of layer.materials) {
          const desiredOpacity = target * intensity * (material instanceof THREE.LineBasicMaterial ? .25 : .94);
          material.opacity = reduceMotion ? desiredOpacity : THREE.MathUtils.lerp(material.opacity, desiredOpacity, 1 - Math.pow(.0005, delta));
          opacity = Math.max(opacity, material.opacity);
        }
        layer.group.visible = opacity > .004;
        if (layer.group.visible && !reduceMotion) layer.update(time, pointer, burst * intensity);
        const sceneScale = framing.scale * (.9 + entrance * .1);
        layer.group.scale.setScalar(sceneScale);
        layer.group.position.z = THREE.MathUtils.lerp(layer.group.position.z, framing.depth - (1 - entrance) * 1.4, blendAlpha);
        layer.group.rotation.z = THREE.MathUtils.lerp(layer.group.rotation.z, framing.tilt * entrance, blendAlpha * .45);
      }
      const scrollDepth = Math.min(window.scrollY / Math.max(window.innerHeight * 5, 1), 1);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * .7 * intensity, .045);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * .42 * intensity + scrollDepth * .35 * intensity, .045);
      const activeDepth = sceneFraming[activeRef.current].depth;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10.5 - activeDepth * .22 - scrollDepth * 1.7 * intensity - burst * .45 * intensity, reduceMotion ? 1 : .04);
      cursorCore.position.set(pointer.x * 5.15, pointer.y * 2.9, 1.2);
      cursorCore.scale.setScalar(1 + Math.sin(time * 4) * .12 + burst * 1.4);
      cursorCore.rotation.z = time * .7;
      cursorMaterial.color.lerp(new THREE.Color(palette[activeRef.current]), .08);
      cursorMaterial.opacity = intensity * (.56 + Math.sin(time * 4) * .14);
      renderer.render(scene, camera);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame); window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("gopal-effects", onEffects); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVisibilityChange);
      Object.values(layers).forEach(layer => { scene.remove(layer.group); layer.dispose(); }); scene.remove(cursorCore); cursorGeometry.dispose(); cursorMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss();
    };
  }, []);

  return <div className="three-stage" aria-hidden="true"><canvas ref={canvasRef} id="webgl-canvas" /></div>;
}
