import { CATNO, CATS, CAT_KEYS, PROJECTS, TAG, newest } from '../../data/projects';
import { actions, useAppState } from '../../state';

const GROUPS = CAT_KEYS.map(k => ({ k, list: PROJECTS.filter(p => p.cat === k).sort(newest) }));

export function Projects() {
  const focus = useAppState(s => s.focus);
  const sel = useAppState(s => s.sel);
  const hover = useAppState(s => s.hover);
  return (
    <>
      <div className="chips" role="group" aria-label="Constellations">
        <button type="button" className="chip" aria-pressed={!focus} onClick={() => actions.home()}>All</button>
        {CAT_KEYS.map(k => (
          <button key={k} type="button" className="chip" aria-pressed={focus === k} onClick={() => actions.setFocus(k)}>{CATS[k].label}</button>
        ))}
      </div>
      <div className="rows">
        {GROUPS.map(({ k, list }) => (
          <div className="grp" key={k} hidden={!!focus && focus !== k}>
            <h3 className="grp-h">{CATS[k].label}<span>{list.length} projects</span></h3>
            {list.map(p => (
              <button
                key={p.id}
                type="button"
                className={`row${hover === p.id ? ' is-hot' : ''}`}
                aria-pressed={sel === p.id}
                onClick={() => actions.select(p.id)}
                onPointerEnter={() => actions.hover(p.id)}
                onPointerLeave={() => actions.hover(null)}
                onFocus={() => actions.hover(p.id)}
                onBlur={() => actions.hover(null)}
              >
                <span className="no">{CATNO[p.id]}</span>
                <span className="n">{p.name}</span>
                <span className={`tag${p.status === 'live' ? ' live' : ''}`}>{TAG[p.status]}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
