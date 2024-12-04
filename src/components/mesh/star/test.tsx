import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TextureLoader, Color } from 'three';

function Globe() {
  // const earthTexture = new TextureLoader().load('/earth_texture.jpg'); // Replace with your texture path

  return (
    <mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={new Color(0x888888)} />
    </mesh>
  );
}

function Satellites({ count = 100, radius = 2, speed = 0.01 }) {
  const pointsRef = useRef();
  const positions = new Float32Array(count * 3);
  const directions = new Float32Array(count * 3); // Random rotation directions

  // Initialize positions and rotation directions for satellites
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI; // Random azimuthal angle
    const phi = Math.acos(2 * Math.random() - 1); // Random inclination angle
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    positions.set([x, y, z], i * 3);

    // Randomize rotation directions (normalized vector)
    const dx = Math.random() * 2 - 1;
    const dy = Math.random() * 2 - 1;
    const dz = Math.random() * 2 - 1;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz); // Normalize
    directions.set([dx / length, dy / length, dz / length], i * 3);
  }

  // Animate satellite positions
  useFrame((state) => {
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const dirIdx = i * 3;
      const x = positions[idx];
      const y = positions[idx + 1];
      const z = positions[idx + 2];

      // Update position based on rotation direction and speed
      const dx = directions[dirIdx];
      const dy = directions[dirIdx + 1];
      const dz = directions[dirIdx + 2];

      const cosAngle = Math.cos(speed);
      const sinAngle = Math.sin(speed);

      // Rotate position around the direction vector
      const rotatedX = cosAngle * x + sinAngle * (-dz * y + dy * z);
      const rotatedY = cosAngle * y + sinAngle * (dz * x - dx * z);
      const rotatedZ = cosAngle * z + sinAngle * (-dy * x + dx * y);

      array[idx] = rotatedX;
      array[idx + 1] = rotatedY;
      array[idx + 2] = rotatedZ;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="yellow" />
    </points>
  );
}


export default function Test() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Globe />
      <Satellites count={200} radius={2} />
    </>
  );
}
