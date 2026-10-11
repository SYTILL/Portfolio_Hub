import { MON, MONTHS, PROJECTS } from '../../data/projects';

const COUNTS = MONTHS.map(m => PROJECTS.filter(p => p.start === m).length);
const W = 320, BASE = 100, TOP = 20, STEP = W / MONTHS.length, BW = 22, MAX = Math.max(...COUNTS);
const label = (m: string) => MON[+m.slice(5) - 1];

// Projects started per month, drawn to scale.
export function LaunchLog() {
  return (
    <>
      <svg className="hist" viewBox={`0 0 ${W} 126`} role="img" aria-label={`Projects started per month in 2026: ${MONTHS.map((m, i) => `${label(m)} ${COUNTS[i]}`).join(', ')}`}>
        {MONTHS.map((m, i) => {
          const h = COUNTS[i] ? (COUNTS[i] / MAX) * (BASE - TOP) : 0, x = i * STEP + (STEP - BW) / 2;
          return (
            <g key={m}>
              {COUNTS[i] > 0 && (
                <>
                  <rect className="bar" x={x} y={BASE - h} width={BW} height={h} />
                  <text className="v" x={x + BW / 2} y={BASE - h - 6} textAnchor="middle">{COUNTS[i]}</text>
                </>
              )}
              <text className="m" x={x + BW / 2} y={BASE + 18} textAnchor="middle">{label(m)}</text>
            </g>
          );
        })}
        <line className="base" x1={0} x2={W} y1={BASE} y2={BASE} />
      </svg>
      <p className="cap">Projects started each month in 2026. The first portfolio, Cosmic Syntax, began in December 2024.</p>
    </>
  );
}
