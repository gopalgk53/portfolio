"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chapterSpacing, storyScrollState } from "./story-state";

const ACCENT = new THREE.Color("#d9ff43");
const DOT_COLOR = new THREE.Color("#d7d8dc");

const NODE_COUNT = 170;
const CONNECT_DISTANCE = 1.15;
const MAX_CONNECTIONS = NODE_COUNT * 4;

/**
 * Chapter 02 — Machine Learning: a spatial scatter of floating data nodes
 * whose nearest neighbors are connected live, each frame, by measuring
 * actual distance — a pattern emerging from the data rather than an
 * authored shape.
 */
export function ChapterMl({ index }: { index: number }) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const basePositions = useMemo(() => {
    const positions = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, []);

  const drift = useMemo(() => {
    const seeds = new Float32Array(NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) seeds[i] = Math.random() * Math.PI * 2;
    return seeds;
  }, []);

  const livePositions = useMemo(() => basePositions.slice(), [basePositions]);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(livePositions, 3));
    return geometry;
  }, [livePositions]);

  const pointsMaterial = useMemo(
    () => new THREE.PointsMaterial({ color: DOT_COLOR, size: 0.06, transparent: true, opacity: 0, sizeAttenuation: true, depthWrite: false }),
    [],
  );

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_CONNECTIONS * 2 * 3), 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);

  const lineMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );

  useEffect(
    () => () => {
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    },
    [pointsGeometry, pointsMaterial, lineGeometry, lineMaterial],
  );

  const frameCounter = useRef(0);

  useFrame((state) => {
    const spacing = chapterSpacing(viewport.height);
    const y = -index * spacing;
    if (groupRef.current) groupRef.current.position.y = y;

    const focus = storyScrollState.chapterFocus[index] ?? 0;
    pointsMaterial.opacity = focus * 0.9;
    lineMaterial.opacity = focus * 0.55;
    if (focus < 0.02) return;

    const time = state.clock.elapsedTime;
    const positionAttr = pointsGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < NODE_COUNT; i++) {
      livePositions[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(time * 0.3 + drift[i]) * 0.12;
      livePositions[i * 3] = basePositions[i * 3] + Math.cos(time * 0.22 + drift[i]) * 0.08;
    }
    positionAttr.needsUpdate = true;

    // Recomputing the full neighbor graph every frame is unnecessary —
    // node drift is slow, so every third frame keeps the connections
    // reading as live without paying an O(n^2) cost 60 times a second.
    frameCounter.current += 1;
    if (frameCounter.current % 3 !== 0) return;

    const linePositions = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    let edgeCount = 0;
    for (let i = 0; i < NODE_COUNT && edgeCount < MAX_CONNECTIONS; i++) {
      const ax = livePositions[i * 3];
      const ay = livePositions[i * 3 + 1];
      const az = livePositions[i * 3 + 2];
      for (let j = i + 1; j < NODE_COUNT && edgeCount < MAX_CONNECTIONS; j++) {
        const bx = livePositions[j * 3];
        const by = livePositions[j * 3 + 1];
        const bz = livePositions[j * 3 + 2];
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < CONNECT_DISTANCE * CONNECT_DISTANCE) {
          const base = edgeCount * 6;
          linePositions.array[base] = ax;
          linePositions.array[base + 1] = ay;
          linePositions.array[base + 2] = az;
          linePositions.array[base + 3] = bx;
          linePositions.array[base + 4] = by;
          linePositions.array[base + 5] = bz;
          edgeCount++;
        }
      }
    }
    lineGeometry.setDrawRange(0, edgeCount * 2);
    linePositions.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={pointsGeometry} material={pointsMaterial} />
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
    </group>
  );
}
