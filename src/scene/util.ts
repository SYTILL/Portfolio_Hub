import * as THREE from 'three';
import { BYID, CAT_KEYS, PROJECTS, byStart, type CatKey } from '../data/projects';
import { GOLD } from '../data/projects';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

let GLOW: THREE.CanvasTexture | null = null;
/** Soft round glow shared by every sprite. Never disposed: it is reused across remounts. */
export function glowTex() {
  if (GLOW) return GLOW;
  const s = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.14, 'rgba(255,255,255,.85)');
  gr.addColorStop(0.34, 'rgba(255,255,255,.22)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  GLOW = new THREE.CanvasTexture(cv);
  GLOW.colorSpace = THREE.SRGBColorSpace;
  return GLOW;
}

export const sprite = (color: THREE.ColorRepresentation, opacity = 1) =>
  new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(color), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));

export const lineMat = (opacity: number) =>
  new THREE.LineBasicMaterial({ color: new THREE.Color(GOLD), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });

/** Frees geometries and materials under obj (the shared glow texture is kept). */
export function disposeTree(obj: THREE.Object3D) {
  obj.traverse(o => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    mats.forEach(m => m.dispose());
  });
}

// Constellation centers, and each project's position in a loose ring around its center.
export const CENTERS: Record<CatKey, [number, number, number]> = { mobile: [-24, 7, -6], desktop: [22, 10, 4], web: [6, -15, -10], lab: [-14, -13, 14], music: [4, 18, -22] };
export const POS: Record<string, THREE.Vector3> = (() => {
  const pos: Record<string, THREE.Vector3> = {};
  for (const cat of CAT_KEYS) {
    const list = PROJECTS.filter(p => p.cat === cat).sort(byStart);
    const [cx, cy, cz] = CENTERS[cat];
    list.forEach((p, i) => {
      const r = rng(hash(p.id));
      const a = (i / list.length) * Math.PI * 2 + r() * 0.6;
      const rad = 6 + r() * 5.5;
      pos[p.id] = new THREE.Vector3(cx + Math.cos(a) * rad, cy + (r() - 0.5) * 8, cz + Math.sin(a) * rad);
    });
  }
  return pos;
})();
export const catOf = (id: string) => BYID[id].cat;
