import { useMemo } from 'react';

export default function WireframeMaterial({ color = "white", lineWidth = 1 }) {
  const material = useMemo(() => (
    <meshBasicMaterial
      color={color}
      wireframe={true}
      wireframeLinewidth={lineWidth}
    />
  ), [color, lineWidth]);

  return material;
}
