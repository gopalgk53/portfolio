"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { getAudioContext, isSoundEnabled, playTone, setSoundEnabled, startAmbient } from "../lib/sound";

export function SoundToggle({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const on = isSoundEnabled();
    setEnabled(on);
    // Returning visitor with sound already on: resume the ambient pad.
    // AudioContext stays suspended until a real gesture happens anywhere
    // on the page, so this quietly picks up after the first click/tap.
    if (on) {
      startAmbient();
      const resume = () => getAudioContext()?.resume().catch(() => {});
      window.addEventListener("pointerdown", resume, { once: true });
    }
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playTone();
  }

  return (
    <button onClick={toggle} aria-pressed={enabled} aria-label={enabled ? "Mute interface sound" : "Enable interface sound"} className={`flex items-center gap-1.5 ${className}`}>
      {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden font-mono text-[10px] uppercase tracking-[.1em] sm:inline">Sound</span>
    </button>
  );
}
