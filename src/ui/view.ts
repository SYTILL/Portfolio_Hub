import { emit } from '../lib/events';
import { actions, getState } from '../state';

/** Leave the mission log for the full star map; the panels come in as the log fades out. */
export function enterMap() {
  if (getState().view === 'map') return;
  actions.setView('map');
  emit('enter-map');
}
