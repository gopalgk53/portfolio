"use client";

// Procedural interface sound — everything here is synthesized with Web
// Audio oscillators, never an audio file, so there's no licensing question
// and nothing to load over the network. It plays only after the visitor
// explicitly turns it on from the nav toggle (see sound-toggle.tsx): a
// quiet ambient pad while it's on, plus a short musical "chord" — built
// from one shared, related scale so every transition sounds like it
// belongs to the same piece — each time the AI Knowledge Network's active
// scene changes while scrolling.

const KEY = "gopal-sound-enabled";

let ctx: AudioContext | null = null;
export function getAudioContext(): AudioContext | null {
  return getCtx();
}
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
  if (on) startAmbient();
  else stopAmbient();
}

// A short, soft confirmation blip — used only by the sound toggle itself.
export function playTone() {
  if (!isSoundEnabled()) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(460, now);
  osc.frequency.exponentialRampToValueAtTime(330, now + 0.1);
  gainNode.gain.setValueAtTime(0.07, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
  osc.onended = () => {
    osc.disconnect();
    gainNode.disconnect();
  };
}

// One shared scale, rooted around D, so every scene's chord is a related
// note rather than an arbitrary pitch — the point is that the sequence of
// transitions across a scroll session reads as one small, deliberate piece
// of music instead of a UI beep repeated on a loop.
const SCENE_ROOT: Record<string, number> = {
  identity: 146.83, // D3 — grounding, the personal sections
  retrieval: 220.0, // A3 — a fifth up, search/retrieval brightening
  agents: 261.63, // C4 — active, agentic work
  infra: 174.61, // F3 — stable, the engineering/stack sections
  close: 73.42, // D2 — root, an octave down, resolving at contact
};

export function playSceneChord(domain: string) {
  if (!isSoundEnabled()) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  const root = SCENE_ROOT[domain] ?? SCENE_ROOT.identity;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.05, now + 0.09);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
  master.connect(audioCtx.destination);

  // Root + a fifth above, softly detuned against each other, filtered warm.
  [root, root * 1.5].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    osc.type = i === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);
    osc.connect(filter);
    filter.connect(master);
    osc.start(now);
    osc.stop(now + 1.35);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
    };
  });
}

// A very quiet, slowly evolving background pad — two detuned low tones
// under a lowpass filter that breathes via a slow LFO. Fades in when sound
// is turned on and fades out (rather than cutting) when turned off.
let ambient: { master: GainNode; nodes: AudioNode[] } | null = null;

export function startAmbient() {
  if (!isSoundEnabled() || ambient) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  const now = audioCtx.currentTime;

  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.028, now + 1.6);
  master.connect(audioCtx.destination);

  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, now);
  filter.connect(master);

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.setValueAtTime(0.045, now);
  lfoGain.gain.setValueAtTime(140, now);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start(now);

  const root = SCENE_ROOT.identity / 2;
  const oscillators = [root, root * 1.003, root * 2].map((freq) => {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.connect(filter);
    osc.start(now);
    return osc;
  });

  ambient = { master, nodes: [filter, lfo, lfoGain, ...oscillators] };
}

export function stopAmbient() {
  if (!ambient) return;
  const audioCtx = getCtx();
  const { master, nodes } = ambient;
  ambient = null;
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.7);
  window.setTimeout(() => {
    nodes.forEach((node) => {
      if (node instanceof OscillatorNode) node.stop();
      node.disconnect();
    });
    master.disconnect();
  }, 800);
}
