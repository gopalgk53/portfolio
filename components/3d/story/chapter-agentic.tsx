"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chapterSpacing, storyScrollState } from "./story-state";

const ACCENT = new THREE.Color("#d9ff43");
const AGENT_COLOR = new THREE.Color("#f0eee7");

const AGENT_COUNT = 26;
const NEIGHBOR_DISTANCE = 1.4;

interface Agent {
  radius: number;
  theta: number;
  phi: number;
  thetaVelocity: number;
  phiVelocity: number;
}

function glowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Chapter 05 — Agentic AI: an autonomous swarm orbiting a central glowing
 * goal node. Each agent's orbital angles take an independent random walk
 * every frame (not a fixed formula), and nearby agents draw live
 * connections to each other — self-directed, loosely coordinated motion
 * around one shared objective.
 */
export function ChapterAgentic({ index }: { index: number }) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const agentsRef = useRef<THREE.InstancedMesh>(null);
  const goalRef = useRef<THREE.Sprite>(null);

  const agents = useMemo<Agent[]>(
    () =>
      Array.from({ length: AGENT_COUNT }, () => ({
        radius: 1.3 + Math.random() * 1.1,
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        thetaVelocity: (Math.random() - 0.5) * 0.4,
        phiVelocity: (Math.random() - 0.5) * 0.25,
      })),
    [],
  );

  const agentPositions = useMemo(() => new Float32Array(AGENT_COUNT * 3), []);

  const agentGeometry = useMemo(() => new THREE.SphereGeometry(0.045, 10, 10), []);
  const agentMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: AGENT_COLOR, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );

  const linkGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(AGENT_COUNT * AGENT_COUNT * 2 * 3), 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);
  const linkMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );

  const goalTexture = useMemo(() => (typeof document !== "undefined" ? glowTexture() : null), []);
  const goalMaterial = useMemo(
    () => new THREE.SpriteMaterial({ map: goalTexture, color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [goalTexture],
  );

  useEffect(
    () => () => {
      agentGeometry.dispose();
      agentMaterial.dispose();
      linkGeometry.dispose();
      linkMaterial.dispose();
      goalMaterial.dispose();
      goalTexture?.dispose();
    },
    [agentGeometry, agentMaterial, linkGeometry, linkMaterial, goalMaterial, goalTexture],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const spacing = chapterSpacing(viewport.height);
    const y = -index * spacing;
    if (groupRef.current) groupRef.current.position.y = y;

    const focus = storyScrollState.chapterFocus[index] ?? 0;
    agentMaterial.opacity = focus * 0.9;
    linkMaterial.opacity = focus * 0.4;
    goalMaterial.opacity = focus * 0.9;
    if (goalRef.current) goalRef.current.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.06);
    if (focus < 0.02) return;

    const mesh = agentsRef.current;
    if (!mesh) return;
    agents.forEach((agent, i) => {
      // A bounded random walk on the orbital angles — each tick nudges
      // velocity by a small random delta and clamps it, so agents drift
      // and occasionally change direction instead of orbiting on rails.
      agent.thetaVelocity = THREE.MathUtils.clamp(agent.thetaVelocity + (Math.random() - 0.5) * 0.4 * delta, -0.6, 0.6);
      agent.phiVelocity = THREE.MathUtils.clamp(agent.phiVelocity + (Math.random() - 0.5) * 0.3 * delta, -0.4, 0.4);
      agent.theta += agent.thetaVelocity * delta;
      agent.phi = THREE.MathUtils.clamp(agent.phi + agent.phiVelocity * delta, 0.35, Math.PI - 0.35);

      const x = agent.radius * Math.sin(agent.phi) * Math.cos(agent.theta);
      const yPos = agent.radius * Math.cos(agent.phi);
      const z = agent.radius * Math.sin(agent.phi) * Math.sin(agent.theta);
      agentPositions[i * 3] = x;
      agentPositions[i * 3 + 1] = yPos;
      agentPositions[i * 3 + 2] = z;

      dummy.position.set(x, yPos, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    const linkPositions = linkGeometry.getAttribute("position") as THREE.BufferAttribute;
    let edgeCount = 0;
    const maxEdges = linkPositions.array.length / 6;
    for (let i = 0; i < AGENT_COUNT && edgeCount < maxEdges; i++) {
      const ax = agentPositions[i * 3];
      const ay = agentPositions[i * 3 + 1];
      const az = agentPositions[i * 3 + 2];
      for (let j = i + 1; j < AGENT_COUNT && edgeCount < maxEdges; j++) {
        const bx = agentPositions[j * 3];
        const by = agentPositions[j * 3 + 1];
        const bz = agentPositions[j * 3 + 2];
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        if (dx * dx + dy * dy + dz * dz < NEIGHBOR_DISTANCE * NEIGHBOR_DISTANCE) {
          const base = edgeCount * 6;
          linkPositions.array[base] = ax;
          linkPositions.array[base + 1] = ay;
          linkPositions.array[base + 2] = az;
          linkPositions.array[base + 3] = bx;
          linkPositions.array[base + 4] = by;
          linkPositions.array[base + 5] = bz;
          edgeCount++;
        }
      }
    }
    linkGeometry.setDrawRange(0, edgeCount * 2);
    linkPositions.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <sprite ref={goalRef} material={goalMaterial} scale={[0.5, 0.5, 0.5]} />
      <instancedMesh ref={agentsRef} args={[agentGeometry, agentMaterial, AGENT_COUNT]} />
      <lineSegments geometry={linkGeometry} material={linkMaterial} />
    </group>
  );
}
