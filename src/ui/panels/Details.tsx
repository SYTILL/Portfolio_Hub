import { useEffect, useRef } from 'react';
import { CONSTELLATIONS, MAP_INTRO } from '../../data/constellations';
import { BYID, CATNO, CATS, CAT_KEYS, PROJECTS, ym, type CatKey, type Project } from '../../data/projects';
import { ARTIST } from '../../data/tracks';
import { duckAmbience } from '../../lib/ambience';
import { embedUrl, loadWidgetApi } from '../../lib/soundcloud';
import { actions, useAppState } from '../../state';

const COUNT = Object.fromEntries(CAT_KEYS.map(k => [k, PROJECTS.filter(p => p.cat === k).length])) as Record<CatKey, number>;

// Details follows the crumb: the whole map, an open constellation, or a selected star.
export function Details() {
  const focus = useAppState(s => s.focus);
  const sel = useAppState(s => s.sel);
  const p = sel ? BYID[sel] : null;
  return (
    <div className="dt" aria-live="polite">
      {p ? <Star p={p} key={p.id} /> : focus ? <Constellation k={focus} key={focus} /> : <Overview />}
    </div>
  );
}

function Overview() {
  return (
    <div className="dt-view">
      <p className="d-kicker">The star map</p>
      <p className="dt-intro">{MAP_INTRO}</p>
      <ul className="dt-cons">
        {CAT_KEYS.map(k => (
          <li key={k}>
            <button type="button" onClick={() => actions.showList(k)}>
              <b>{CATS[k].label}</b><span>{COUNT[k]} {CATS[k].unit}</span>
              <small>{CONSTELLATIONS[k].line}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Constellation({ k }: { k: CatKey }) {
  const info = CONSTELLATIONS[k];
  return (
    <div className="dt-view">
      <p className="d-kicker">Constellation<span className="no">{COUNT[k]} {CATS[k].unit}</span></p>
      <h3 className="d-name">{CATS[k].label}</h3>
      <p className="d-one">{info.line}</p>
      {info.about.map(t => <p className="dt-p" key={t}>{t}</p>)}
      {info.links && <div className="d-lk">{info.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener">{label} ↗</a>)}</div>}
      <p className="dt-hint">Pick a star on the map or in Projects to see it here.</p>
    </div>
  );
}

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

function Star({ p }: { p: Project }) {
  return (
    <div className="dt-view">
      <button type="button" className="d-back" onClick={() => actions.back()}>
        <span aria-hidden="true">‹</span> {CATS[p.cat].label}
      </button>
      <p className="d-kicker">{CATS[p.cat].label} · {ym(p.start)}<span className="no">{CATNO[p.id]}</span></p>
      <h3 className="d-name">{p.name}</h3>
      <p className="d-one">{p.track ? <>{p.one} · as <a href={ARTIST.url} target="_blank" rel="noopener">{ARTIST.name}</a></> : p.one}</p>
      {p.track && <TrackPlayer url={p.track.url} name={p.name} />}
      {p.role && <p className="d-role">{p.role}</p>}
      {p.metrics && (
        <div className="d-metrics">
          <dl>
            {p.metrics.items.map(([v, label]) => <div key={label}><dt>{label}</dt><dd>{v}</dd></div>)}
          </dl>
          {p.metrics.notes?.map(n => <p className="d-note" key={n}>{n}</p>)}
          <p className="d-asof">As of {p.metrics.asOf}</p>
        </div>
      )}
      {!p.metrics && p.points && <ul className="d-pts">{p.points.map(x => <li key={x}>{x}</li>)}</ul>}
      {!p.track && (
        <div className="tags">
          {p.stack.map(s => <span key={s}>{s}</span>)}
          <span className={`st${p.status === 'live' ? ' live' : ''}`}>{p.statusText}</span>
        </div>
      )}
      {p.links && <div className="d-lk">{p.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener">{label} ↗</a>)}</div>}
    </div>
  );
}
