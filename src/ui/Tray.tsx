import { useEffect, useRef, useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme, toggleTheme } from '../lib/theme';
import { Ambience } from './Ambience';

const GAP = 14;

/**
 * Bottom-right corner: the light/dark switch and the ambience player.
 * It stays in the corner, and only slides left (toward the map) while the right dock's panels reach down into it.
 */
export function Tray({ root }: { root: HTMLElement }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current, dock = root.querySelector<HTMLElement>('.dock-r');
    if (!el || !dock) return;
    let last = -1;
    // Panels collapse, move and animate in many ways; a light poll is simpler and cheaper than tracking each one.
    const check = () => {
      let right = GAP;
      if (matchMedia('(min-width: 761px)').matches) {
        const d = dock.getBoundingClientRect(), t = el.getBoundingClientRect();
        const top = innerHeight - GAP - t.height - 8;
        const panels = [...dock.querySelectorAll<HTMLElement>(':scope > .p')];
        const bottom = Math.min(d.bottom, Math.max(0, ...panels.map(p => p.getBoundingClientRect().bottom)));
        if (d.width > 0 && bottom > top) right = innerWidth - d.left + 10;
      }
      if (right !== last) { last = right; el.style.setProperty('--tray-r', right + 'px'); }
    };
    check();
    const id = window.setInterval(check, 250);
    addEventListener('resize', check);
    return () => { clearInterval(id); removeEventListener('resize', check); };
  }, [root]);

  const flip = (e: React.MouseEvent) => {
    // Grow the new theme from the center of the map (the gap between the docks), or from the button if it's hidden.
    const f = root.querySelector('.cs-focus')?.getBoundingClientRect();
    const o = f && f.width > 0 ? { x: f.left + f.width / 2, y: f.top + f.height / 2 } : { x: e.clientX, y: e.clientY };
    toggleTheme(o);
  };

  return (
    <div className="tray" ref={box}>
      <button type="button" className="tray-theme" onClick={flip} aria-label={theme === 'dark' ? 'Switch to light edit mode' : 'Switch to dark star chart'} aria-pressed={theme === 'light'}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          {theme === 'dark'
            ? <path d="M11.5 10.6A5 5 0 0 1 5.4 4.5a5 5 0 1 0 6.1 6.1Z" />
            : <><circle cx="8" cy="8" r="3" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" /></>}
        </svg>
      </button>
      <Ambience />
    </div>
  );
}
