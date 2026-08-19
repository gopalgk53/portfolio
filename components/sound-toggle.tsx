"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { isSoundEnabled, playTone, setSoundEnabled } from "../lib/sound";

export function SoundToggle({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playTone("toggle");
  }

  return (
    <button onClick={toggle} aria-pressed={enabled} aria-label={enabled ? "Mute interface sound" : "Enable interface sound"} className={`flex items-center gap-1.5 ${className}`}>
      {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden font-mono text-[10px] uppercase tracking-[.1em] sm:inline">Sound</span>
    </button>
  );
}
