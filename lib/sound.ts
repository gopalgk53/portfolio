"use client";

// Tiny procedural UI sound system — a handful of soft, synthesized tones
// (Web Audio oscillators, no audio files) for scene changes and the sound
// toggle itself. No ambient loop, no autoplay: sound only ever plays after
// the visitor explicitly turns it on, so it never fights browser autoplay
// policy or a recruiter's open office.

const KEY = "gopal-sound-enabled";

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "true";
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(KEY, String(on));
  window.dispatchEvent(new CustomEvent("gopal-sound", { detail: { enabled: on } }));
}

type ToneKind = "tick" | "toggle";

const tones: Record<ToneKind, { freq: number; duration: number; type: OscillatorType; gain: number }> = {
  tick: { freq: 640, duration: 0.07, type: "sine", gain: 0.045 },
  toggle: { freq: 460, duration: 0.1, type: "sine", gain: 0.07 },
};

export function playTone(kind: ToneKind) {
  if (!isSoundEnabled()) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  const { freq, duration, type, gain } = tones[kind];
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.72, 40), now + duration);
  gainNode.gain.setValueAtTime(gain, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gainNode.disconnect();
  };
}
