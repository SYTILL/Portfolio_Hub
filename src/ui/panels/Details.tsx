import { BYID, CATNO, CATS, ym } from '../../data/projects';
import { useAppState } from '../../state';

export function Details() {
  const sel = useAppState(s => s.sel);
  const p = sel ? BYID[sel] : null;
  return (
    <div data-detail aria-live="polite">
      {p ? (
        <>
          <p className="d-kicker">{CATS[p.cat].label} · {ym(p.start)}<span className="no">{CATNO[p.id]}</span></p>
          <h3 className="d-name">{p.name}</h3>
          <p className="d-one">{p.one}</p>
          {p.points && <ul className="d-pts">{p.points.map(x => <li key={x}>{x}</li>)}</ul>}
          <div className="tags">
            {p.stack.map(s => <span key={s}>{s}</span>)}
            <span className={`st${p.status === 'live' ? ' live' : ''}`}>{p.statusText}</span>
          </div>
          {p.links && (
            <div className="d-lk">
              {p.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener">{label} ↗</a>)}
            </div>
          )}
        </>
      ) : (
        <p className="d-empty">Open a constellation and pick a star to see the details here, or choose a project from the list.</p>
      )}
    </div>
  );
}
