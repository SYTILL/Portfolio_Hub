import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG, T, clamp01, lineRate } from '../config';
import { BLUE, CAT_KEYS, GOLD, ORDER, PROJECTS, byStart, type CatKey } from '../data/projects';
import { on } from '../lib/events';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { getState, hotId } from '../state';
import { clock, since } from './clock';
import { sky, type Sky, type StarData } from './registry';
import { CENTERS, POS, disposeTree, hash, lineMat, sprite } from './util';

interface CatLines { pts: THREE.Vector3[]; n: number; arr: Float32Array; g: THREE.BufferGeometry; line: THREE.LineSegments; haze: THREE.Sprite; draw: number; drawn: number; alpha: number; first: number; last: number }

// Project stars (gold = shipped, blue = the rest), the lines between them, a soft haze per constellation and the central star.
// Stars ignite in the order projects were started; opening a constellation brightens it and redraws its lines.
export function Constellations() {
  const built = useMemo(() => {
    const group = new THREE.Group();
    const stars = PROJECTS.map(p => {
      const base = p.status === 'live' ? 3.2 : p.status === 'wip' ? 2.4 : 1.8;
      const halo = sprite(p.status === 'live' ? GOLD : BLUE, 0);
      halo.position.copy(POS[p.id]);
      halo.scale.setScalar(base);
      const dot = sprite('#ffffff', 0);
      dot.scale.setScalar(0.36);
      halo.add(dot);
      halo.userData = { p, base, k: 0, kT: 0, vis: 0.85, life: 0, order: ORDER[p.id], seed: (hash(p.id) % 100) / 10 } satisfies StarData;
      group.add(halo);
      return halo;
    });
    const cats = {} as Record<CatKey, CatLines>;
    for (const cat of CAT_KEYS) {
      const list = PROJECTS.filter(p => p.cat === cat).sort(byStart);
      const pts = list.map(p => POS[p.id]), n = Math.max(0, pts.length - 1);
      const arr = new Float32Array(n * 6), g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const line = new THREE.LineSegments(g, lineMat(0));
      line.frustumCulled = false;
      group.add(line);
      const haze = sprite('#cdbb8e', 0);
      haze.position.set(...CENTERS[cat]);
      haze.scale.setScalar(34);
      group.add(haze);
      cats[cat] = { pts, n, arr, g, line, haze, draw: RM ? n : 0, drawn: -1, alpha: 0,
        first: Math.min(...list.map(p => ORDER[p.id])), last: Math.max(...list.map(p => ORDER[p.id])) };
    }
    const core = sprite('#fff1da', 0);
    core.scale.setScalar(4.6);
    group.add(core);

    const lifeOf = (order: number) => (RM ? 1 : clamp01((since() - T.stars - order * T.step) / T.rise));
    const api: Sky = {
      group, stars, focus: null, hot: null, hintCat: null, focusAt: 0,
      nameLife: cat => (RM ? 1 : clamp01((since() - T.stars - cats[cat].first * T.step - CFG.nameDelay) / Math.max(T.rise, 0.3))),
    };
    return { group, stars, cats, core, lifeOf, api, coreVis: { v: 0 } };
  }, []);

  useEffect(() => {
    sky.current = built.api;
    const off = on('replay', () => { for (const k of CAT_KEYS) built.cats[k].draw = RM ? built.cats[k].n : 0; });
    return () => { off(); sky.current = null; disposeTree(built.group); };
  }, [built]);

  useFrame(() => {
    const { api, cats, stars, core, lifeOf, coreVis } = built;
    const s = getState(), dt = clock.dt, t = clock.now;
    if (s.focus !== api.focus) {
      api.focus = s.focus;
      api.focusAt = clock.now;
      if (s.focus && !RM) cats[s.focus].draw = 0;
    }
    api.hot = hotId(s);
    api.hintCat = s.hintCat;
    const e = RM ? 1 : 1 - Math.pow(0.0005, dt), ev = RM ? 1 : 1 - Math.pow(0.02, dt);

    for (const st of stars) {
      const u = st.userData as StarData, life = lifeOf(u.order), flash = life > 0 && life < 1 ? Math.sin(life * Math.PI) : 0;
      u.life = life;
      u.vis += ((!api.focus ? 0.85 : u.p.cat === api.focus ? 1 : 0.26) - u.vis) * ev;
      u.kT = api.hot === u.p.id ? 1 : 0;
      u.k += (u.kT - u.k) * e;
      const dim = api.hot && api.hot !== u.p.id && u.p.cat === api.focus ? 0.6 : 1;
      const pulse = RM ? 0 : Math.sin(t * 1.5 + u.seed) * 0.05;
      st.visible = life > 0.001;
      st.scale.setScalar(u.base * CFG.starSize * (0.4 + 0.6 * life) * (1 + pulse + u.k * 0.8 + flash * 1.5));
      st.material.opacity = 0.95 * u.vis * life * dim;
      (st.children[0] as THREE.Sprite).material.opacity = Math.min(1, (0.5 + 0.5 * u.vis) * life * (0.6 + 0.4 * dim) + flash * 0.6);
    }

    for (const cat of CAT_KEYS) {
      const c = cats[cat], life = lifeOf(c.last + 1);
      c.alpha += ((!api.focus ? CFG.lineHome : cat === api.focus ? CFG.lineFocus : CFG.lineHome * 0.27) * life - c.alpha) * ev;
      (c.line.material as THREE.LineBasicMaterial).opacity = c.alpha;
      c.line.visible = c.alpha > 0.003;
      if (life > 0.3 && c.draw < c.n) c.draw = Math.min(c.n, c.draw + dt * lineRate(c.n));
      if (c.draw !== c.drawn) {
        const full = Math.floor(c.draw), frac = c.draw - full, tmp = new THREE.Vector3();
        for (let i = 0; i < c.n; i++) {
          const a = c.pts[i], o = i * 6;
          const end = i < full ? c.pts[i + 1] : i === full ? tmp.copy(a).lerp(c.pts[i + 1], frac) : a;
          c.arr[o] = a.x; c.arr[o + 1] = a.y; c.arr[o + 2] = a.z; c.arr[o + 3] = end.x; c.arr[o + 4] = end.y; c.arr[o + 5] = end.z;
        }
        c.g.attributes.position.needsUpdate = true;
        c.drawn = c.draw;
      }
      const hz = (api.focus ? (cat === api.focus ? 0.05 : 0.02) : api.hintCat === cat ? 0.13 : 0.07) * lifeOf(c.first);
      c.haze.material.opacity += (hz - c.haze.material.opacity) * ev;
    }

    const coreLife = RM ? 1 : clamp01(since() / T.core);
    coreVis.v += ((api.focus ? 0.12 : 1) * coreLife - coreVis.v) * ev;
    core.material.opacity = coreVis.v;
    core.scale.setScalar(4.6 + (RM ? 0 : Math.sin(t * 0.9) * 0.2));
  }, -40);

  return <primitive object={built.group} />;
}
