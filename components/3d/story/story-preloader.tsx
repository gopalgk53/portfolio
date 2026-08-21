"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

const MINIMUM_VISIBLE_MS = 900;

/**
 * Full-screen preloader for the scroll-story experience. useProgress()
 * tracks THREE.DefaultLoadingManager, so it reflects real asset loads if
 * any chapter ever starts using textures/GLTFs — today's chapters are pure
 * procedural geometry, so it typically reaches 100 almost immediately; the
 * minimum-visible timer below keeps that from reading as a flash of
 * unstyled content and gives the counter something to count up through.
 */
export function StoryPreloader() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  useEffect(() => {
    // Procedural chapters do not register assets with LoadingManager, so
    // Drei can correctly report an idle loader with progress still at 0.
    // Treat that state as ready instead of leaving the cover at 000%.
    const target = active ? Math.round(progress) : 100;
    setDisplayProgress((current) => Math.max(current, target));
  }, [active, progress]);

  useEffect(() => {
    if (active || displayProgress < 100) return;
    const elapsed = performance.now() - mountedAt.current;
    const remaining = Math.max(MINIMUM_VISIBLE_MS - elapsed, 0);
    const timer = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timer);
  }, [active, displayProgress]);

  return (
    <div className={`story-preloader${visible ? "" : " story-preloader--hidden"}`} aria-hidden={!visible}>
      <div className="story-preloader-inner">
        <span className="story-preloader-label font-mono">INITIALIZING SCROLL SEQUENCE</span>
        <span className="story-preloader-count font-mono">{String(displayProgress).padStart(3, "0")}%</span>
        <div className="story-preloader-bar">
          <div className="story-preloader-bar-fill" style={{ width: `${displayProgress}%` }} />
        </div>
      </div>
    </div>
  );
}
