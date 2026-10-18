import { MS, onRetune } from '../config';
import { on } from '../lib/events';
import { REDUCED_MOTION as RM, storage } from '../lib/storage';
import { announce } from './announce';
import { playEntry } from './entry';
import { paintPanels } from './panelStars';

export const PANEL_KEYS = ['id', 'stats', 'proj', 'detail', 'term'] as const;
export type PanelKey = (typeof PANEL_KEYS)[number];
export const PANELS: Record<PanelKey, { title: string }> = {
  id: { title: 'About' },
  stats: { title: 'Summary' },
  proj: { title: 'Projects' },
  detail: { title: 'Details' },
  term: { title: 'Terminal' },
};

interface Layout { l: PanelKey[]; r: PanelKey[]; c: PanelKey[] }
const DEFAULT_LAYOUT: Layout = { l: ['id', 'stats', 'term'], r: ['proj', 'detail'], c: ['term'] };
const LAYOUT_KEY = 'cs-atlas-dock-v1';

/**
 * The two docks: panels collapse and expand, move between the left and right dock by dragging the grip
 * (neighbours slide out of the way with FLIP animations) or with the arrow keys, and the layout is remembered.
 * Panel elements are plain DOM hosts that React renders into through portals, so moving them never remounts them.
 */
export function wireDocks(root: HTMLElement, L: HTMLElement, R: HTMLElement, hosts: Record<PanelKey, HTMLElement>) {
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const keyOf = (p: Element) => (p as HTMLElement).dataset.panel as PanelKey;
  const movable = () => [...root.querySelectorAll<HTMLElement>('.dock > .p, .dock > .slot')];
  // FLIP: remember where everything was, change the DOM, then slide each moved element from its old spot.
  const flip = (mutate: () => void, skip?: HTMLElement) => {
    const before = new Map(movable().map(el => [el, el.getBoundingClientRect()]));
    mutate();
    if (RM) return;
    for (const el of movable()) {
      if (el === skip) continue;
      const a = before.get(el);
      if (!a) continue;
      const b = el.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0)' }], { duration: MS(300), easing: EASE });
    }
  };
  const syncEmpty = () => {
    root.classList.toggle('l-empty', !L.querySelector('.p'));
    root.classList.toggle('r-empty', !R.querySelector('.p'));
  };
  const setCollapsed = (p: HTMLElement, collapsed: boolean) => {
    p.classList.toggle('is-collapsed', collapsed);
    const btn = p.querySelector('.tg'), body = p.querySelector('.pb-wrap'), title = PANELS[keyOf(p)].title;
    btn?.setAttribute('aria-expanded', String(!collapsed));
    btn?.setAttribute('aria-label', `${collapsed ? 'Expand' : 'Collapse'} ${title}`);
    if (collapsed) body?.setAttribute('inert', '');
    else body?.removeAttribute('inert');
  };
  const save = () => {
    const ids = (dock: HTMLElement) => [...dock.querySelectorAll<HTMLElement>(':scope > .p')].map(keyOf);
    storage.set(LAYOUT_KEY, { l: ids(L), r: ids(R), c: [...root.querySelectorAll<HTMLElement>('.p.is-collapsed')].map(keyOf) } satisfies Layout);
    syncEmpty();
  };
  // A saved layout keeps working when panels are added or removed: unknown keys are dropped, new ones join their default dock.
  const apply = (lay: Layout | null) => {
    let use = DEFAULT_LAYOUT;
    if (lay && Array.isArray(lay.l) && Array.isArray(lay.r)) {
      const known = (ks: PanelKey[]) => ks.filter(k => (PANEL_KEYS as readonly string[]).includes(k));
      const l = known(lay.l), r = known(lay.r).filter(k => !l.includes(k)), seen = [...l, ...r];
      for (const k of PANEL_KEYS) if (!seen.includes(k)) (DEFAULT_LAYOUT.l.includes(k) ? l : r).push(k);
      use = { l, r, c: known(Array.isArray(lay.c) ? lay.c : []) };
    }
    use.l.forEach(k => L.appendChild(hosts[k]));
    use.r.forEach(k => R.appendChild(hosts[k]));
    PANEL_KEYS.forEach(k => setCollapsed(hosts[k], (use.c || []).includes(k)));
    syncEmpty();
  };
  apply(storage.get<Layout>(LAYOUT_KEY));
  paintPanels(root);
  playEntry(root);

  const onClick = (e: MouseEvent) => {
    const t = (e.target as Element).closest('.tg');
    if (!t) return;
    const p = t.closest<HTMLElement>('.p')!;
    setCollapsed(p, !p.classList.contains('is-collapsed'));
    save();
  };

  let drag: { p: HTMLElement; slot: HTMLElement; dx: number; dy: number } | null = null;
  const onDown = (e: PointerEvent) => {
    const g = (e.target as Element).closest('.grip');
    if (!g || e.button !== 0) return;
    e.preventDefault();
    const p = g.closest<HTMLElement>('.p')!, rr = root.getBoundingClientRect(), pr = p.getBoundingClientRect();
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.height = pr.height + 'px';
    p.before(slot);
    p.style.width = pr.width + 'px';
    p.style.left = pr.left - rr.left + 'px';
    p.style.top = pr.top - rr.top + 'px';
    p.classList.add('is-drag');
    root.appendChild(p);
    root.classList.add('dragging');
    if (!RM) p.animate([{ transform: 'none' }, { transform: 'rotate(-1.2deg) scale(1.02)' }], { duration: MS(160), easing: 'ease-out' });
    drag = { p, slot, dx: e.clientX - pr.left, dy: e.clientY - pr.top };
    try { root.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const d = drag, rr = root.getBoundingClientRect();
    d.p.style.left = e.clientX - rr.left - d.dx + 'px';
    d.p.style.top = e.clientY - rr.top - d.dy + 'px';
    const dock = e.clientX - rr.left < rr.width / 2 ? L : R;
    L.classList.toggle('drop-on', dock === L);
    R.classList.toggle('drop-on', dock === R);
    const before = [...dock.querySelectorAll<HTMLElement>(':scope > .p')].find(s => { const b = s.getBoundingClientRect(); return e.clientY < b.top + b.height / 2; }) ?? null;
    const moved = before ? d.slot.nextElementSibling !== before || d.slot.parentElement !== dock : d.slot.parentElement !== dock || !!d.slot.nextElementSibling;
    if (moved) flip(() => { if (before) dock.insertBefore(d.slot, before); else dock.appendChild(d.slot); });
  };
  const onUp = () => {
    if (!drag) return;
    const { p, slot } = drag;
    drag = null;
    const rr = root.getBoundingClientRect(), from = { left: rr.left + parseFloat(p.style.left), top: rr.top + parseFloat(p.style.top) };
    const side = slot.parentElement === L ? 'left' : 'right';
    flip(() => {
      slot.replaceWith(p);
      p.classList.remove('is-drag');
      ['width', 'left', 'top'].forEach(k => p.style.removeProperty(k));
      root.classList.remove('dragging');
      L.classList.remove('drop-on');
      R.classList.remove('drop-on');
    }, p);
    if (!RM) {
      const b = p.getBoundingClientRect();
      p.animate([{ transform: `translate(${from.left - b.left}px,${from.top - b.top}px) rotate(-1.2deg) scale(1.02)` }, { transform: 'none' }], { duration: MS(320), easing: EASE });
    }
    save();
    announce(`${PANELS[keyOf(p)].title} panel placed in the ${side} dock`);
  };
  const onKey = (e: KeyboardEvent) => {
    const g = (e.target as Element).closest?.('.grip') as HTMLElement | null;
    if (!g) return;
    const p = g.closest<HTMLElement>('.p')!, dock = p.parentElement!, title = PANELS[keyOf(p)].title;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const to = e.key === 'ArrowLeft' ? L : R;
      if (to !== dock) {
        flip(() => to.appendChild(p));
        save();
        announce(`${title} panel moved to the ${to === L ? 'left' : 'right'} dock`);
      }
    } else if (e.key === 'ArrowUp' && p.previousElementSibling) {
      e.preventDefault();
      flip(() => dock.insertBefore(p, p.previousElementSibling));
      save();
      announce(`${title} panel moved up`);
    } else if (e.key === 'ArrowDown' && p.nextElementSibling) {
      e.preventDefault();
      flip(() => dock.insertBefore(p.nextElementSibling!, p));
      save();
      announce(`${title} panel moved down`);
    } else return;
    g.focus();
  };

  root.addEventListener('click', onClick);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);
  root.addEventListener('keydown', onKey);
  const offReset = on('reset-layout', () => { storage.remove(LAYOUT_KEY); flip(() => apply(DEFAULT_LAYOUT)); });
  const offReplay = on('replay', () => playEntry(root));
  const offEnter = on('enter-map', () => playEntry(root, true));
  let repaint = 0;
  const offTune = onRetune(k => {
    if (!k || k === 'panelStarAlpha' || k === 'panelStarDensity') { clearTimeout(repaint); repaint = window.setTimeout(() => paintPanels(root), 120); }
  });

  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('pointerdown', onDown);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerup', onUp);
    root.removeEventListener('pointercancel', onUp);
    root.removeEventListener('keydown', onKey);
    offReset(); offReplay(); offEnter(); offTune();
    clearTimeout(repaint);
  };
}
