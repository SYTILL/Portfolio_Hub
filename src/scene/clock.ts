import { useFrame } from '@react-three/fiber';
import { CFG } from '../config';
import { on } from '../lib/events';

// One scaled clock for the whole scene: every animation reads clock.now / clock.dt,
// so the global speed setting slows or speeds up everything at once.
export const clock = { t0: 0, now: 0, dt: 0 };

// Registered at import time, before any other replay listener, so t0 is already reset when they run.
on('replay', () => { clock.t0 = clock.now; });

export function ClockDriver() {
  useFrame((_, delta) => {
    clock.dt = Math.min(delta, 0.05) * CFG.speed;
    clock.now += clock.dt;
  }, -100);
  return null;
}

/** Seconds since the entry sequence (re)started, in scaled time. */
export const since = () => clock.now - clock.t0;
