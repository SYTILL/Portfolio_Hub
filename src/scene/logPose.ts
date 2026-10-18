import * as THREE from 'three';
import { BYID, CAT_KEYS, type CatKey } from '../data/projects';
import { CENTERS, POS, hash } from './util';

// Camera poses for the mission log. A section's data-focus names what it shows:
// a project id (fly to its star), a constellation key (frame the whole constellation),
// or 'intro' / 'rest' / 'map' (the whole map turning slowly, at different distances).
// The target lands on the side away from the card: the look point shifts sideways, or down on narrow screens.
const UP = new THREE.Vector3(0, 1, 0), fwd = new THREE.Vector3(), right = new THREE.Vector3(), off = new THREE.Vector3();
const isCat = (f: string): f is CatKey => (CAT_KEYS as string[]).includes(f);

// introShift (0..1): on first load the map starts centred and slides aside as the intro text comes in.
export function logPose(focus: string, cardRight: boolean, narrow: boolean, t: number, pos: THREE.Vector3, look: THREE.Vector3, introShift = 1) {
  const side = cardRight ? 1 : -1;
  const frame = (target: THREE.Vector3, shift: number) => {
    pos.copy(target).add(off);
    fwd.copy(off).negate().normalize();
    right.crossVectors(fwd, UP).normalize();
    look.copy(target);
    if (narrow) look.y -= shift * 0.55;
    else look.addScaledVector(right, shift * side);
  };
  if (BYID[focus]) {
    const a = ((hash(focus) % 100) / 100) * 1.6 - 0.8;
    off.set(Math.sin(a) * 26, 5, Math.cos(a) * 26);
    frame(POS[focus], 8);
  } else if (isCat(focus)) {
    off.set(18, 10, 40);
    frame(new THREE.Vector3(...CENTERS[focus]), 12);
  } else {
    const a = 0.5 + t * 0.03, R = focus === 'map' ? 105 : focus === 'rest' ? 150 : 125;
    pos.set(Math.sin(a) * R, focus === 'map' ? 30 : 16, Math.cos(a) * R);
    look.set(0, 0, 0);
    if (focus === 'intro') {
      if (narrow) look.y = -26 * introShift;
      else {
        fwd.copy(pos).negate().normalize();
        right.crossVectors(fwd, UP).normalize();
        look.addScaledVector(right, -42 * introShift);
      }
    }
  }
}
