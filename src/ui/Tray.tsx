import { useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme, toggleTheme } from '../lib/theme';
import { Ambience } from './Ambience';

/** Bottom-left corner: the light/dark switch and, a little apart, the ambience player. */
export function Tray({ root }: { root: HTMLElement }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);

  const flip = (e: React.MouseEvent) => {
    // Grow the new theme from the center of the map (the gap between the docks), or from the button if it's hidden.
    const f = root.querySelector('.cs-focus')?.getBoundingClientRect();
    const o = f && f.width > 0 ? { x: f.left + f.width / 2, y: f.top + f.height / 2 } : { x: e.clientX, y: e.clientY };
    toggleTheme(o);
  };

  return (
    <div className="tray">
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
