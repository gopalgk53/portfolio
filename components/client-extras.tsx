"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SiteEnhancements } from "./site-enhancements";
import { LenisProvider } from "./motion/lenis-provider";
import { CommandPalette } from "./command-palette";

const ThreeCanvas = dynamic(() => import("./3d/three-canvas").then(module => module.ThreeCanvas), { ssr: false });
const AIAssistant = dynamic(() => import("./ai-assistant").then(module => module.AIAssistant), { ssr: false });

export function ClientExtras() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const windowWithIdle = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (windowWithIdle.requestIdleCallback) {
      const id = windowWithIdle.requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => windowWithIdle.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 350);
    return () => window.clearTimeout(id);
  }, []);

  return <>{ready && <><ThreeCanvas/><AIAssistant/><LenisProvider/></>}<SiteEnhancements/><CommandPalette/></>;
}
