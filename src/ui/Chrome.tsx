import { useEffect, useState } from 'react';
import { BLUE, CATS, GOLD } from '../data/projects';
import { onToast } from '../lib/events';
import { actions, useAppState } from '../state';

/** "STAR MAP / MOBILE" — where you are on the map; the first part goes back to the full map. */
export function Crumb() {
  const focus = useAppState(s => s.focus);
  return (
    <nav className="crumb" aria-label="Map location">
      <button type="button" disabled={!focus} onClick={() => actions.home()}>STAR MAP</button>
      <span className="sep">/</span>
      <b>{focus ? CATS[focus].label.toUpperCase() : 'ALL'}</b>
    </nav>
  );
}

export function Hint() {
  return (
    <p className="hint">
      <span><i style={{ background: GOLD }} />Shipped</span>
      <span><i style={{ background: BLUE }} />In progress · Lab</span>
      <span>Click a constellation name to see its stars · Drag to rotate · Ctrl + scroll to zoom</span>
    </p>
  );
}

export function Toast() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    let timer = 0;
    const off = onToast(m => {
      setMessage(m);
      clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(null), 2200);
    });
    return () => { off(); clearTimeout(timer); };
  }, []);
  return message ? <div className="toast" role="status">{message}</div> : null;
}
