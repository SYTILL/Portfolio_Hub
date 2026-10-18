import { useEffect, useRef, useState } from 'react';
import { MS, T } from '../config';
import { CASES } from '../data/cases';
import { LOG_FACTS, MISSIONS, REST_IDS, REST_MORE, TRACK_BY_ID, type Mission } from '../data/missions';
import { BYID, CATNO, CATS, CAT_KEYS, type CatKey } from '../data/projects';
import { logPlace, logSections } from '../lib/logScroll';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { actions, useAppState } from '../state';
import { enterMap } from './view';

const shotUrl = (project: string, file: string) => `${import.meta.env.BASE_URL}shots/${project}/${file}`;
const altOf = (project: string, file: string) => CASES[project]?.shots.find(s => s.file === file)?.alt ?? '';
const isCat = (f: string): f is CatKey => (CAT_KEYS as string[]).includes(f);

function Card({ m, no }: { m: Mission; no: number }) {
  return (
    <article className="card chart">
      <div className="m-head"><p className="m-no">Mission {String(no).padStart(2, '0')}</p><p className="m-meta">{m.meta}</p></div>
      <h2>{m.title}</h2>
      <p className="one">{m.one}</p>
      <span className="status">{m.status}</span>
      <dl className={`tiles${m.tiles.length === 3 ? ' three' : ''}`}>
        {m.tiles.map(([v, l]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
      </dl>
      {m.asOf && <p className="asof">{m.asOf}</p>}
      <div className="blk"><h3>{m.block.title}</h3><p>{m.block.body}</p></div>
      {m.shots && (
        <div className={`shots ${m.shots.kind}`}>
          {m.shots.files.map(f => <img key={f} src={shotUrl(m.shots!.project, f)} alt={altOf(m.shots!.project, f)} loading="lazy" decoding="async" />)}
        </div>
      )}
      {m.tracks && (
        <ol className="tracks" aria-label="Selected tracks">
          {m.tracks.map(id => {
            const t = TRACK_BY_ID[id];
            return <li key={id}><span className="no">{CATNO[id]}</span><span className="t">{t.name}</span><span className="g">{t.track!.genre} · {t.track!.length}</span></li>;
          })}
        </ol>
      )}
      {m.stack && <div className="stack">{m.stack.map(s => <span key={s}>{s}</span>)}</div>}
      <div className="links">
        {m.caseId && <button type="button" className="cta" onClick={() => actions.openCase(m.caseId!)}>Read the case file <span aria-hidden="true">→</span></button>}
        {m.links.map(([l, url], i) => (
          <a key={url} className={!m.caseId && i === 0 ? 'cta' : undefined} href={url} target="_blank" rel="noopener">{l} ↗</a>
        ))}
      </div>
    </article>
  );
}

const RAIL: [id: string, no: string, label: string][] = [
  ['log-intro', '00', 'Log start'],
  ...MISSIONS.map((m, i): [string, string, string] => [`log-${m.id}`, String(i + 1).padStart(2, '0'), m.title]),
  ['log-rest', String(MISSIONS.length + 1).padStart(2, '0'), 'The rest'],
  ['log-end', '∗', 'Star map'],
];

/**
 * The mission log: the default first view. It scrolls over the live star map; the camera (CameraRig) follows the scroll from
 * star to star, and the map's own highlights follow along here (the section nearest the middle of the screen is "open").
 * Scrolling on past the end, or the skip button, hands over to the full star map.
 */
export function MissionLog() {
  const view = useAppState(s => s.view);
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('log-intro');
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0);

  // Scroll: rail position and progress, and which star or constellation the map shows open.
  useEffect(() => {
    const el = box.current;
    if (!el || view !== 'log') return;
    let last = '';
    const onScroll = () => {
      const place = logPlace(logSections());
      if (!place) return;
      const s = place.k < 0.5 ? place.a : place.b, f = s.dataset.focus ?? 'intro';
      setActive(s.id);
      el.style.setProperty('--p', (Math.min(1, el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * 100).toFixed(1) + '%');
      if (f === last) return;
      last = f;
      if (BYID[f]) actions.select(f);
      else if (isCat(f)) actions.showList(f);
      else actions.home();
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }, [view]);

  // End of the log: scrolling (or dragging) on past the bottom fills the meter, then the map takes over.
  useEffect(() => {
    const el = box.current;
    if (!el || view !== 'log') return;
    const atEnd = () => el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    const set = (v: number) => {
      pullRef.current = Math.max(0, Math.min(1, v));
      setPull(pullRef.current);
      if (pullRef.current >= 1) { pullRef.current = 0; setPull(0); enterMap(); }
    };
    const wheel = (e: WheelEvent) => {
      if (atEnd() && e.deltaY > 0) set(pullRef.current + e.deltaY / 900);
      else if (e.deltaY < 0 && pullRef.current > 0) set(pullRef.current + e.deltaY / 600);
    };
    let ty: number | null = null;
    const tstart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const tmove = (e: TouchEvent) => {
      if (ty == null || !atEnd()) return;
      const dy = ty - e.touches[0].clientY;
      ty = e.touches[0].clientY;
      if (dy > 0) set(pullRef.current + dy / 360);
    };
    const decay = window.setInterval(() => { if (pullRef.current > 0 && !atEnd()) set(pullRef.current - 0.1); }, 120);
    el.addEventListener('wheel', wheel, { passive: true });
    el.addEventListener('touchstart', tstart, { passive: true });
    el.addEventListener('touchmove', tmove, { passive: true });
    return () => {
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('touchstart', tstart);
      el.removeEventListener('touchmove', tmove);
      clearInterval(decay);
    };
  }, [view]);

  // Coming back from the map starts the log from the top.
  useEffect(() => {
    if (view === 'log' && box.current && box.current.scrollTop > 0) box.current.scrollTo({ top: 0 });
  }, [view]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  const introDelay = (i: number) => ({ animationDelay: `${MS(T.crumb * 1000 + i * 140)}ms` });

  return (
    <div className="log" ref={box} inert={view !== 'log'} aria-hidden={view !== 'log'}>
      <div className="log-veil" aria-hidden="true" />
      <button type="button" className="log-skip" onClick={enterMap}>Skip to the star map <span aria-hidden="true">↘</span></button>

      <nav className="log-rail" aria-label="Mission log">
        <span className="fill" />
        {RAIL.map(([id, no, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'on' : undefined} onClick={e => { e.preventDefault(); go(id); }}>
            <b>{no}</b>{label}
          </a>
        ))}
      </nav>

      <section className="log-intro" id="log-intro" data-focus="intro">
        <div className="intro-in">
          <p className="eyebrow rise" style={introDelay(0)}>Cosmic Syntax · Mission log</p>
          <h1 className="rise" style={introDelay(1)}>Junsang Yoon,<br /><em>solo app developer.</em></h1>
          <p className="lede rise" style={introDelay(2)}>I take products from idea to store launch on my own: design, app, backend, payments and the launch itself.</p>
          <dl className="facts rise" style={introDelay(3)}>
            {LOG_FACTS.map(([v, l]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className="begin rise" style={introDelay(4)}>
            <button type="button" onClick={() => go(`log-${MISSIONS[0].id}`)}>Begin the log <i aria-hidden="true">↓</i></button>
            Scroll to fly from star to star.
          </p>
        </div>
      </section>

      {MISSIONS.map((m, i) => (
        <section key={m.id} id={`log-${m.id}`} className={m.side === 'r' ? 'r' : undefined} data-focus={m.focus}>
          <Card m={m} no={i + 1} />
        </section>
      ))}

      <section id="log-rest" className="c" data-focus="rest">
        <div className="rest chart">
          <p className="eyebrow">Mission {String(MISSIONS.length + 1).padStart(2, '0')} · The rest of the map</p>
          <h2>Smaller tools, work in progress, experiments</h2>
          <p>Everything else I've started since March 2026. Each one is a star on the map.</p>
          <div className="grid">
            {REST_IDS.map(id => {
              const p = BYID[id];
              return (
                <article className="mini" key={id}>
                  <div className="top"><span>{CATS[p.cat].label}</span><span>{CATNO[id]}</span></div>
                  <b>{p.name}</b><p>{p.one}</p>
                  <span className={`st${p.status === 'live' ? ' live' : ''}`}>{p.statusText}</span>
                </article>
              );
            })}
            <article className="mini">
              <div className="top"><span>Lab · Web · Mobile</span><span>+{REST_MORE}</span></div>
              <b>Prototypes and lab work</b>
              <p>A chart-pattern trading bot, an L-system tree generator, music theory lessons and more.</p>
              <span className="st">On the map</span>
            </article>
          </div>
        </div>
      </section>

      <section id="log-end" className="log-end" data-focus="map">
        <p className="eyebrow">End of log</p>
        <h2>That's the log. <em>Now the whole sky.</em></h2>
        <p>Every project and track is a star on the map behind this page. Keep scrolling to step into it.</p>
        <div className="pull" style={{ '--pull': `${Math.round(pull * 100)}%` } as React.CSSProperties}>
          <span>{pull > 0 ? 'Stepping into the map…' : 'Keep scrolling'}</span>
          <span className="meter"><i /></span>
        </div>
        <button type="button" className="enter" onClick={enterMap}>Open the star map <span aria-hidden="true">→</span></button>
      </section>
      <p className="log-foot">© 2026 Cosmic Syntax by Junsang Yoon</p>
    </div>
  );
}
