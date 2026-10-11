import { useEffect, useRef, useState } from 'react';
import { MS } from '../config';
import { BYID, CATNO, CATS, type Shot } from '../data/projects';
import { REDUCED_MOTION } from '../lib/storage';
import { actions, useAppState } from '../state';
import { starTile } from './panelStars';

const shotUrl = (id: string, file: string) => `${import.meta.env.BASE_URL}shots/${id}/${file}`;

function Figure({ id, shot, onOpen }: { id: string; shot: Shot; onOpen: () => void }) {
  return (
    <button type="button" className={`shot ${shot.kind}`} onClick={onOpen} aria-label={`Enlarge: ${shot.alt}`}>
      {shot.kind === 'window' && <span className="shot-bar" aria-hidden="true"><i /><i /><i /></span>}
      <img src={shotUrl(id, shot.file)} alt={shot.alt} loading="lazy" decoding="async" />
    </button>
  );
}

/** The wide "case file" over the map: screenshots, why, what was built, hard parts, results. */
export function CaseFile() {
  const caseId = useAppState(s => s.caseId);
  const [zoom, setZoom] = useState<Shot | null>(null);
  const panel = useRef<HTMLElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const zoomed = useRef(false);
  useEffect(() => { zoomed.current = !!zoom; }, [zoom]);
  const p = caseId ? BYID[caseId] : null, c = p?.case;

  useEffect(() => {
    if (!caseId) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus({ preventScroll: true });
    if (panel.current) {
      panel.current.style.setProperty('--p-stars', starTile(7777, 340));
      panel.current.style.setProperty('--p-tile', '340px');
      panel.current.scrollTop = 0;
      if (!REDUCED_MOTION) panel.current.animate([{ opacity: 0, transform: 'translateY(18px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: MS(320), easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (zoomed.current) setZoom(null);
      else actions.closeCase();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      setZoom(null);
      document.removeEventListener('keydown', onKey);
      (opener.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [caseId]);

  if (!p || !c) return null;
  return (
    <div className="case-scrim" onClick={e => { if (e.target === e.currentTarget) actions.closeCase(); }}>
      <article className="case" ref={panel} role="dialog" aria-modal="true" aria-labelledby="case-title">
        <header className="case-head">
          <p className="case-kicker">Case file · {CATNO[p.id]}</p>
          <button type="button" className="case-x" ref={closeBtn} onClick={() => actions.closeCase()} aria-label="Close case file">✕</button>
        </header>
        <div className="case-body">
          <div className="case-title">
            <h2 id="case-title">{p.name}</h2>
            <p className="d-one">{p.one}</p>
            <p className="case-meta">
              <span>{CATS[p.cat].label}</span><span>{c.period}</span><span>{c.role}</span>
              <span className={p.status === 'live' ? 'live' : 'wip'}>{p.statusText}</span>
            </p>
          </div>

          <div className="gallery" role="list" aria-label="Screenshots">
            {c.shots.map(s => <div role="listitem" key={s.file}><Figure id={p.id} shot={s} onOpen={() => setZoom(s)} /></div>)}
          </div>

          <section className="case-sec"><h3>Why</h3><p>{c.why}</p></section>
          <section className="case-sec"><h3>What I built</h3><ul className="d-pts">{c.built.map(b => <li key={b}>{b}</li>)}</ul></section>
          <section className="case-sec">
            <h3>Hard parts</h3>
            {c.hard.map(h => <div className="hard" key={h.title}><h4>{h.title}</h4><p>{h.body}</p></div>)}
          </section>
          <section className="case-sec"><h3>Result</h3><ul className="d-pts">{c.result.map(r => <li key={r}>{r}</li>)}</ul></section>

          <div className="tags">{p.stack.map(s => <span key={s}>{s}</span>)}</div>
          {p.links && <div className="d-lk">{p.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener">{label} ↗</a>)}</div>}
        </div>
      </article>
      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={() => setZoom(null)}>
          <img src={shotUrl(p.id, zoom.file)} alt={zoom.alt} />
        </div>
      )}
    </div>
  );
}
