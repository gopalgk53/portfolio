"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CHAPTER_COUNT, chapterSpacing, storyScrollState } from "./story-state";

// Frame-rate independent exponential damping. THREE.MathUtils.damp already
// solves this for a single scalar (it is the closed-form of a critically
// damped spring, immune to variable frame delta) — this just applies it to
// every axis of a vector without allocating an intermediate object.
function dampVector3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, delta: number) {
  current.x = THREE.MathUtils.damp(current.x, target.x, lambda, delta);
  current.y = THREE.MathUtils.damp(current.y, target.y, lambda, delta);
  current.z = THREE.MathUtils.damp(current.z, target.z, lambda, delta);
}

/**
 * Drives the camera down the negative Y-axis through all five chapters as
 * the visitor scrolls, with a subtle cursor-driven parallax offset layered
 * on top. Position and look-at target both go through the same damped
 * interpolation so fast scrolling never produces a mechanical, stepped feel.
 */
export function CameraRig() {
  const { camera, viewport } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 6));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const parallax = useRef(new THREE.Vector2(0, 0));
  const previousProgress = useRef(0);

  useFrame((state, delta) => {
    const spacing = chapterSpacing(viewport.height);
    const railY = -storyScrollState.progress * (CHAPTER_COUNT - 1) * spacing;

    if (delta > 0) {
      const instantVelocity = Math.abs(storyScrollState.progress - previousProgress.current) / delta;
      previousProgress.current = storyScrollState.progress;
      storyScrollState.scrollVelocity = THREE.MathUtils.damp(storyScrollState.scrollVelocity, Math.min(instantVelocity * 6, 3), 5, delta);
    }

    // Single source of truth for "how centered is chapter N right now" —
    // every chapter mesh reads storyScrollState.chapterFocus[i] instead of
    // re-deriving this same distance-to-rail calculation independently.
    for (let i = 0; i < CHAPTER_COUNT; i++) {
      const chapterY = -i * spacing;
      const distance = Math.abs(chapterY - railY);
      storyScrollState.chapterFocus[i] = THREE.MathUtils.clamp(1 - distance / spacing, 0, 1);
    }

    // Smooth the raw pointer reading itself, then use it for a small
    // camera-space offset — a subtle drift, never a snap-to-cursor.
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, storyScrollState.pointer.x, 4, delta);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, storyScrollState.pointer.y, 4, delta);

    const parallaxRange = Math.min(viewport.width, viewport.height) * 0.05;
    targetPosition.current.set(parallax.current.x * parallaxRange, railY + parallax.current.y * parallaxRange * 0.6, 6.2);
    targetLookAt.current.set(parallax.current.x * parallaxRange * 0.4, railY - parallax.current.y * parallaxRange * 0.2, 0);

    dampVector3(camera.position, targetPosition.current, 3.2, delta);
    dampVector3(currentLookAt.current, targetLookAt.current, 3.2, delta);
    camera.lookAt(currentLookAt.current);

    // A point light riding just ahead of the camera keeps whichever chapter
    // is centered lit without every chapter needing its own light rig.
    const followLight = state.scene.getObjectByName("story-follow-light");
    if (followLight) {
      followLight.position.set(camera.position.x + parallax.current.x * 2, camera.position.y + 1.5, camera.position.z - 2);
    }
  });

  return null;
}
