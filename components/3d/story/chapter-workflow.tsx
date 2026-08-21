"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chapterSpacing, storyScrollState } from "./story-state";

const ACCENT = new THREE.Color("#d9ff43");
const LINE_COLOR = new THREE.Color("#3a3d38");

interface Packet {
  lane: number;
  axis: "row" | "column";
  speed: number;
  offset: number;
}

/**
 * Chapter 01 — The AI Workflow: a structured grid of vector lines with
 * glowing data-packet blocks streaming across it, evoking a pipeline
 * moving unstructured input toward structured output.
 */
export function ChapterWorkflow({ index }: { index: number }) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const packetsRef = useRef<THREE.InstancedMesh>(null);

  const columns = 14;
  const rows = 8;
  const width = 9;
  const height = 5.4;

  const gridGeometry = useMemo(() => {
    const positions: number[] = [];
    for (let c = 0; c <= columns; c++) {
      const x = (c / columns - 0.5) * width;
      positions.push(x, -height / 2, 0, x, height / 2, 0);
    }
    for (let r = 0; r <= rows; r++) {
      const y = (r / rows - 0.5) * height;
      positions.push(-width / 2, y, 0, width / 2, y, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [columns, rows, width, height]);

  const gridMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: LINE_COLOR, transparent: true, opacity: 0, depthWrite: false }),
    [],
  );

  const packetGeometry = useMemo(() => new THREE.BoxGeometry(0.09, 0.09, 0.09), []);
  const packetMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );

  const packets = useMemo<Packet[]>(() => {
    const count = 46;
    return Array.from({ length: count }, () => ({
      lane: Math.floor(Math.random() * (Math.random() > 0.5 ? columns : rows)),
      axis: Math.random() > 0.5 ? "row" : "column",
      speed: 0.18 + Math.random() * 0.32,
      offset: Math.random(),
    }));
  }, [columns, rows]);

  useEffect(
    () => () => {
      gridGeometry.dispose();
      gridMaterial.dispose();
      packetGeometry.dispose();
      packetMaterial.dispose();
    },
    [gridGeometry, gridMaterial, packetGeometry, packetMaterial],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const spacing = chapterSpacing(viewport.height);
    const y = -index * spacing;
    if (groupRef.current) groupRef.current.position.y = y;

    const focus = storyScrollState.chapterFocus[index] ?? 0;
    gridMaterial.opacity = focus * 0.5;
    packetMaterial.opacity = focus * 0.9;

    const mesh = packetsRef.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;
    packets.forEach((packet, i) => {
      const progress = (time * packet.speed + packet.offset) % 1;
      if (packet.axis === "row") {
        const rowY = (packet.lane % (rows + 1)) / rows - 0.5;
        dummy.position.set((progress - 0.5) * width, rowY * height, 0.02);
      } else {
        const colX = (packet.lane % (columns + 1)) / columns - 0.5;
        dummy.position.set(colX * width, (progress - 0.5) * height, 0.02);
      }
      const pulse = 0.6 + Math.sin(progress * Math.PI) * 0.7;
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={gridGeometry} material={gridMaterial} />
      <instancedMesh ref={packetsRef} args={[packetGeometry, packetMaterial, packets.length]} />
    </group>
  );
}
