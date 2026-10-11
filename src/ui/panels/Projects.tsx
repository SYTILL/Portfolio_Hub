import { useEffect, useRef } from 'react';
import { BYID, CATNO, CATS, CAT_KEYS, PROJECTS, TAG, newest, ym, type Project } from '../../data/projects';
import { ARTIST } from '../../data/tracks';
import { duckAmbience } from '../../lib/ambience';
import { embedUrl, loadWidgetApi } from '../../lib/soundcloud';
import { actions, useAppState } from '../../state';

// Swapping list and details unmounts the focused button; when that drops focus to <body>, carry it to the new view.
const focusIfLost = (el: HTMLElement | null | undefined) => {
  if (el && (document.activeElement === document.body || !document.activeElement)) el.focus({ preventScroll: true });
};

const GROUPS = CAT_KEYS.map(k => ({ k, list: PROJECTS.filter(p => p.cat === k).sort(newest) }));

// SoundCloud's player for a track. Playing it pauses the ambience; pausing, finishing or leaving brings it back.
function TrackPlayer({ url, name }: { url: string; name: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    let alive = true;
    loadWidgetApi().then(SC => {
      if (!alive || !frame.current) return;
      const w = SC.Widget(frame.current);
      w.bind(SC.Widget.Events.PLAY, () => duckAmbience(true));
      w.bind(SC.Widget.Events.PAUSE, () => duckAmbience(false));
      w.bind(SC.Widget.Events.FINISH, () => duckAmbience(false));
    }).catch(() => {});
    return () => { alive = false; duckAmbience(false); };
  }, [url]);
  return <iframe ref={frame} className="sc-player" title={`${name} on SoundCloud`} src={embedUrl(url)} allow="autoplay; encrypted-media" loading="lazy" />;
}

// With a star selected, its details replace the list; "back" (or the chip of its constellation) returns to the list.
function Detail({ p }: { p: Project }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => focusIfLost(title.current), [p.id]);
  return (
    <div className="pj-view" data-detail>
      <button type="button" className="d-back" onClick={() => actions.back()}>
        <span aria-hidden="true">‹</span> {CATS[p.cat].label} {CATS[p.cat].unit}
      </button>
      <p className="d-kicker">{CATS[p.cat].label} · {ym(p.start)}<span className="no">{CATNO[p.id]}</span></p>
      <h3 className="d-name" ref={title} tabIndex={-1}>{p.name}</h3>
      <p className="d-one">{p.track ? <>{p.one} · as <a href={ARTIST.url} target="_blank" rel="noopener">{ARTIST.name}</a></> : p.one}</p>
      {p.track && <TrackPlayer url={p.track.url} name={p.name} />}
      {p.points && <ul className="d-pts">{p.points.map(x => <li key={x}>{x}</li>)}</ul>}
      {!p.track && (
        <div className="tags">
          {p.stack.map(s => <span key={s}>{s}</span>)}
          <span className={`st${p.status === 'live' ? ' live' : ''}`}>{p.statusText}</span>
        </div>
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
              <h3 className="grp-h">{CATS[k].label}<span>{list.length} {CATS[k].unit}</span></h3>
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
                  <span className={`tag${q.status === 'live' ? ' live' : ''}`}>{q.track ? q.track.genre : TAG[q.status]}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
