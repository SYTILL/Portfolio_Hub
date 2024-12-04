import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';


export default function NebulaCloud() {
    const texture = useLoader(THREE.TextureLoader, 'images/cloud/01.png'); 
  
    return (
      <mesh>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial map={texture} transparent opacity={0.55} />
      </mesh>
    );
  };