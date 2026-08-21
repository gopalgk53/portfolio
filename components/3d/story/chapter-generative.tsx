"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chapterSpacing, storyScrollState } from "./story-state";

// Zero-dependency noise: three cross-modulated sine/cosine waves sampled at
// different frequencies and phases per axis. Not Perlin/simplex-accurate,
// but it is cheap, has no seams, and is entirely self-contained in the
// shader — no noise-texture upload, no external noise library.
const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uChaos;
  varying float vNoise;

  float hash(vec3 p) {
    return sin(p.x * 3.1 + uTime * 0.6) * cos(p.y * 2.7 - uTime * 0.45) * sin(p.z * 3.4 + uTime * 0.8);
  }

  void main() {
    vec3 pos = position;
    float n = hash(pos * 1.6);
    vNoise = n;
    pos += normal * n * uChaos * 0.55;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vNoise;

  void main() {
    float glow = 0.65 + vNoise * 0.35;
    gl_FragColor = vec4(uColor * glow, uOpacity);
  }
`;

/**
 * Chapter 04 — Generative AI: a wireframe sphere whose vertices are
 * displaced by a procedural noise field. Far from centered, the field runs
 * hot (uChaos near 1) and the mesh reads as churning latent noise; as the
 * chapter comes into focus, uChaos eases to 0 and it resolves into a crisp
 * geometric sphere — chaos synthesizing into a defined output.
 */
export function ChapterGenerative({ index }: { index: number }) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.7, 5), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uChaos: { value: 1 },
          uColor: { value: new THREE.Color("#d9ff43") },
          uOpacity: { value: 0 },
        },
        wireframe: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const spacing = chapterSpacing(viewport.height);
    const y = -index * spacing;
    if (groupRef.current) groupRef.current.position.y = y;

    const focus = storyScrollState.chapterFocus[index] ?? 0;
    material.uniforms.uOpacity.value = focus * 0.85;
    material.uniforms.uChaos.value = THREE.MathUtils.lerp(material.uniforms.uChaos.value, 1 - focus, 0.04);
    material.uniforms.uTime.value = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  );
}
