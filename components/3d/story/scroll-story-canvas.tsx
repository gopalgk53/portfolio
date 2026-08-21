"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraRig } from "./camera-rig";
import { ChapterWorkflow } from "./chapter-workflow";
import { ChapterMl } from "./chapter-ml";
import { ChapterDeepLearning } from "./chapter-deep-learning";
import { ChapterGenerative } from "./chapter-generative";
import { ChapterAgentic } from "./chapter-agentic";
import { storyScrollState } from "./story-state";

const CHAPTER_COMPONENTS = [ChapterWorkflow, ChapterMl, ChapterDeepLearning, ChapterGenerative, ChapterAgentic];

/**
 * Scales the whole chapter group down on narrow viewports so nothing clips
 * off-frame on a phone. Reads the R3F viewport (world units, already
 * accounting for camera FOV and distance) rather than window.innerWidth —
 * the two do not move together as the camera drifts down the rail.
 */
function ResponsiveChapters() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useEffect(() => {
    if (!groupRef.current) return;
    const scale = THREE.MathUtils.clamp(viewport.width / 9, 0.5, 1);
    groupRef.current.scale.setScalar(scale);
  }, [viewport.width]);

  return (
    <group ref={groupRef}>
      {CHAPTER_COMPONENTS.map((ChapterComponent, i) => (
        <ChapterComponent key={i} index={i} />
      ))}
    </group>
  );
}

function SceneLights() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      <ambientLight intensity={0.35} color="#e8e6dd" />
      <directionalLight
        ref={lightRef}
        position={[4, 6, 5]}
        intensity={0.9}
        color="#f5f3ea"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0006}
      />
      <pointLight name="story-follow-light" position={[0, 0, 2]} intensity={0.6} distance={8} color="#d9ff43" />
    </>
  );
}

function usePointerTracking() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion || isCoarsePointer) return;

    const onPointerMove = (event: PointerEvent) => {
      storyScrollState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      storyScrollState.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);
}

export function ScrollStoryCanvas() {
  usePointerTracking();

  const dpr = useMemo<[number, number]>(() => [1, 1.6], []);

  return (
    <div className="story-stage" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 50, near: 0.1, far: 60, position: [0, 0, 6] }}
        shadows
      >
        <color attach="background" args={["#080909"]} />
        <fog attach="fog" args={["#080909", 8, 22]} />
        <Suspense fallback={null}>
          <SceneLights />
          <ResponsiveChapters />
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
