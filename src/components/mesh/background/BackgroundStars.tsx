import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BACKGROUND_STARS_NUM = 500000;
const BACKGROUND_STAR_COLORS = [
    '#8fa8f6', '#a3b7f4', '#e8eafc',
    '#b4ffb8', '#fafefb', '#f6fef0',
    '#ffdd8f', '#fdf0dd', '#fdf6f1',
    '#ff8fba', '#fde6ef', '#fbd5e2',
    '#ffffff', '#ffffff', '#ffffff'
];
const BACKGROUND_STAR_SIZE = 3;

const SPACE_SIZE = 1000; //radius from center
const DIMENSION = 3;

const getRandomInt = (min: number, max: number) => {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);

    return Math.floor(Math.random() * (maxFloor - minCeil)) + minCeil;
};

const setRandomStarPos = (size: number) => {
    const x = Math.random() * size * 2 - size;
    const y = Math.random() * size * 2 - size;
    const z = Math.random() * size * 2 - size;
    const dis = Math.sqrt(x * x + y * y + z * z);
    if (dis < 400 || size < dis) {
        return setRandomStarPos(size);
    }
    return [x, y, z];
};


const getBackgroundStarsInfo = () => {
    const positions = Array.from(
        { length: BACKGROUND_STARS_NUM * DIMENSION },
        () => setRandomStarPos(SPACE_SIZE),
    ).flat();

    const colors = Array.from({ length: BACKGROUND_STARS_NUM }, () => {
        const color = new THREE.Color(
            BACKGROUND_STAR_COLORS[getRandomInt(0, BACKGROUND_STAR_COLORS.length)],
        );

        return [color.r, color.g, color.b];
    }).flat();

    return [new Float32Array(positions), new Float32Array(colors)];
};

export default function BackgroundStars({ sizeAttenuation }: { sizeAttenuation: boolean }) {
    const pointsRef = useRef<THREE.Points>(null!);

    const [positions, colors] = useMemo(() => getBackgroundStarsInfo(), []);

    useFrame((_, delta) => (pointsRef.current.rotation.y += delta / (sizeAttenuation ? 500 : 400)));

    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const size = 256;
        canvas.width = size;
        canvas.height = size;

        // Draw a glowing circle in the center of the canvas
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 1)'); // center glow
        // gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)'); // Softer fade
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // outer fade
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <points ref={pointsRef}>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={BACKGROUND_STARS_NUM}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={BACKGROUND_STARS_NUM}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                attach="material"
                size={sizeAttenuation ? BACKGROUND_STAR_SIZE : 1.5}
                vertexColors={true}
                sizeAttenuation={sizeAttenuation}
                map={sizeAttenuation ? texture : null}
                transparent={true}
                opacity={0.8}
            />
        </points>
    );
}