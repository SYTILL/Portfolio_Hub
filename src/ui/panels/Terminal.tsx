import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { CATS, PROJECTS, SHIPPED, SINCE, newest, ym, type CatKey } from '../../data/projects';
import { PROFILE } from '../../data/profile';
import { actions } from '../../state';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
const find = (q: string) => {
  const n = norm(q);
  if (!n) return null;
  return PROJECTS.find(p => p.id === n || norm(p.name) === n)
    ?? (n.length >= 2 ? PROJECTS.find(p => norm(p.name).startsWith(n) || p.id.startsWith(n)) : undefined)
    ?? null;
};
const isCat = (s: string): s is CatKey => s in CATS;
const K = ({ children }: { children: ReactNode }) => <span className="t-k">{children}</span>;
const Err = ({ children }: { children: ReactNode }) => <span className="e">{children}</span>;

const SUGGESTIONS = ['help', 'ls mobile', 'open nodt', 'home'];

function respond(raw: string): ReactNode[] | 'clear' {
  const [head = '', ...rest] = raw.trim().split(/\s+/), arg = rest.join(' ');
  switch (head.toLowerCase()) {
    case 'help':
      return [
        <><K>ls [field]</K>open a constellation: mobile, desktop, web, lab</>,
        <><K>open [name]</K>show a project</>,
        <><K>home</K>back to the full map</>,
        <><K>whoami</K>about me</>,
        <><K>contact</K>how to reach me</>,
        <><K>clear</K>clear the screen</>,
      ];
    case 'ls': {
      const cat = arg.toLowerCase();
      if (cat && !isCat(cat)) return [<Err>There’s no constellation called “{arg}”. Try mobile, desktop, web or lab.</Err>];
      if (cat && isCat(cat)) actions.setFocus(cat);
      return PROJECTS.filter(p => !cat || p.cat === cat).sort(newest)
        .map(p => <><span className="t-d">{ym(p.start).replace(' 20', ' ’')}</span>{p.name}</>);
    }
    case 'open': {
      const p = find(arg);
      if (!p) return [<Err>No project matches “{arg}”. Type ls to see the names.</Err>];
      actions.select(p.id);
      return [`Opened ${p.name}.`];
    }
    case 'home':
      actions.home();
      return ['Back to the full map.'];
    case 'whoami':
      return [`${PROFILE.name}. ${PROFILE.tagline}`, `${SINCE.length} projects since March 2026, ${SHIPPED.length} of them shipped.`];
    case 'contact':
      return [
        ...(PROFILE.email ? [<><K>email</K>{PROFILE.email}</>] : []),
        <><K>github</K>{PROFILE.github.label}</>,
        ...(PROFILE.resumeUrl ? [<><K>résumé</K>{PROFILE.resumeUrl}</>] : []),
      ];
    case 'clear':
      return 'clear';
    default:
      return [<Err>Unknown command “{head}”. Type help to see what works.</Err>];
  }
}

export function Terminal() {
  const [lines, setLines] = useState<ReactNode[]>(() => ['Connected to Cosmic Syntax.', <>Type <span className="c">help</span>, or tap a command below.</>]);
  const [value, setValue] = useState('');
  const out = useRef<HTMLPreElement>(null);

  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight; }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const result = respond(cmd);
    if (result === 'clear') setLines([]);
    else setLines(prev => [...prev, <span className="c">$ {cmd}</span>, ...result]);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); run(value); setValue(''); };

  return (
    <>
      <pre className="term-out" ref={out}>{lines.map((l, i) => <Fragment key={i}>{l}{'\n'}</Fragment>)}</pre>
      <div className="term-sugg">
        {SUGGESTIONS.map(s => <button key={s} type="button" onClick={() => run(s)}>{s}</button>)}
      </div>
      <form className="term-in" onSubmit={submit}>
        <label htmlFor="cs-cmd">guest@cosmic:~$</label>
        <input id="cs-cmd" autoComplete="off" spellCheck={false} placeholder="type help" value={value} onChange={e => setValue(e.target.value)} />
      </form>
    </>
  );
}
