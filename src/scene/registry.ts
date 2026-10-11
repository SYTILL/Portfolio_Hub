import * as THREE from 'three';
import type { CatKey, Project } from '../data/projects';

// Per-frame facts shared between scene components (constellations → labels → camera picking).

export interface StarData { p: Project; base: number; k: number; kT: number; vis: number; life: number; order: number; seed: number }

export interface Sky {
  group: THREE.Group;
  stars: THREE.Sprite[];
  focus: CatKey | null;
  hot: string | null;
  hintCat: CatKey | null;
  focusAt: number;
  nameLife: (cat: CatKey) => number;
}
export const sky: { current: Sky | null } = { current: null };

/** Armillary rings this frame, for the edit-mode readouts: where each orbiting star is, and the ring's numbers. */
export interface RingInfo { pos: THREE.Vector3; R: number; omega: number; tilt: number; visible: boolean }
export const rings: RingInfo[] = [];

/** Numbers as shown in edit mode: one decimal, a real minus sign. */
export const num = (v: number, digits = 1) => (Math.abs(v) < 0.05 && digits === 1 ? 0 : v).toFixed(digits).replace('-', '−');

export type Box = [x0: number, y0: number, x1: number, y1: number];
/** Screen boxes of the constellation names this frame, for picking. */
export const nameBoxes: { k: CatKey; box: Box }[] = [];

const v = new THREE.Vector3();
export function toScreen(camera: THREE.Camera, size: { width: number; height: number }, world: THREE.Vector3) {
  v.copy(world).project(camera);
  return { x: (v.x * 0.5 + 0.5) * size.width, y: (-v.y * 0.5 + 0.5) * size.height, behind: v.z > 1 };
}
