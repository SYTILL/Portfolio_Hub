import { storage } from './lib/storage';

// Every number the tuning panel can change. Times and speeds are given at animation speed 1:
// real time = value / speed, real rate = value * speed.
export const DEFAULTS = {
  speed: 0.5,
  // entry sequence (seconds)
  core: 0.15, ring1: 0.15, ringGap: 0.15, ringDur: 0.85, panels: 1.5, panelStep: 0.15, crumb: 1.6, stars: 0.3, step: 0.08, rise: 0.25, hint: 1.7,
  // armillary rings
  ringAlpha: 1.3, ringSpin: 1,
  // stars, lines, labels
  starSize: 0.8, twinkle: 1, lineDraw: 4, lineScale: 0.5, lineHome: 0.4, lineFocus: 0.4, nameDelay: 0.5, labelDelay: 0.3,
  // meteors
  meteorFirst: 5, meteorEveryMin: 2, meteorEveryMax: 6, meteorSpeedMin: 190, meteorSpeedMax: 475, meteorLenMin: 50, meteorLenMax: 170, meteorWidthMin: 1, meteorWidthMax: 2.2,
  // camera
  camHome: 100, camFocus: 40, camSelect: 30, autoRotate: 0.03, camEase: 1, introFrom: 260, introDelay: 0, introDur: 1.6,
  // panel background
  gridAlpha: 0.06, panelStarAlpha: 1, panelStarDensity: 1,
};
export type ConfigKey = keyof typeof DEFAULTS;

// The tuning panel shows in `npm run dev`, or on the live site with ?tune in the URL.
export const TUNER_ON = import.meta.env.DEV || new URLSearchParams(location.search).has('tune');
export const TUNE_KEY = 'cs-atlas-tune-v1';

export const CFG: Record<ConfigKey, number> = { ...DEFAULTS };
if (TUNER_ON) {
  const saved = storage.get<Partial<Record<ConfigKey, number>>>(TUNE_KEY);
  if (saved) {
    for (const k of Object.keys(DEFAULTS) as ConfigKey[]) {
      const v = saved[k];
      if (typeof v === 'number' && Number.isFinite(v)) CFG[k] = v;
    }
  }
}

export const MS = (ms: number) => ms / CFG.speed;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Entry sequence timing, read live from CFG.
export const T = {
  get core() { return CFG.core; },
  get rings() { return [0, 1, 2].map(i => CFG.ring1 + i * CFG.ringGap); },
  get ringDur() { return CFG.ringDur; },
  get panels() { return CFG.panels; },
  get panelStep() { return CFG.panelStep; },
  get crumb() { return CFG.crumb; },
  get stars() { return CFG.stars; },
  get step() { return CFG.step; },
  get rise() { return CFG.rise; },
  get hint() { return CFG.hint; },
  get meteor() { return CFG.meteorFirst; },
};

// Constellation lines are drawn at lineDraw segments per second for a 3-segment constellation.
// lineScale bends that by size: 0 = same speed for all, 1 = every constellation finishes in the same time.
const LINE_REF = 3;
export const lineRate = (n: number) => CFG.lineDraw * Math.pow(Math.max(1, n) / LINE_REF, CFG.lineScale);

// Tuning changes that aren't read every frame are pushed through this bus.
const bus = new EventTarget();
export const retune = (key?: ConfigKey) => bus.dispatchEvent(new CustomEvent('retune', { detail: key }));
export const onRetune = (fn: (key?: ConfigKey) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<ConfigKey | undefined>).detail);
  bus.addEventListener('retune', handler);
  return () => bus.removeEventListener('retune', handler);
};
