import { ClockDriver } from './clock';
import { StarField } from './StarField';
import { Armillary } from './Armillary';
import { Constellations } from './Constellations';
import { CameraRig } from './CameraRig';
import { Labels } from './Labels';
import { Meteors } from './Meteors';

interface Props {
  mapEl: HTMLDivElement;
  focusEl: HTMLDivElement | null;
  layerEl: HTMLDivElement;
  meteorEl: HTMLCanvasElement;
}

// Frame order: clock (-100) → camera (-50) → constellations (-40) → labels, meteors, the rest (0).
export function Scene({ mapEl, focusEl, layerEl, meteorEl }: Props) {
  return (
    <>
      <ClockDriver />
      <CameraRig mapEl={mapEl} focusEl={focusEl} />
      <StarField />
      <Armillary />
      <Constellations />
      <Labels layer={layerEl} />
      <Meteors canvas={meteorEl} />
    </>
  );
}
