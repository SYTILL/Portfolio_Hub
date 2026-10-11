import { FIRST_YEAR, SHIPPED, SINCE } from '../../data/projects';

const STATS: [number, string][] = [
  [SINCE.length, `projects started in ${FIRST_YEAR}`],
  [SHIPPED.length, 'shipped or live'],
  [4, 'platforms: iOS, Android, Windows, Web'],
  [4, 'languages: TypeScript, JavaScript, C#, Python'],
];

export function Summary() {
  return (
    <div className="stats">
      {STATS.map(([n, label]) => (
        <div className="stat" key={label}><b>{n}</b><span>{label}</span></div>
      ))}
    </div>
  );
}
