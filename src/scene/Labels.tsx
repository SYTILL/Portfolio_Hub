import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG } from '../config';
import { CATS, CAT_KEYS, PROJECTS, type CatKey } from '../data/projects';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { clock } from './clock';
import { nameBoxes, sky, toScreen, type Box, type StarData } from './registry';
import { CENTERS } from './util';

// HTML labels over the canvas.
// Constellation names sit at each cluster center; the open one becomes a blurred watermark and stops blocking star labels.
// Star labels show only for the open constellation (after labelDelay) or the hovered star.
// They are placed by priority (hovered > shipped > in progress > rest), right of the star first, then left; otherwise hidden.
export function Labels({ layer }: { layer: HTMLDivElement }) {
  const { camera, size } = useThree();
  const nodes = useRef<{ names: { k: CatKey; d: HTMLDivElement; w: number; h: number; life: number }[]; items: { id: string; d: HTMLDivElement; w: number; x: number; y: number; ok: boolean }[] } | null>(null);

  useEffect(() => {
    const names = CAT_KEYS.map(k => {
      const d = document.createElement('div');
      d.className = 'cname';
      const count = PROJECTS.filter(p => p.cat === k).length;
      d.innerHTML = `<b>${CATS[k].label.toUpperCase()}</b><small>${count} projects</small>`;
      layer.appendChild(d);
      return { k, d, w: 0, h: 0, life: -1 };
    });
    const items = PROJECTS.map(p => {
      const d = document.createElement('div');
      d.className = 'lbl';
      d.textContent = p.name;
      layer.appendChild(d);
      return { id: p.id, d, w: 0, x: 0, y: 0, ok: false };
    });
    nodes.current = { names, items };
    // Widths change once the web font arrives.
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) { names.forEach(n => { n.w = 0; }); items.forEach(i => { i.w = 0; }); } });
    return () => {
      alive = false;
      names.forEach(n => n.d.remove());
      items.forEach(i => i.d.remove());
      nodes.current = null;
    };
  }, [layer]);

  useFrame(() => {
    const c = sky.current, n = nodes.current;
    if (!c || !n) return;
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

    const labelsReady = RM || clock.now - c.focusAt >= CFG.labelDelay;
    const world = new THREE.Vector3();
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
          const right: Box = [it.x + 10, it.y - 9, it.x + it.w + 2, it.y + 9];
          const left: Box = [it.x - it.w + 2, it.y - 9, it.x - 6, it.y + 9];
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
