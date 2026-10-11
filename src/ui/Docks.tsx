import { useLayoutEffect, useMemo, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { PANELS, PANEL_KEYS, wireDocks, type PanelKey } from './wireDocks';
import { About } from './panels/About';
import { Summary } from './panels/Summary';
import { LaunchLog } from './panels/LaunchLog';
import { Projects } from './panels/Projects';
import { Details } from './panels/Details';
import { Terminal } from './panels/Terminal';

const BODIES: Record<PanelKey, ComponentType> = { id: About, stats: Summary, launch: LaunchLog, proj: Projects, detail: Details, term: Terminal };

function PanelFrame({ k }: { k: PanelKey }) {
  const { title } = PANELS[k], Body = BODIES[k];
  return (
    <>
      <header className="ph">
        <button type="button" className="grip" aria-label={`Move the ${title} panel. Drag it, or use the arrow keys.`} />
        <h2 className="pt"><span>{title}</span></h2>
        {/* aria-expanded and aria-label are set by wireDocks when the panel collapses */}
        <button type="button" className="tg" aria-controls={`pb-${k}`} />
      </header>
      <div className="pb-wrap" id={`pb-${k}`}>
        <div className="pb"><div className="pb-in"><Body /></div></div>
      </div>
    </>
  );
}

export function Docks({ root, left, right }: { root: HTMLDivElement; left: HTMLDivElement; right: HTMLDivElement }) {
  // One stable <section> per panel; wireDocks moves these between docks, React renders into them.
  const hosts = useMemo(() => {
    const out = {} as Record<PanelKey, HTMLElement>;
    for (const k of PANEL_KEYS) {
      const s = document.createElement('section');
      s.className = 'p';
      s.dataset.panel = k;
      s.setAttribute('aria-label', PANELS[k].title);
      out[k] = s;
    }
    return out;
  }, []);

  useLayoutEffect(() => wireDocks(root, left, right, hosts), [root, left, right, hosts]);

  return <>{PANEL_KEYS.map(k => createPortal(<PanelFrame k={k} />, hosts[k], k))}</>;
}
