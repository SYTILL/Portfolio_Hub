import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

type ScalableLabelProps = {
    position: [number, number, number];
    text: string;
};

export default function ScalableLabel({ position, text }: ScalableLabelProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (ref.current) {
            const distance = camera.position.distanceTo(new THREE.Vector3(...position));
            const scale = Math.max(1/distance, 0.2);
            ref.current.style.transform = `scale(${scale})`;
        }
    });

    return (
        <Html position={position} center>
            <div
                ref={ref}
                style={{
                    color: 'white',
                    background: 'transparent',
                    padding: '5px',
                    borderRadius: '5px',
                    fontSize: '64px',
                    whiteSpace: 'nowrap', // Ensure the text doesn't wrap
                }}
            >
                {text}
            </div>
        </Html>
    );
};