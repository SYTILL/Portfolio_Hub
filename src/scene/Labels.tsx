import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG } from '../config';
import { BYID, CATS, CAT_KEYS, PROJECTS, type CatKey } from '../data/projects';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { getTheme } from '../lib/theme';
import { actions, getState } from '../state';
import { clock } from './clock';
import { nameBoxes, num, rings, sky, toScreen, type Box, type StarData } from './registry';
import { CENTERS, POS } from './util';

// HTML labels over the canvas.
// Constellation names sit at each cluster center; the open one becomes a blurred watermark and stops blocking star labels.
// Star labels show only for the open constellation (after labelDelay) or the hovered star.
// They are placed by priority (hovered > shipped > in progress > rest), right of the star first, then left; otherwise hidden.
// A selected star with a case file gets a leader line up and to the right ending in a "View case" button
// (mirrored to the left near the right edge). It lives beside the aria-hidden label layer so it can be clicked and focused.
const IDX: Record<string, number> = Object.fromEntries(PROJECTS.map((p, i) => [p.id, i]));
const DIAG = 50, RUN = 16;
// Edit mode (light theme) adds numbers: each constellation's center, each star's x/y/z under its name, and a tag on
// every ring's orbiting star with its radius, angular speed and tilt. They are in the DOM all the time and shown by CSS.
const xyz = (v: { x: number; y: number; z: number }) => `<span class="xyz"><i class="ax">${num(v.x)}</i><i class="ay">${num(v.y)}</i><i class="az">${num(v.z)}</i></span>`;
type Callout = { d: HTMLDivElement; btn: HTMLButtonElement; w: number; id: string | null; on: boolean; flip: boolean };
export function Labels({ layer }: { layer: HTMLDivElement }) {
  const { camera, size } = useThree();
  const nodes = useRef<{ names: { k: CatKey; d: HTMLDivElement; w: number; h: number; life: number }[]; items: { id: string; d: HTMLDivElement; w: number; x: number; y: number; ok: boolean }[]; call: Callout; ringTags: HTMLDivElement[] } | null>(null);

  useEffect(() => {
    const names = CAT_KEYS.map(k => {
      const d = document.createElement('div');
      d.className = 'cname';
      const count = PROJECTS.filter(p => p.cat === k).length;
      const [cx, cy, cz] = CENTERS[k];
      d.innerHTML = `<b>${CATS[k].label.toUpperCase()}</b><small>${count} ${CATS[k].unit}</small><em class="cxyz">(${num(cx, 0)}, ${num(cy, 0)}, ${num(cz, 0)})</em>`;
      layer.appendChild(d);
      return { k, d, w: 0, h: 0, life: -1 };
    });
    const items = PROJECTS.map(p => {
      const d = document.createElement('div');
      d.className = 'lbl';
      d.innerHTML = `<span class="lbl-n"></span>${xyz(POS[p.id])}`;
      d.firstElementChild!.textContent = p.name;
      layer.appendChild(d);
      return { id: p.id, d, w: 0, x: 0, y: 0, ok: false };
    });
    const cd = document.createElement('div');
    cd.className = 'callout';
    cd.style.setProperty('--cx', `${DIAG + RUN}px`);
    cd.style.setProperty('--cy', `${-DIAG}px`);
    cd.inert = true;
    cd.innerHTML = `<svg class="callout-ln" aria-hidden="true"><polyline points="6,-6 ${DIAG},-${DIAG} ${DIAG + RUN},-${DIAG}"/></svg><button type="button" class="callout-btn">View case <span aria-hidden="true">▸</span></button>`;
    const btn = cd.querySelector('button')!;
    // Keep the map's drag, pick and right-click handlers out of it.
    const stop = (e: Event) => e.stopPropagation();
    btn.addEventListener('pointerdown', stop);
    btn.addEventListener('click', e => { e.stopPropagation(); const id = getState().sel; if (id) actions.openCase(id); });
    layer.after(cd);
    const call: Callout = { d: cd, btn, w: 0, id: null, on: false, flip: false };
    const ringTags = [0, 1, 2].map(() => {
      const t = document.createElement('div');
      t.className = 'ring-tag';
      layer.appendChild(t);
      return t;
    });
    nodes.current = { names, items, call, ringTags };
    // Widths change once the web font arrives.
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) { names.forEach(n => { n.w = 0; }); items.forEach(i => { i.w = 0; }); call.w = 0; } });
    return () => {
      alive = false;
      names.forEach(n => n.d.remove());
      items.forEach(i => i.d.remove());
      cd.remove();
      ringTags.forEach(t => t.remove());
      nodes.current = null;
    };
  }, [layer]);

  const mode = useRef(getTheme());
  useFrame(() => {
    const c = sky.current, n = nodes.current;
    if (!c || !n) return;
    // Edit mode changes what the labels contain, so measure them again.
    if (mode.current !== getTheme()) {
      mode.current = getTheme();
      n.names.forEach(nm => { nm.w = 0; });
      n.items.forEach(it => { it.w = 0; });
    }
    const placed: Box[] = [];
    nameBoxes.length = 0;
    for (const nm of n.names) {
      if (!nm.w) { nm.w = nm.d.offsetWidth; nm.h = nm.d.offsetHeight; }
      const life = Math.round(c.nameLife(nm.k) * 100) / 100;
      if (life !== nm.life) { nm.life = life; nm.d.style.setProperty('--life', String(life)); }
      const center = c.group.localToWorld(new THREE.Vector3(...CENTERS[nm.k]));
      const p = toScreen(camera, size, center);
      if (p.behind || life <= 0) { nm.d.style.transform = 'translate(-9999px,0)'; continue; }
      const x0 = p.x - nm.w / 2, y0 = p.y - nm.h / 2, box: Box = [x0, y0, x0 + nm.w, y0 + nm.h];
      nm.d.style.transform = `translate(${x0.toFixed(1)}px,${y0.toFixed(1)}px)`;
      nameBoxes.push({ k: nm.k, box });
      if (c.focus !== nm.k) placed.push(box);
      nm.d.classList.toggle('is-focus', c.focus === nm.k);
      nm.d.classList.toggle('is-other', !!c.focus && c.focus !== nm.k);
      nm.d.classList.toggle('is-hint', c.hintCat === nm.k && c.focus !== nm.k);
    }

    const edit = getTheme() === 'light';
    n.ringTags.forEach((tag, i) => {
      const r = rings[i];
      const p = r && edit && r.visible ? toScreen(camera, size, r.pos) : null;
      if (!p || p.behind) { tag.style.transform = 'translate(-9999px,0)'; return; }
      const text = `ring ${i + 1} · r ${r.R} · ω ${num(r.omega, 3)} rad/s · tilt ${num(r.tilt)}°`;
      if (tag.textContent !== text) tag.textContent = text;
      tag.style.transform = `translate(${(p.x + 10).toFixed(1)}px,${(p.y - 18).toFixed(1)}px)`;
    });

    const labelsReady = RM || clock.now - c.focusAt >= CFG.labelDelay;
    const world = new THREE.Vector3();

    const cl = n.call, sel = getState().sel, sp = sel ? BYID[sel] : null;
    let show = false;
    if (sp?.case && sp.cat === c.focus && labelsReady) {
      const st = c.stars[IDX[sp.id]];
      if ((st.userData as StarData).life > 0.6) {
        const p = toScreen(camera, size, st.getWorldPosition(world));
        if (!p.behind) {
          if (!cl.w) cl.w = cl.btn.offsetWidth;
          const flip = p.x + DIAG + RUN + cl.w > size.width - 8;
          const bx = flip ? p.x - DIAG - RUN - cl.w : p.x + DIAG + RUN, by = p.y - DIAG;
          placed.push([bx - 2, by - 14, bx + cl.w + 2, by + 14]);
          cl.d.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`;
          if (flip !== cl.flip) { cl.flip = flip; cl.d.classList.toggle('flip', flip); }
          show = cl.id === sel;
        }
      }
    }
    // A new star restarts the draw-in: hide for one frame, then show.
    if (cl.id !== sel) cl.id = sel;
    if (show !== cl.on) {
      cl.on = show;
      cl.d.classList.toggle('on', show);
      cl.d.inert = !show;
      if (!show) cl.d.style.transform = 'translate(-9999px,0)';
    }
    n.items.forEach((it, i) => {
      if (!it.w) it.w = it.d.offsetWidth;
      const st = c.stars[i], u = st.userData as StarData;
      st.getWorldPosition(world);
      const p = toScreen(camera, size, world);
      it.x = p.x; it.y = p.y;
      it.ok = !p.behind && u.life > 0.6 && ((u.p.cat === c.focus && labelsReady) || u.kT > 0);
    });
    const pri = (u: StarData) => (u.kT ? 100 : 0) + (u.p.status === 'live' ? 10 : u.p.status === 'wip' ? 5 : 0);
    const hits = (b: Box) => placed.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    n.items
      .map((it, i) => ({ it, u: c.stars[i].userData as StarData }))
      .sort((a, b) => pri(b.u) - pri(a.u))
      .forEach(({ it, u }) => {
        let x0 = it.x;
        if (it.ok) {
          const lo = edit ? 22 : 9;
          const right: Box = [it.x + 10, it.y - 9, it.x + it.w + 2, it.y + lo];
          const left: Box = [it.x - it.w + 2, it.y - 9, it.x - 6, it.y + lo];
          if (!hits(right)) placed.push(right);
          else if (!hits(left)) { placed.push(left); x0 = it.x - it.w - 8; }
          else it.ok = u.kT > 0;
        }
        it.d.classList.toggle('on', it.ok);
        if (!it.ok) { it.d.style.transform = 'translate(-9999px,0)'; return; }
        it.d.style.transform = `translate(${x0.toFixed(1)}px,${(it.y - 7).toFixed(1)}px)`;
        it.d.classList.toggle('hot', u.kT > 0);
      });
  });

  return null;
}
