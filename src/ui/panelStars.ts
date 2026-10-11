import { CFG } from '../config';
import { hash, rng } from '../scene/util';

// Each panel gets its own sprinkle of tiny stars under the grid lines: a different seed, tile size and density.
export function starTile(seed: number, W: number) {
  const r = rng(seed), parts: string[] = [], bright: [number, number][] = [];
  const count = Math.round((W * W) / 2300 * CFG.panelStarDensity) + Math.floor(r() * 10);
  for (let i = 0; i < count; i++) {
    const x = r() * W, y = r() * W, big = r() < 0.14;
    const rad = big ? 0.9 + r() * 0.6 : 0.35 + r() * 0.5, op = big ? 0.5 + r() * 0.3 : 0.16 + r() * 0.26;
    const col = r() < 0.22 ? '#a8c6ea' : r() < 0.6 ? '#e3c98c' : '#f4ecd8';
    parts.push(`<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${rad.toFixed(2)}' fill='${col}' fill-opacity='${Math.min(1, op * CFG.panelStarAlpha).toFixed(2)}'/>`);
    if (big) {
      bright.push([x, y]);
      parts.push(`<path d='M${(x - 3.4).toFixed(1)} ${y.toFixed(1)}H${(x + 3.4).toFixed(1)}M${x.toFixed(1)} ${(y - 3.4).toFixed(1)}V${(y + 3.4).toFixed(1)}' stroke='${col}' stroke-opacity='${Math.min(1, op * 0.45 * CFG.panelStarAlpha).toFixed(2)}' stroke-width='.5'/>`);
    }
  }
  // Join a few bright stars into one or two faint mini-constellations.
  for (let k = 0; k + 2 < bright.length && k < 6; k += 3 + Math.floor(r() * 2)) {
    const pts = bright.slice(k, k + 3 + Math.floor(r() * 2)).sort((a, b) => a[0] - b[0]).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
    parts.push(`<path d='M${pts}' fill='none' stroke='#e3c98c' stroke-opacity='${Math.min(1, 0.12 * CFG.panelStarAlpha).toFixed(3)}' stroke-width='.6'/>`);
  }
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${W}'>${parts.join('')}</svg>`)}")`;
}

const TILES: Record<string, number> = { id: 300, stats: 340, proj: 360, detail: 320, term: 260 };

export function paintPanels(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.p[data-panel]').forEach(p => {
    const k = p.dataset.panel!, W = TILES[k] ?? 300;
    p.style.setProperty('--p-stars', starTile(hash(k) ^ 0x5bd1e995, W));
    p.style.setProperty('--p-tile', W + 'px');
  });
  const crumb = root.querySelector<HTMLElement>('.crumb');
  if (crumb) {
    crumb.style.setProperty('--p-stars', starTile(4242, 220));
    crumb.style.setProperty('--p-tile', '220px');
  }
}
