"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chapterSpacing, storyScrollState } from "./story-state";

const ACCENT = new THREE.Color("#d9ff43");
const DOT_COLOR = new THREE.Color("#f0eee7");

const LAYER_SIZES = [5, 8, 8, 6, 3];
const LAYER_SPACING_X = 1.9;
const NODE_SPACING_Y = 0.62;

interface Synapse {
  from: THREE.Vector3;
  to: THREE.Vector3;
}

function buildLayerPositions(): THREE.Vector3[][] {
  const totalWidth = (LAYER_SIZES.length - 1) * LAYER_SPACING_X;
  return LAYER_SIZES.map((size, layerIndex) => {
    const x = layerIndex * LAYER_SPACING_X - totalWidth / 2;
    const totalHeight = (size - 1) * NODE_SPACING_Y;
    return Array.from({ length: size }, (_, nodeIndex) => new THREE.Vector3(x, nodeIndex * NODE_SPACING_Y - totalHeight / 2, 0));
  });
}

/**
 * Chapter 03 — Deep Learning: explicit input/hidden/output node columns
 * with pulses that travel down each synapse at a speed tied to how fast
 * the visitor is scrolling — a literal "the network thinks as you move".
 */
export function ChapterDeepLearning({ index }: { index: number }) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const pulsesRef = useRef<THREE.InstancedMesh>(null);

  const layers = useMemo(() => buildLayerPositions(), []);

  const nodePositions = useMemo(() => layers.flat(), [layers]);
  const nodeGeometry = useMemo(() => new THREE.SphereGeometry(0.05, 12, 12), []);
  const nodeMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: DOT_COLOR, transparent: true, opacity: 0 }),
    [],
  );

  const synapses = useMemo<Synapse[]>(() => {
    const edges: Synapse[] = [];
    for (let l = 0; l < layers.length - 1; l++) {
      for (const from of layers[l]) {
        for (const to of layers[l + 1]) {
          edges.push({ from, to });
        }
      }
    }
    return edges;
  }, [layers]);

  const synapseGeometry = useMemo(() => {
    const positions = new Float32Array(synapses.length * 2 * 3);
    synapses.forEach((edge, i) => {
      const base = i * 6;
      positions[base] = edge.from.x;
      positions[base + 1] = edge.from.y;
      positions[base + 2] = edge.from.z;
      positions[base + 3] = edge.to.x;
      positions[base + 4] = edge.to.y;
      positions[base + 5] = edge.to.z;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [synapses]);

  const synapseMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#565a4f", transparent: true, opacity: 0, depthWrite: false }),
    [],
  );

  const pulseCount = 90;
  const pulseGeometry = useMemo(() => new THREE.SphereGeometry(0.035, 8, 8), []);
  const pulseMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const pulseAssignments = useMemo(
    () =>
      Array.from({ length: pulseCount }, () => ({
        synapse: Math.floor(Math.random() * synapses.length),
        offset: Math.random(),
      })),
    [synapses.length],
  );

  useEffect(
    () => () => {
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      synapseGeometry.dispose();
      synapseMaterial.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
    },
    [nodeGeometry, nodeMaterial, synapseGeometry, synapseMaterial, pulseGeometry, pulseMaterial],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const spacing = chapterSpacing(viewport.height);
    const y = -index * spacing;
    if (groupRef.current) groupRef.current.position.y = y;

    const focus = storyScrollState.chapterFocus[index] ?? 0;
    nodeMaterial.opacity = focus * 0.85;
    synapseMaterial.opacity = focus * 0.3;
    pulseMaterial.opacity = focus * 0.95;
    if (focus < 0.02) return;

    const time = state.clock.elapsedTime;
    // Faster scrolling accelerates every pulse's travel down its synapse —
    // the "cognition speeds up as you move through it" beat from the brief.
    const speed = 0.4 + storyScrollState.scrollVelocity * 1.4;
    const mesh = pulsesRef.current;
    if (!mesh) return;
    pulseAssignments.forEach((pulse, i) => {
      const edge = synapses[pulse.synapse];
      const progress = (time * speed + pulse.offset) % 1;
      dummy.position.lerpVectors(edge.from, edge.to, progress);
      dummy.scale.setScalar(0.5 + Math.sin(progress * Math.PI) * 1.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={synapseGeometry} material={synapseMaterial} />
      {nodePositions.map((position, i) => (
        <mesh key={i} position={position} geometry={nodeGeometry} material={nodeMaterial} />
      ))}
      <instancedMesh ref={pulsesRef} args={[pulseGeometry, pulseMaterial, pulseCount]} />
    </group>
  );
}
