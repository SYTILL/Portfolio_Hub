import { useEffect, useRef } from 'react';
import { BYID, CATNO, CATS, CAT_KEYS, PROJECTS, TAG, newest, ym, type Project } from '../../data/projects';
import { actions, useAppState } from '../../state';

// Swapping list and details unmounts the focused button; when that drops focus to <body>, carry it to the new view.
const focusIfLost = (el: HTMLElement | null | undefined) => {
  if (el && (document.activeElement === document.body || !document.activeElement)) el.focus({ preventScroll: true });
};

const GROUPS = CAT_KEYS.map(k => ({ k, list: PROJECTS.filter(p => p.cat === k).sort(newest) }));

// With a star selected, its details replace the list; "back" (or the chip of its constellation) returns to the list.
function Detail({ p }: { p: Project }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => focusIfLost(title.current), [p.id]);
  return (
    <div className="pj-view" data-detail>
      <button type="button" className="d-back" onClick={() => actions.back()}>
        <span aria-hidden="true">‹</span> {CATS[p.cat].label} projects
      </button>
      <p className="d-kicker">{CATS[p.cat].label} · {ym(p.start)}<span className="no">{CATNO[p.id]}</span></p>
      <h3 className="d-name" ref={title} tabIndex={-1}>{p.name}</h3>
      <p className="d-one">{p.one}</p>
      {p.points && <ul className="d-pts">{p.points.map(x => <li key={x}>{x}</li>)}</ul>}
      <div className="tags">
        {p.stack.map(s => <span key={s}>{s}</span>)}
        <span className={`st${p.status === 'live' ? ' live' : ''}`}>{p.statusText}</span>
      </div>
      {p.case && (
        <button type="button" className="d-case" onClick={() => actions.openCase(p.id)}>
          Open case file <span aria-hidden="true">▸</span>
        </button>
      )}
      {p.links && (
        <div className="d-lk">
          {p.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener">{label} ↗</a>)}
        </div>
      )}
    </div>
  );
}

export function Projects() {
  const focus = useAppState(s => s.focus);
  const sel = useAppState(s => s.sel);
  const hover = useAppState(s => s.hover);
  const p = sel ? BYID[sel] : null;
  const rows = useRef<HTMLDivElement>(null), last = useRef<string | null>(null);
  useEffect(() => {
    if (sel) last.current = sel;
    else if (last.current) focusIfLost(rows.current?.querySelector<HTMLElement>(`[data-id="${last.current}"]`));
  }, [sel]);
  return (
    <>
      <div className="chips" role="group" aria-label="Constellations">
        <button type="button" className="chip" aria-pressed={!focus} onClick={() => actions.home()}>All</button>
        {CAT_KEYS.map(k => (
          <button key={k} type="button" className="chip" aria-pressed={focus === k} onClick={() => actions.showList(k)}>{CATS[k].label}</button>
        ))}
      </div>
      {p ? <Detail p={p} key={p.id} /> : (
        <div className="rows pj-view" ref={rows}>
          {GROUPS.map(({ k, list }) => (
            <div className="grp" key={k} hidden={!!focus && focus !== k}>
              <h3 className="grp-h">{CATS[k].label}<span>{list.length} projects</span></h3>
              {list.map(q => (
                <button
                  key={q.id}
                  data-id={q.id}
                  type="button"
                  className={`row${hover === q.id ? ' is-hot' : ''}`}
                  onClick={() => { actions.hover(null); actions.select(q.id); }}
                  onPointerEnter={() => actions.hover(q.id)}
                  onPointerLeave={() => actions.hover(null)}
                  onFocus={() => actions.hover(q.id)}
                  onBlur={() => actions.hover(null)}
                >
                  <span className="no">{CATNO[q.id]}</span>
                  <span className="n">{q.name}</span>
                  <span className={`tag${q.status === 'live' ? ' live' : ''}`}>{TAG[q.status]}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
