import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG, T, clamp01 } from '../config';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { clock, since } from './clock';
import { rings as ringInfo } from './registry';
import { disposeTree, lineMat, sprite } from './util';

// Armillary sphere: three gold rings with degree ticks, each turning at its own speed with one star orbiting on it.
// On entry each ring grows out of the central star, one after another.
const RINGS = [
  { R: 50, tilt: [0, 0, 0], spin: 0.02, alpha: 0.12, orbit: { color: '#f3dfa8', speed: 0.22, phase: 0, size: 1.9 } },
  { R: 57, tilt: [0.41, 0, 0.2], spin: -0.03, alpha: 0.14, orbit: { color: '#f3dfa8', speed: -0.17, phase: 2.1, size: 2.4 } },
  { R: 45, tilt: [Math.PI / 2, 0.5, 0], spin: 0.016, alpha: 0.09, orbit: { color: '#a8c6ea', speed: 0.27, phase: 4.2, size: 1.9 } },
] as const;

export function Armillary() {
  const built = useMemo(() => {
    const root = new THREE.Group();
    const mats: [THREE.LineBasicMaterial, number][] = [];
    const rings = RINGS.map(def => {
      const holder = new THREE.Group();
      holder.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
      root.add(holder);
      const spinner = new THREE.Group();
      holder.add(spinner);

      const N = 256, circ = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; circ[i * 3] = Math.cos(a) * def.R; circ[i * 3 + 2] = Math.sin(a) * def.R; }
      const cg = new THREE.BufferGeometry();
      cg.setAttribute('position', new THREE.BufferAttribute(circ, 3));
      const m1 = lineMat(def.alpha);
      mats.push([m1, def.alpha]);
      spinner.add(new THREE.LineLoop(cg, m1));

      const ticks: number[] = [];
      for (let d = 0; d < 360; d += 5) {
        const a = (d * Math.PI) / 180, L = d % 30 === 0 ? 2.6 : 1, c = Math.cos(a), s = Math.sin(a);
        ticks.push(c * def.R, 0, s * def.R, c * (def.R + L), 0, s * (def.R + L));
      }
      const tg = new THREE.BufferGeometry();
      tg.setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3));
      const m2 = lineMat(def.alpha * 1.4);
      mats.push([m2, def.alpha * 1.4]);
      spinner.add(new THREE.LineSegments(tg, m2));

      const bead = sprite(def.orbit.color, 0);
      bead.scale.setScalar(def.orbit.size);
      holder.add(bead);
      return { holder, spinner, bead, def };
    });
    return { root, rings, mats };
  }, []);

  useEffect(() => () => disposeTree(built.root), [built]);

  useFrame(() => {
    const dt = clock.dt, t = clock.now, starts = T.rings;
    built.rings.forEach((r, i) => {
      const x = RM ? 1 : clamp01((since() - starts[i]) / T.ringDur);
      const k = 1 - Math.pow(1 - x, 3);
      r.holder.visible = k > 0.001;
      r.holder.scale.setScalar(Math.max(k, 0.001));
      if (!RM) r.spinner.rotation.y += r.def.spin * CFG.ringSpin * dt;
      r.bead.material.opacity = 0.95 * (RM ? 1 : clamp01((since() - starts[i] - T.ringDur * 0.7) / 0.5));
      const a = r.def.orbit.phase + (RM ? 1 : t * r.def.orbit.speed);
      r.bead.position.set(Math.cos(a) * r.def.R, 0, Math.sin(a) * r.def.R);
      const info = (ringInfo[i] ??= { pos: new THREE.Vector3(), R: r.def.R, omega: 0, tilt: (r.def.tilt[0] * 180) / Math.PI, visible: false });
      r.bead.getWorldPosition(info.pos);
      info.omega = r.def.orbit.speed * CFG.speed;
      info.visible = r.holder.visible && r.bead.material.opacity > 0.5;
    });
    built.mats.forEach(([m, base]) => { m.opacity = base * CFG.ringAlpha; });
  });

  return <primitive object={built.root} />;
}
