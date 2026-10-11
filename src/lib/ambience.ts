import { storage } from './storage';

// Background ambience, looped without a seam: two <audio> voices take turns, and each loop
// crossfades (equal power) into a fresh start of the track over the last XF seconds.
// Nothing downloads until the first start. Browsers only allow sound after a user gesture,
// so the first click or key press anywhere starts it, unless the visitor turned it off before.

const SRC = `${import.meta.env.BASE_URL}audio/space-ambience.mp3`;
const KEY = 'cs-ambience';
const XF = 4;
const FADE_IN = 5, FADE_OUT = 0.6;

interface Prefs { on: boolean; vol: number }
const saved = storage.get<Prefs>(KEY);
const prefs: Prefs = { on: saved?.on ?? true, vol: typeof saved?.vol === 'number' ? saved.vol : 0.25 };

export interface AmbienceState { playing: boolean; vol: number }
let snap: AmbienceState = { playing: false, vol: prefs.vol };
const subs = new Set<() => void>();
const emit = (patch: Partial<AmbienceState>) => { snap = { ...snap, ...patch }; subs.forEach(fn => fn()); };
export const subscribeAmbience = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };
export const getAmbience = () => snap;

type Voice = { el: HTMLAudioElement; g: GainNode };
let ctx: AudioContext | null = null, master: GainNode | null = null, voices: Voice[] = [], cur = 0, stopTimer = 0;

const N = 64;
const UP = new Float32Array(N).map((_, i) => Math.sin((i / (N - 1)) * Math.PI / 2));
const DOWN = new Float32Array(N).map((_, i) => Math.cos((i / (N - 1)) * Math.PI / 2));
const ramp = (p: AudioParam, curve: Float32Array, at: number, dur: number) => {
  p.cancelScheduledValues(at);
  p.setValueCurveAtTime(curve, at, Math.max(dur, 0.05));
};
const glide = (p: AudioParam, to: number, dur: number) => {
  const t = ctx!.currentTime;
  p.cancelScheduledValues(t);
  p.setValueAtTime(p.value, t);
  p.linearRampToValueAtTime(to, t + dur);
};

function setup() {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  voices = [0, 1].map(i => {
    const el = new Audio(SRC);
    el.preload = 'auto';
    const g = ctx!.createGain();
    g.gain.value = i === 0 ? 1 : 0;
    ctx!.createMediaElementSource(el).connect(g).connect(master!);
    el.addEventListener('timeupdate', () => {
      if (voices[cur] !== voices[i]) return;
      const left = el.duration - el.currentTime;
      if (!Number.isFinite(left) || left > XF) return;
      // Hand over to the other voice; the old one fades out and stops on its own at the end of the track.
      const next = voices[1 - i], t = ctx!.currentTime;
      next.el.currentTime = 0;
      next.el.play().catch(() => {});
      ramp(next.g.gain, UP, t, left);
      ramp(voices[i].g.gain, DOWN, t, left);
      cur = 1 - i;
    });
    return { el, g };
  });
}

function start() {
  if (snap.playing) return;
  if (!ctx) setup();
  clearTimeout(stopTimer);
  ctx!.resume().catch(() => {});
  // If it was stopped mid-crossfade, resume on the newer voice alone.
  const v = voices[cur], o = voices[1 - cur], t = ctx!.currentTime;
  o.el.pause();
  o.g.gain.cancelScheduledValues(t);
  o.g.gain.setValueAtTime(0, t);
  v.g.gain.cancelScheduledValues(t);
  v.g.gain.setValueAtTime(1, t);
  v.el.play().then(
    () => glide(master!.gain, snap.vol, FADE_IN),
    () => emit({ playing: false }),
  );
  emit({ playing: true });
}

function stop() {
  if (!snap.playing || !ctx) return;
  glide(master!.gain, 0, FADE_OUT);
  clearTimeout(stopTimer);
  stopTimer = window.setTimeout(() => {
    voices.forEach(v => v.el.pause());
    ctx!.suspend().catch(() => {});
  }, FADE_OUT * 1000 + 50);
  emit({ playing: false });
}

export function toggleAmbience() {
  if (snap.playing) stop();
  else start();
  prefs.on = snap.playing;
  storage.set(KEY, prefs);
}

export function setAmbienceVolume(vol: number) {
  prefs.vol = vol;
  storage.set(KEY, prefs);
  emit({ vol });
  if (snap.playing && master) glide(master.gain, vol, 0.08);
}

/** Start on the first user gesture (not one aimed at the player itself), if the visitor hasn't turned it off. */
export function armAmbience(player: () => Element | null) {
  if (!prefs.on) return () => {};
  const go = (e: Event) => {
    off();
    if (player()?.contains(e.target as Node)) return;
    start();
  };
  const off = () => {
    window.removeEventListener('pointerup', go, true);
    window.removeEventListener('keydown', go, true);
  };
  // pointerup, not pointerdown: a touch only counts as a gesture that may start audio once it ends.
  window.addEventListener('pointerup', go, true);
  window.addEventListener('keydown', go, true);
  return off;
}
