import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { getTheme } from '../lib/theme';
import { clock } from './clock';
import { disposeTree } from './util';

// Light ("edit mode") only: an XZ ground grid and X/Y/Z axes through the origin, like a 3D editor viewport.
// The page is color-inverted in light mode, so everything here is drawn in its dark-mode (light) colors
// and comes out as dark lines on the light page. Fades in and out with the theme.
const SIZE = 120, DIV = 24, AXIS = 64;
const AXES = [
  { dir: [1, 0, 0], color: '#ff7b7b', label: 'X' },
  { dir: [0, 1, 0], color: '#86e08a', label: 'Y' },
  { dir: [0, 0, 1], color: '#7fa6ff', label: 'Z' },
] as const;

function letter(text: string, color: string) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d')!;
  g.font = '600 40px "EB Garamond", Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(text, 32, 34);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
  s.scale.setScalar(4);
  return s;
}

export function EditGrid() {
  const built = useMemo(() => {
    const root = new THREE.Group();
    const fade: [THREE.Material & { opacity: number }, number][] = [];

    const grid = new THREE.GridHelper(SIZE, DIV, '#c3cbdb', '#c3cbdb');
    const gm = grid.material as THREE.LineBasicMaterial;
    gm.transparent = true; gm.depthWrite = false; gm.opacity = 0;
    fade.push([gm, 0.22]);
    root.add(grid);

    for (const a of AXES) {
      const end = new THREE.Vector3(...a.dir).multiplyScalar(AXIS);
      const g = new THREE.BufferGeometry().setFromPoints([end.clone().negate(), end]);
      const m = new THREE.LineBasicMaterial({ color: a.color, transparent: true, depthWrite: false, opacity: 0 });
      fade.push([m, 0.85]);
      root.add(new THREE.Line(g, m));
      const tag = letter(a.label, a.color);
      tag.position.copy(end).multiplyScalar(1.07);
      fade.push([tag.material, 0.95]);
      root.add(tag);
    }
    root.visible = false;
    return { root, fade, k: getTheme() === 'light' ? 1 : 0 };
  }, []);

  useEffect(() => () => disposeTree(built.root), [built]);

  useFrame(() => {
    const want = getTheme() === 'light' ? 1 : 0;
    built.k = RM ? want : built.k + (want - built.k) * Math.min(1, clock.dt * 3);
    if (Math.abs(built.k - want) < 0.002) built.k = want;
    built.root.visible = built.k > 0;
    for (const [m, a] of built.fade) m.opacity = a * built.k;
  });

  return <primitive object={built.root} />;
}
