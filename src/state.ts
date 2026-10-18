import { useSyncExternalStore } from 'react';
import { BYID, type CatKey } from './data/projects';

// Which constellation is open, which project is selected, what the pointer is over.
// The 3D scene reads this every frame through getState(); React components subscribe with useAppState().
interface AppState {
  focus: CatKey | null;
  sel: string | null;
  hover: string | null;
  hintCat: CatKey | null;
  /** Project whose case file is open, if any. Mirrored in the URL hash (#nodt). */
  caseId: string | null;
  /** 'log': the scrolling mission log over the map (the default first view). 'map': the full star map with its docks. */
  view: 'log' | 'map';
}

// A link to #map skips the log.
const startView: AppState['view'] = typeof location !== 'undefined' && location.hash === '#map' ? 'map' : 'log';
let state: AppState = { focus: null, sel: null, hover: null, hintCat: null, caseId: null, view: startView };
const subs = new Set<() => void>();

export const getState = () => state;
const set = (patch: Partial<AppState>) => {
  const next = { ...state, ...patch };
  if ((Object.keys(patch) as (keyof AppState)[]).every(k => next[k] === state[k])) return;
  state = next;
  subs.forEach(fn => fn());
};
export const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => { subs.delete(fn); };
};
export function useAppState<T>(pick: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => pick(state));
}

// On the full map stars don't react; hovering a project only lights its constellation name.
// Inside an open constellation the hovered (or else the selected) star is highlighted.
export const hotId = (s: AppState = state) => (s.focus && s.hover && BYID[s.hover]?.cat === s.focus ? s.hover : s.sel);

export const actions = {
  setFocus(cat: CatKey | null) {
    const sel = state.sel && BYID[state.sel].cat === cat ? state.sel : null;
    set({ focus: cat, sel, hintCat: null });
  },
  select(id: string) {
    const p = BYID[id];
    if (p) set({ focus: p.cat, sel: p.id });
  },
  home() {
    set({ focus: null, sel: null, caseId: null });
  },
  /** Open a constellation with its project list showing (clears any selected star). */
  showList(cat: CatKey) {
    set({ focus: cat, sel: null, hintCat: null });
  },
  /** One step up: case file → star → constellation → full map. */
  back() {
    if (state.caseId) set({ caseId: null });
    else if (state.sel) set({ sel: null });
    else if (state.focus) set({ focus: null, hintCat: null });
  },
  openCase(id: string) {
    const p = BYID[id];
    if (p?.case) set({ focus: p.cat, sel: p.id, caseId: p.id });
  },
  closeCase() {
    set({ caseId: null });
  },
  /** Switch between the mission log and the star map; both open on the full map. */
  setView(view: AppState['view']) {
    set({ view, focus: null, sel: null, hover: null, hintCat: null });
  },
  hover(id: string | null) {
    set({ hover: id, hintCat: id && BYID[id].cat !== state.focus ? BYID[id].cat : null });
  },
  hintName(cat: CatKey | null) {
    set({ hintCat: cat });
  },
};
