import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG, T, clamp01, onRetune } from '../config';
import { BYID, type CatKey } from '../data/projects';
import { on } from '../lib/events';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { getTheme } from '../lib/theme';
import { logPlace, logSections } from '../lib/logScroll';
import { actions, getState, subscribe } from '../state';
import { clock, since } from './clock';
import { nameBoxes, num, sky, toScreen, type StarData } from './registry';
import { logPose } from './logPose';
import { CENTERS, POS } from './util';

/**
 * Orbit camera around the map.
 * - Entry: zooms in from introFrom to camHome (ease in-out). Zooming or opening a constellation cancels it.
 * - Drag rotates; Ctrl/⌘ + wheel (or a trackpad pinch) zooms, so plain scrolling still scrolls.
 * - Follows the app state: full map, an open constellation, or a selected star.
 * - Shifts the projection so the map is centered in the empty area between the docks (focusEl).
 * - In the mission log (view 'log'), follows the scroll instead: it sits at each section's pose and eases between
 *   neighbours across their edges. Entering the map hands over from wherever the log left the camera.
 * - In edit mode (light theme), shows its own numbers in a small readout at the top-left of the map area.
 * - Owns pointer input on the map: hover and click on stars and constellation names, right-click to go back.
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
      if (RM || getState().focus || getState().view === 'log') return;
      rig.intro = true;
      rig.R = CFG.introFrom;
      rig.wantR = CFG.camHome;
    });
    return () => { offState(); offTune(); offReplay(); };
  }, [rig]);

  // Edit-mode camera readout, refreshed a few times a second.
  const hud = useMemo(() => ({ el: null as HTMLDivElement | null, last: 0 }), []);
  useEffect(() => {
    if (!focusEl) return;
    const el = document.createElement('div');
    el.className = 'cam-hud';
    el.setAttribute('aria-hidden', 'true');
    focusEl.appendChild(el);
    hud.el = el;
    return () => { el.remove(); hud.el = null; };
  }, [hud, focusEl]);

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
    // Right-click goes one level up (star → constellation → full map), unless it ended a drag.
    const context = (e: MouseEvent) => {
      e.preventDefault();
      if (rig.moved <= 6) actions.back();
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
    mapEl.addEventListener('contextmenu', context);
    return () => {
      mapEl.removeEventListener('pointerdown', down);
      mapEl.removeEventListener('pointermove', move);
      mapEl.removeEventListener('pointerup', up);
      mapEl.removeEventListener('pointercancel', up);
      mapEl.removeEventListener('pointerleave', leave);
      mapEl.removeEventListener('wheel', wheel);
      mapEl.removeEventListener('click', click);
      mapEl.removeEventListener('contextmenu', context);
    };
  }, [rig, mapEl, get]);

  const log = useMemo(() => ({
    pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), al: new THREE.Vector3(), b: new THREE.Vector3(), bl: new THREE.Vector3(),
    started: false, inLog: false, tmp: new THREE.Vector3(),
  }), []);

  useFrame(({ camera, size }) => {
    const cam = camera as THREE.PerspectiveCamera, dt = clock.dt, off = rig.off;
    const realDt = dt / CFG.speed;

    if (getState().view === 'log') {
      const place = logPlace(logSections());
      if (place) {
        if (!log.started) { log.pos.copy(cam.position); log.look.set(0, 0, 0); log.started = true; }
        const narrow = size.width < 860, t = performance.now() / 1000;
        // The map first appears centred, then slides aside in step with the intro text (which rises at T.logIntro).
        const x = RM ? 1 : clamp01((since() - T.logIntro) / 1.2), shift = x * x * (3 - 2 * x);
        logPose(place.a.dataset.focus ?? 'intro', place.a.classList.contains('r'), narrow, t, log.a, log.al, shift);
        logPose(place.b.dataset.focus ?? 'intro', place.b.classList.contains('r'), narrow, t, log.b, log.bl, shift);
        log.a.lerp(log.b, place.k); log.al.lerp(log.bl, place.k);
        // A light follow on top of the scroll position, so wheel steps glide instead of jumping.
        const f = RM ? 1 : 1 - Math.pow(0.002, realDt);
        log.pos.lerp(log.a, f); log.look.lerp(log.al, f);
        off.x = off.y = 0;
        if (cam.view?.enabled) cam.clearViewOffset();
        cam.position.copy(log.pos);
        cam.lookAt(log.look);
        cam.updateMatrixWorld();
        log.inLog = true;
        return;
      }
    }
    if (log.inLog) {
      // Just left the log: continue the orbit from where the log camera is, so there is no jump.
      log.inLog = false;
      const o = log.tmp.copy(log.pos).sub(log.look);
      rig.tgt.copy(log.look);
      rig.R = o.length();
      rig.ph = Math.min(2.7, Math.max(0.45, Math.acos(Math.max(-1, Math.min(1, o.y / rig.R)))));
      rig.th = Math.atan2(o.x, o.z);
      rig.vth = rig.vph = 0;
      rig.intro = false;
      rig.idle = 0;
    }
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

    if (hud.el && getTheme() === 'light' && performance.now() - hud.last > 120) {
      hud.last = performance.now();
      const deg = (r: number) => num(((r * 180) / Math.PI) % 360);
      const t = rig.tgt, p = cam.position;
      hud.el.innerHTML = `<b>camera</b> r ${num(rig.R)} · θ ${deg(rig.th)}° · φ ${deg(rig.ph)}° · fov ${cam.fov}°`
        + `<br><b>pos</b> <i class="ax">${num(p.x)}</i> <i class="ay">${num(p.y)}</i> <i class="az">${num(p.z)}</i>`
        + ` · <b>target</b> <i class="ax">${num(t.x)}</i> <i class="ay">${num(t.y)}</i> <i class="az">${num(t.z)}</i>`;
    }
  }, -50);

  return null;
}
