import { useEffect, useState } from 'react';
import { BLUE, BYID, CATS, GOLD } from '../data/projects';
import { onToast } from '../lib/events';
import { actions, useAppState } from '../state';

const Sep = () => <span className="sep" aria-hidden="true">/</span>;

/** Where you are on the map, like a path: STAR MAP / HOME, STAR MAP / MOBILE, STAR MAP / MOBILE / BEONYEOK. Earlier parts go back to that level. */
export function Crumb() {
  const focus = useAppState(s => s.focus);
  const sel = useAppState(s => s.sel);
  const p = sel ? BYID[sel] : null;
  return (
    <nav className="crumb" aria-label="Map location">
      {focus ? <button type="button" className="crumb-root" onClick={() => actions.home()}>STAR MAP</button> : <b className="crumb-root">STAR MAP</b>}
      <Sep />
      {!focus ? <b aria-current="location">HOME</b> : p ? (
        <>
          <button type="button" onClick={() => actions.showList(focus)}>{CATS[focus].label.toUpperCase()}</button>
          <Sep />
          <b aria-current="location">{p.name.toUpperCase()}</b>
        </>
      ) : <b aria-current="location">{CATS[focus].label.toUpperCase()}</b>}
    </nav>
  );
}

export function Hint() {
  return (
    <p className="hint">
      <span><i style={{ background: GOLD }} />Shipped</span>
      <span><i style={{ background: BLUE }} />In progress · Lab</span>
      <span>Click a constellation name to see its stars · Right-click to go back · Drag to rotate · Ctrl + scroll to zoom</span>
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
