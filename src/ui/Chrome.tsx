import { useEffect, useState } from 'react';
import { BLUE, BYID, CATS, GOLD } from '../data/projects';
import { onToast } from '../lib/events';
import { actions, useAppState } from '../state';

/** Where you are on the map, like a path: "HOME", "HOME / MOBILE", then "MOBILE / Wichu" once a star is picked. Earlier parts go back to that level. */
export function Crumb() {
  const focus = useAppState(s => s.focus);
  const sel = useAppState(s => s.sel);
  const p = sel ? BYID[sel] : null;
  const cat = focus ? CATS[focus].label.toUpperCase() : '';
  return (
    <nav className="crumb" aria-label="Map location">
      {!focus ? <b aria-current="location">HOME</b> : p ? (
        <>
          <button type="button" onClick={() => actions.showList(focus)}>{cat}</button>
          <span className="sep">/</span>
          <b className="crumb-star" aria-current="location">{p.name}</b>
        </>
      ) : (
        <>
          <button type="button" onClick={() => actions.home()}>HOME</button>
          <span className="sep">/</span>
          <b aria-current="location">{cat}</b>
        </>
      )}
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
