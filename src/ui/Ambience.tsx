import { useEffect, useRef, useSyncExternalStore } from 'react';
import { armAmbience, getAmbience, setAmbienceVolume, subscribeAmbience, toggleAmbience } from '../lib/ambience';

/** A tiny player in the bottom-right corner: play/pause with a little level meter, and a volume slider on hover. */
export function Ambience() {
  const { playing, vol } = useSyncExternalStore(subscribeAmbience, getAmbience);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => armAmbience(() => box.current), []);
  return (
    <div className={`amb${playing ? ' on' : ''}`} ref={box}>
      <button type="button" className="amb-btn" aria-pressed={playing} aria-label={playing ? 'Pause space ambience' : 'Play space ambience'} onClick={toggleAmbience}>
        <span className="amb-bars" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="amb-t">{playing ? 'Ambience' : 'Sound off'}</span>
      </button>
      <span className="amb-credit">Space Ambience · by Junsang Yoon</span>
      <input
        type="range"
        className="amb-vol"
        min={0}
        max={1}
        step={0.01}
        value={vol}
        onChange={e => setAmbienceVolume(+e.target.value)}
        aria-label="Ambience volume"
      />
    </div>
  );
}
