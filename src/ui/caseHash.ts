import { useEffect } from 'react';
import { BYID } from '../data/projects';
import { actions, getState, subscribe } from '../state';

// Keep the case file in the URL hash so a link like …/Portfolio_Hub/#nodt opens it directly,
// and the browser's back button closes it.
export function useCaseHash() {
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && BYID[id]?.case) actions.openCase(id);
      else if (getState().caseId) actions.closeCase();
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    const off = subscribe(() => {
      const id = getState().caseId, want = id ? `#${id}` : '';
      if (location.hash !== want) {
        if (id) location.hash = id;
        else history.replaceState(null, '', location.pathname + location.search);
      }
    });
    return () => { window.removeEventListener('hashchange', fromHash); off(); };
  }, []);
}
