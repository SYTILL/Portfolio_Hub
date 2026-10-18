// Where the reader is in the mission log: which two sections the middle of the screen sits between, and how far along.
// In the middle of a section k is 0 (that section alone); across the bottom ZONE of one section and the top ZONE of the next,
// k eases from 0 to 1. The camera and the map highlights both follow this.
const ZONE = 0.2;
const ease = (x: number) => x * x * (3 - 2 * x);

export interface LogPlace { a: HTMLElement; b: HTMLElement; k: number }

export function logSections(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('.log section[data-focus]')];
}

export function logPlace(secs = logSections()): LogPlace | null {
  if (!secs.length) return null;
  const mid = innerHeight / 2, rects = secs.map(s => s.getBoundingClientRect());
  for (let i = 0; i < rects.length - 1; i++) {
    const y = rects[i + 1].top, zA = rects[i].height * ZONE, zB = rects[i + 1].height * ZONE;
    if (mid <= y + zA && mid >= y - zB) return { a: secs[i], b: secs[i + 1], k: ease(Math.min(1, Math.max(0, (mid + zA - y) / (zA + zB)))) };
  }
  let i = 0;
  rects.forEach((r, j) => { if (r.top <= mid) i = j; });
  return { a: secs[i], b: secs[i], k: 0 };
}
