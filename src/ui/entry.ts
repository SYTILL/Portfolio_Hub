import { MS, T } from '../config';
import { REDUCED_MOTION } from '../lib/storage';

// Panels, the bottom-left tray, the map path and the hint join the entry sequence (timing in config T).
// quick: entering the map from the mission log, so the panels come in right away and the tray (already shown) stays put.
export function playEntry(root: HTMLElement, quick = false) {
  if (REDUCED_MOTION) return;
  const P = quick ? 0.05 : T.panels, C = quick ? 0.15 : T.crumb, H = quick ? 0.4 : T.hint;
  const EASE = 'cubic-bezier(.2,.8,.2,1)', narrow = root.clientWidth < 760;
  [root.querySelector('.dock-l'), root.querySelector('.dock-r')].forEach((dock, side) => {
    if (!dock) return;
    [...dock.querySelectorAll<HTMLElement>(':scope > .p')].forEach((p, i) => {
      const from = narrow ? 'translateY(18px)' : `translateX(${side ? 32 : -32}px)`;
      const delay = P + (narrow ? side * 3 + i : i) * T.panelStep + (narrow ? 0 : side * 0.06);
      p.animate(
        [{ opacity: 0, transform: from, filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: MS(700), delay: MS(delay * 1000), easing: EASE, fill: 'backwards' },
      );
    });
  });
  // The theme switch and the player rise in right after the left dock's panels, one after the other.
  if (!quick) {
    const after = P + (root.querySelector('.dock-l')?.querySelectorAll(':scope > .p').length ?? 0) * T.panelStep;
    root.querySelectorAll<HTMLElement>('.tray > .tray-theme, .tray > .amb').forEach((el, i) => {
      el.animate(
        [{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: MS(700), delay: MS((after + i * T.panelStep) * 1000), easing: EASE, fill: 'backwards' },
      );
    });
  }
  root.querySelector('.crumb')?.animate([{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: MS(600), delay: MS(C * 1000), easing: EASE, fill: 'backwards' });
  root.querySelectorAll('.hint, .colophon').forEach(el => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: MS(900), delay: MS(H * 1000), fill: 'backwards' }));
}
