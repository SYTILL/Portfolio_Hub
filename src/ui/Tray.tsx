import { useState, useSyncExternalStore } from 'react';
import { MS, T } from '../config';
import { storage } from '../lib/storage';
import { getTheme, subscribeTheme, toggleTheme } from '../lib/theme';
import { actions } from '../state';
import { Ambience } from './Ambience';

const TRIED = 'cs-theme-tried';

/**
 * Bottom-left corner: the light/dark switch and, a little apart, the ambience player.
 * On the map, a third chip goes back to the mission log.
 * Until the visitor has tried the switch once, a hand-written "try this" note points at it.
 */
export function Tray({ root }: { root: HTMLElement }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const [tried, setTried] = useState(() => !!storage.get<boolean>(TRIED));

  const flip = (e: React.MouseEvent) => {
    // Grow the new theme from the center of the map (the gap between the docks), or from the button if it's hidden.
    const f = root.querySelector('.cs-focus')?.getBoundingClientRect();
    const o = f && f.width > 0 ? { x: f.left + f.width / 2, y: f.top + f.height / 2 } : { x: e.clientX, y: e.clientY };
    toggleTheme(o);
    if (!tried) { setTried(true); storage.set(TRIED, true); }
  };

  return (
    <div className="tray">
      {!tried && (
        <span className="tray-try" aria-hidden="true" style={{ animationDelay: `${MS(T.hint * 1000 + 600)}ms` }}>
          <svg viewBox="0 0 30 24"><path d="M27 6C17 5 9.5 10 8 19.5" /><path d="M3.8 15.2 8 20l4.2-4.3" /></svg>
          try this
        </span>
      )}
      <button type="button" className="tray-theme" onClick={flip} aria-label={theme === 'dark' ? 'Switch to light edit mode' : 'Switch to dark star chart'} aria-pressed={theme === 'light'}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          {theme === 'dark'
            ? <path d="M7.08 2.58A5.5 5.5 0 1 0 13.42 8.92A4.5 4.5 0 0 1 7.08 2.58Z" />
            : <><circle cx="8" cy="8" r="3" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" /></>}
        </svg>
      </button>
      <Ambience />
      <button type="button" className="tray-log" onClick={() => actions.setView('log')}><span aria-hidden="true">↑</span> Mission log</button>
    </div>
  );
}
