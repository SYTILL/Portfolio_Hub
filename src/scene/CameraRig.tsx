import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG, clamp01, onRetune } from '../config';
import { BYID, type CatKey } from '../data/projects';
import { on } from '../lib/events';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { actions, getState, subscribe } from '../state';
import { clock, since } from './clock';
import { nameBoxes, sky, toScreen, type StarData } from './registry';
import { CENTERS, POS } from './util';

/**
 * Orbit camera around the map.
 * - Entry: zooms in from introFrom to camHome (ease in-out). Zooming or opening a constellation cancels it.
 * - Drag rotates; Ctrl/⌘ + wheel (or a trackpad pinch) zooms, so plain scrolling still scrolls.
 * - Follows the app state: full map, an open constellation, or a selected star.
 * - Shifts the projection so the map is centered in the empty area between the docks (focusEl).
 * - Owns pointer input on the map: hover and click on stars and constellation names.
 */
export function CameraRig({ mapEl, focusEl }: { mapEl: HTMLElement; focusEl: HTMLElement | null }) {
  const get = useThree(s => s.get);
  const rig = useMemo(() => ({
    tgt: new THREE.Vector3(), want: new THREE.Vector3(),
    R: RM ? CFG.camHome : CFG.introFrom, wantR: CFG.camHome,
    th: 0.5, ph: 1.22, vth: 0, vph: 0, drag: false, lx: 0, ly: 0, moved: 0, idle: 10, intro: !RM,
    off: { x: 0, y: 0, tx: 0, ty: 0 },
  }), []);

  // Follow the app state.
  useEffect(() => {
    const aim = () => {
      const s = getState();
      if (s.sel) {
        rig.intro = false;
        rig.want.set(...CENTERS[BYID[s.sel].cat]).lerp(POS[s.sel], 0.35);
        rig.wantR = CFG.camSelect;
      } else if (s.focus) {
        rig.intro = false;
        rig.want.set(...CENTERS[s.focus]);
        rig.wantR = CFG.camFocus;
      } else {
        rig.want.set(0, 0, 0);
        rig.wantR = CFG.camHome;
      }
    };
    aim();
    const offState = subscribe(aim);
    const offTune = onRetune(k => { if (!k || k.startsWith('cam') || k.startsWith('intro')) aim(); });
    const offReplay = on('replay', () => {
      if (RM || getState().focus) return;
      rig.intro = true;
      rig.R = CFG.introFrom;
      rig.wantR = CFG.camHome;
    });
    return () => { offState(); offTune(); offReplay(); };
  }, [rig]);

  // Center the map in the gap between the docks.
  useEffect(() => {
    const measure = () => {
      const off = rig.off;
      off.tx = 0; off.ty = 0;
      if (!focusEl) return;
      const fr = focusEl.getBoundingClientRect(), hr = mapEl.getBoundingClientRect();
      if (!fr.width || !fr.height) return;
      off.tx = fr.left + fr.width / 2 - (hr.left + hr.width / 2);
      off.ty = fr.top + fr.height / 2 - (hr.top + hr.height / 2);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(mapEl);
    if (focusEl) ro.observe(focusEl);
    measure();
    return () => ro.disconnect();
  }, [rig, mapEl, focusEl]);

  // Pointer input on the map.
  useEffect(() => {
    const local = (e: PointerEvent | MouseEvent) => { const r = mapEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
    const pick = (x: number, y: number): { id: string } | { cat: CatKey } | null => {
      const { camera, size } = get();
      const c = sky.current, s = getState();
      if (c && s.focus) {
        const world = new THREE.Vector3();
        let best: string | null = null, bd = 24;
        for (const st of c.stars) {
          const u = st.userData as StarData;
          if (u.p.cat !== s.focus || u.life < 0.5 || u.vis < 0.2) continue;
          const p = toScreen(camera, size, st.getWorldPosition(world));
          if (p.behind) continue;
          const d = Math.hypot(p.x - x, p.y - y);
          if (d < bd) { bd = d; best = u.p.id; }
        }
        if (best) return { id: best };
      }
      const n = nameBoxes.find(({ box: b }) => x >= b[0] - 8 && x <= b[2] + 8 && y >= b[1] - 8 && y <= b[3] + 8);
      return n ? { cat: n.k } : null;
    };
    const down = (e: PointerEvent) => {
      rig.drag = true; rig.moved = 0; rig.lx = e.clientX; rig.ly = e.clientY;
      try { mapEl.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    };
    const move = (e: PointerEvent) => {
      if (rig.drag) {
        const dx = e.clientX - rig.lx, dy = e.clientY - rig.ly;
        rig.lx = e.clientX; rig.ly = e.clientY;
        rig.moved += Math.abs(dx) + Math.abs(dy);
        rig.vth = -dx * 0.006; rig.vph = -dy * 0.006;
        rig.th += rig.vth;
        rig.ph = Math.min(2.7, Math.max(0.45, rig.ph + rig.vph));
        rig.idle = 0;
        return;
      }
      const h = pick(...local(e));
      mapEl.style.cursor = h ? 'pointer' : '';
      if (h && 'id' in h) actions.hover(h.id);
      else {
        actions.hover(null);
        actions.hintName(h && 'cat' in h && h.cat !== getState().focus ? h.cat : null);
      }
    };
    const up = () => { rig.drag = false; };
    const leave = () => { if (!rig.drag) { actions.hover(null); actions.hintName(null); } };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (rig.intro) { rig.intro = false; rig.wantR = rig.R; }
      rig.wantR = Math.min(320, Math.max(12, rig.wantR * (e.deltaY > 0 ? 1.08 : 0.92)));
      rig.idle = 0;
    };
    const click = (e: MouseEvent) => {
      if (rig.moved > 6) return;
      const h = pick(...local(e));
      if (!h) return;
      if ('id' in h) actions.select(h.id);
      else if (h.cat === getState().focus) actions.home();
      else actions.setFocus(h.cat);
    };
    mapEl.addEventListener('pointerdown', down);
    mapEl.addEventListener('pointermove', move);
    mapEl.addEventListener('pointerup', up);
    mapEl.addEventListener('pointercancel', up);
    mapEl.addEventListener('pointerleave', leave);
    mapEl.addEventListener('wheel', wheel, { passive: false });
    mapEl.addEventListener('click', click);
    return () => {
      mapEl.removeEventListener('pointerdown', down);
      mapEl.removeEventListener('pointermove', move);
      mapEl.removeEventListener('pointerup', up);
      mapEl.removeEventListener('pointercancel', up);
      mapEl.removeEventListener('pointerleave', leave);
      mapEl.removeEventListener('wheel', wheel);
      mapEl.removeEventListener('click', click);
    };
  }, [rig, mapEl, get]);

  useFrame(({ camera, size }) => {
    const cam = camera as THREE.PerspectiveCamera, dt = clock.dt, off = rig.off;
    const k = RM ? 1 : 1 - Math.pow(0.004, dt);
    off.x += (off.tx - off.x) * k;
    off.y += (off.ty - off.y) * k;
    if (Math.abs(off.x) > 0.5 || Math.abs(off.y) > 0.5) cam.setViewOffset(size.width, size.height, -off.x, -off.y, size.width, size.height);
    else if (cam.view?.enabled) cam.clearViewOffset();

    if (!rig.drag) {
      rig.vth *= 0.9; rig.vph *= 0.9;
      rig.th += rig.vth;
      rig.ph = Math.min(2.7, Math.max(0.45, rig.ph + rig.vph));
      rig.idle += dt;
      if (rig.idle > 2.5 && !RM) rig.th += CFG.autoRotate * dt;
    }
    const e = RM ? 1 : 1 - Math.pow(0.002, dt * CFG.camEase);
    rig.tgt.lerp(rig.want, e);
    if (rig.intro) {
      const x = clamp01((since() - CFG.introDelay) / Math.max(CFG.introDur, 0.01));
      const ease = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      rig.R = CFG.introFrom + (CFG.camHome - CFG.introFrom) * ease;
      if (x >= 1) rig.intro = false;
    } else {
      rig.R += (rig.wantR - rig.R) * e;
    }
    const s = Math.sin(rig.ph);
    cam.position.set(rig.tgt.x + rig.R * s * Math.sin(rig.th), rig.tgt.y + rig.R * Math.cos(rig.ph), rig.tgt.z + rig.R * s * Math.cos(rig.th));
    cam.lookAt(rig.tgt);
    cam.updateMatrixWorld();
  }, -50);

  return null;
}
