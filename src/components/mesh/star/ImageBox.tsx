import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface ImageBoxProps {
    imagePath: string;
    size?: [number, number, number];
}

export default function ImageBox({ imagePath, size = [5, 5, 0.5] }: ImageBoxProps) {
    const texture = useLoader(THREE.TextureLoader, imagePath);

    return (
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={size} /> {/* Width, height, depth */}
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}
