import { MS } from '../config';
import { REDUCED_MOTION, storage } from './storage';

// Dark is the star chart; light is "edit mode": the same page with its colors inverted (CSS filter on .cs),
// plus XYZ axes and an XZ grid in the scene. Switching spreads out in a circle from the center of the map,
// using a view transition where the browser has one, and switches instantly where it doesn't.

export type Theme = 'dark' | 'light';
const KEY = 'cs-theme';
let theme: Theme = storage.get<Theme>(KEY) === 'light' ? 'light' : 'dark';
document.documentElement.dataset.theme = theme;

const subs = new Set<() => void>();
export const getTheme = () => theme;
export const subscribeTheme = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

const apply = (t: Theme) => {
  theme = t;
  document.documentElement.dataset.theme = t;
  storage.set(KEY, t);
  subs.forEach(fn => fn());
};

/** Switch theme; the new look grows as a circle from `origin` (viewport px). */
export function toggleTheme(origin: { x: number; y: number }) {
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  if (REDUCED_MOTION || !document.startViewTransition) { apply(next); return; }
  const { x, y } = origin;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(() => apply(next));
  vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: MS(550), easing: 'cubic-bezier(.45,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
}
