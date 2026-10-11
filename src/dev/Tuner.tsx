import { useReducer, useState } from 'react';
import { CFG, DEFAULTS, TUNE_KEY, retune, type ConfigKey } from '../config';
import { emit, toast } from '../lib/events';
import { storage } from '../lib/storage';
import './tuner.css';

// Live tuning panel. Shown in `npm run dev`, or on the live site with ?tune in the URL.
// Times and speeds are "at speed 1": real time = value / speed, real rate = value * speed.
interface Item { k: ConfigKey; label: string; min: number; max: number; step: number; kind?: 'time' | 'rate'; unit?: string; note?: string }
const SCHEMA: { g: string; open?: boolean; items: Item[] }[] = [
  { g: '전체', open: true, items: [
    { k: 'speed', label: '전체 애니메이션 속도', min: 0.1, max: 2, step: 0.05, unit: '×', note: '1이 원래 속도예요.' },
  ] },
  { g: '등장 순서 (속도 1 기준, 초)', open: true, items: [
    { k: 'core', label: '중앙 별이 켜지는 시간', min: 0, max: 4, step: 0.05, kind: 'time' },
    { k: 'ring1', label: '첫 고리가 커지기 시작', min: 0, max: 5, step: 0.05, kind: 'time' },
    { k: 'ringGap', label: '고리 사이 간격', min: 0, max: 2, step: 0.05, kind: 'time' },
    { k: 'ringDur', label: '고리 하나가 커지는 시간', min: 0.1, max: 6, step: 0.05, kind: 'time' },
    { k: 'panels', label: '첫 패널 등장', min: 0, max: 6, step: 0.05, kind: 'time' },
    { k: 'panelStep', label: '패널 사이 간격', min: 0, max: 1, step: 0.01, kind: 'time' },
    { k: 'crumb', label: '위쪽 STAR MAP 경로 등장', min: 0, max: 6, step: 0.05, kind: 'time' },
    { k: 'stars', label: '첫 프로젝트 별 점등', min: 0, max: 6, step: 0.05, kind: 'time' },
    { k: 'step', label: '별 사이 간격', min: 0, max: 1, step: 0.01, kind: 'time' },
    { k: 'rise', label: '별 하나가 켜지는 시간', min: 0.05, max: 3, step: 0.05, kind: 'time' },
    { k: 'hint', label: '아래 안내 문구 등장', min: 0, max: 15, step: 0.1, kind: 'time' },
  ] },
  { g: '혼천의 고리', items: [
    { k: 'ringAlpha', label: '선 밝기', min: 0, max: 4, step: 0.05, unit: '×' },
    { k: 'ringSpin', label: '회전 속도', min: 0, max: 6, step: 0.1, unit: '×' },
  ] },
  { g: '별과 선', items: [
    { k: 'starSize', label: '프로젝트 별 크기', min: 0.3, max: 3, step: 0.05, unit: '×' },
    { k: 'twinkle', label: '배경 별 반짝임', min: 0, max: 1, step: 0.05 },
    { k: 'lineDraw', label: '별자리 선 그리는 기준 속도', min: 0.2, max: 12, step: 0.1, kind: 'rate', unit: '구간/초', note: '선이 3개인 별자리 기준이에요.' },
    { k: 'lineScale', label: '별 개수에 비례하는 정도', min: 0, max: 1.5, step: 0.05, note: '0이면 모두 같은 속도, 1이면 모두 같은 시간에 끝나요.' },
    { k: 'nameDelay', label: '별자리 이름 등장 지연', min: 0, max: 4, step: 0.05, kind: 'time' },
    { k: 'labelDelay', label: '별 이름표 등장 지연', min: 0, max: 3, step: 0.05, kind: 'time' },
    { k: 'lineHome', label: '전체 지도에서 선 밝기', min: 0, max: 1, step: 0.01 },
    { k: 'lineFocus', label: '열린 별자리의 선 밝기', min: 0, max: 1, step: 0.01 },
  ] },
  { g: '유성 (속도 1 기준)', items: [
    { k: 'meteorFirst', label: '첫 유성', min: 0, max: 40, step: 0.5, kind: 'time' },
    { k: 'meteorEveryMin', label: '간격 최소', min: 0.2, max: 40, step: 0.1, kind: 'time' },
    { k: 'meteorEveryMax', label: '간격 최대', min: 0.2, max: 60, step: 0.1, kind: 'time' },
    { k: 'meteorSpeedMin', label: '속도 최소', min: 20, max: 2000, step: 5, kind: 'rate', unit: 'px/초' },
    { k: 'meteorSpeedMax', label: '속도 최대', min: 20, max: 2000, step: 5, kind: 'rate', unit: 'px/초' },
    { k: 'meteorLenMin', label: '꼬리 길이 최소', min: 5, max: 500, step: 1, unit: 'px' },
    { k: 'meteorLenMax', label: '꼬리 길이 최대', min: 5, max: 500, step: 1, unit: 'px' },
    { k: 'meteorWidthMin', label: '굵기 최소', min: 0.3, max: 6, step: 0.1, unit: 'px' },
    { k: 'meteorWidthMax', label: '굵기 최대', min: 0.3, max: 6, step: 0.1, unit: 'px' },
  ] },
  { g: '카메라', items: [
    { k: 'camHome', label: '전체 지도 거리', min: 40, max: 240, step: 1 },
    { k: 'introFrom', label: '첫 진입 줌인 시작 거리', min: 40, max: 320, step: 1 },
    { k: 'introDelay', label: '줌인 시작', min: 0, max: 5, step: 0.05, kind: 'time' },
    { k: 'introDur', label: '줌인 시간', min: 0.1, max: 8, step: 0.05, kind: 'time' },
    { k: 'camFocus', label: '별자리를 열었을 때 거리', min: 12, max: 140, step: 1 },
    { k: 'camSelect', label: '별을 골랐을 때 거리', min: 12, max: 140, step: 1 },
    { k: 'autoRotate', label: '자동 회전 속도', min: 0, max: 0.4, step: 0.005, kind: 'rate', unit: 'rad/초' },
    { k: 'camEase', label: '카메라가 따라가는 속도', min: 0.2, max: 4, step: 0.05, unit: '×' },
  ] },
  { g: '패널 배경', items: [
    { k: 'gridAlpha', label: '격자선 진하기', min: 0, max: 0.3, step: 0.005 },
    { k: 'panelStarAlpha', label: '패널 별 밝기', min: 0, max: 3, step: 0.05, unit: '×' },
    { k: 'panelStarDensity', label: '패널 별 개수', min: 0.2, max: 3, step: 0.05, unit: '×' },
  ] },
];

const decimals = (step: number) => (String(step).split('.')[1] || '').length;
const fmt = (it: Item, v: number) => v.toFixed(decimals(it.step));
const realText = (it: Item) => {
  const v = CFG[it.k];
  if (it.kind === 'time') return `실제 ${(v / CFG.speed).toFixed(2)}초`;
  if (it.kind === 'rate') return `실제 ${+(v * CFG.speed).toFixed(it.step < 1 ? 3 : 0)} ${it.unit}`;
  return it.unit ? `${fmt(it, v)}${it.unit === '×' ? '×' : ' ' + it.unit}` : '';
};

function Row({ it, onChange }: { it: Item; onChange: (k: ConfigKey, v: number) => void }) {
  const v = CFG[it.k], changed = v !== DEFAULTS[it.k];
  return (
    <div className={`tn-row${changed ? ' changed' : ''}`}>
      <label id={`tl-${it.k}`} htmlFor={`tn-${it.k}`}>{it.label}</label>
      <span className="tn-real">{realText(it)}</span>
      <div className="tn-ctl">
        <input type="range" min={it.min} max={it.max} step={it.step} value={v} aria-labelledby={`tl-${it.k}`} onChange={e => onChange(it.k, +e.target.value)} />
        <input type="number" id={`tn-${it.k}`} min={it.min} max={it.max} step={it.step} value={fmt(it, v)} onChange={e => { const n = parseFloat(e.target.value); if (Number.isFinite(n)) onChange(it.k, Math.min(it.max, Math.max(it.min, n))); }} />
      </div>
      {it.note && <p className="tn-note">{it.note}</p>}
    </div>
  );
}

export default function Tuner() {
  const [open, setOpen] = useState(true);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const save = () => storage.set(TUNE_KEY, CFG);
  const onChange = (k: ConfigKey, v: number) => { CFG[k] = v; save(); retune(k); bump(); };
  const reset = () => { Object.assign(CFG, DEFAULTS); save(); retune(); bump(); toast('Reset to defaults'); };
  const copy = () => {
    const text = JSON.stringify(CFG, null, 2);
    navigator.clipboard.writeText(text).then(() => toast('Values copied'), () => toast('Copy blocked — see the JSON at the bottom'));
  };

  if (!open) return <button type="button" className="tn-toggle" onClick={() => setOpen(true)}>Tune</button>;
  return (
    <aside className="tn" aria-label="Tuning panel">
      <div className="tn-head">
        <h2>튜닝</h2>
        <button type="button" className="tn-btn" onClick={() => setOpen(false)}>닫기</button>
      </div>
      <p className="tn-desc">값을 바꾸면 바로 반영돼요. 이 브라우저에만 저장돼요. 회색 숫자는 전체 속도를 반영한 실제 값이에요.</p>
      <div className="tn-actions">
        <button type="button" className="tn-btn primary" onClick={() => emit('replay')}>등장 다시 보기</button>
        <button type="button" className="tn-btn" onClick={() => emit('meteor')}>유성 보내기</button>
        <button type="button" className="tn-btn" onClick={() => emit('reset-layout')}>패널 배치 초기화</button>
        <button type="button" className="tn-btn" onClick={copy}>값 복사</button>
        <button type="button" className="tn-btn" onClick={reset}>기본값으로</button>
      </div>
      {SCHEMA.map(gr => (
        <details key={gr.g} className="tn-grp" open={gr.open}>
          <summary>{gr.g}</summary>
          {gr.items.map(it => <Row key={it.k} it={it} onChange={onChange} />)}
        </details>
      ))}
      <details className="tn-grp">
        <summary>현재 값 (JSON)</summary>
        <textarea className="tn-json" readOnly rows={10} value={JSON.stringify(CFG, null, 2)} aria-label="Current values" />
      </details>
    </aside>
  );
}
