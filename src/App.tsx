import { lazy, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CFG, TUNER_ON, onRetune } from './config';
import { Scene } from './scene/Scene';
import { Docks } from './ui/Docks';
import { Crumb, Hint, Toast } from './ui/Chrome';

const Tuner = lazy(() => import('./dev/Tuner'));

export default function App() {
  // Callback refs so the 3D scene and the docks start once their elements exist.
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<HTMLDivElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const [meteors, setMeteors] = useState<HTMLCanvasElement | null>(null);
  const [focus, setFocus] = useState<HTMLDivElement | null>(null);
  const [left, setLeft] = useState<HTMLDivElement | null>(null);
  const [right, setRight] = useState<HTMLDivElement | null>(null);

  // CSS transitions follow the global animation speed; the panel grid strength is tunable.
  useEffect(() => {
    if (!root) return;
    const apply = () => {
      root.style.setProperty('--spd', String(CFG.speed));
      root.style.setProperty('--grid-a', String(CFG.gridAlpha));
    };
    apply();
    return onRetune(apply);
  }, [root]);

  return (
    <div className="cs" ref={setRoot}>
      <div className="cs-map" ref={setMap}>
        <Canvas
          flat
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          camera={{ fov: 50, near: 0.1, far: 3000, position: [0, 0, CFG.introFrom] }}
        >
          {map && layer && meteors && <Scene mapEl={map} focusEl={focus} layerEl={layer} meteorEl={meteors} />}
        </Canvas>
        <canvas className="meteor-layer" ref={setMeteors} aria-hidden="true" />
        <div className="lbl-layer" ref={setLayer} aria-hidden="true" />
      </div>
      <div className="cs-ui">
        <div className="dock dock-l" ref={setLeft} aria-label="Left dock" />
        <div className="mid">
          <Crumb />
          <div className="cs-focus" ref={setFocus} />
          <Hint />
        </div>
        <div className="dock dock-r" ref={setRight} aria-label="Right dock" />
      </div>
      {root && left && right && <Docks root={root} left={left} right={right} />}
      <Toast />
      {TUNER_ON && (
        <Suspense fallback={null}>
          <Tuner />
        </Suspense>
      )}
    </div>
  );
}
