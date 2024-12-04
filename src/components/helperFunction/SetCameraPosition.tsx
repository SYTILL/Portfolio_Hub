import { useFrame, useThree } from '@react-three/fiber';

interface props {
    position: [number, number, number];
    rotation: [number, number, number];
}

const SetCameraPosition = ({ position, rotation }: props) => {
    const { camera } = useThree();

    camera.position.set(...position);
    camera.updateProjectionMatrix();

    useFrame(() => {
        console.log(`Camera position: ${camera.position.x}, ${camera.position.y}, ${camera.position.z}`);
    });

    return null;
};

export default SetCameraPosition;