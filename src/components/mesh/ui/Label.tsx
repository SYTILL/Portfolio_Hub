import { useRef, useEffect } from 'react';
import { SpriteText2D, textAlign } from 'three-text2d';
import * as THREE from 'three';

interface LabelProps {
    text: string;
}

export default function Label({ text }: LabelProps) {
    const spriteRef = useRef<THREE.Group>(null);

    useEffect(() => {
        //ITS NOT THREE FIBER PACKAGE
        //NOT A COMPONENT
        console.log('1');
        var sprite = new SpriteText2D("SPRITE", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        console.log('2');

        spriteRef.current!.add(sprite);
        console.log('3');
    }, []);

    return (
        <group ref={spriteRef} position={[0, 0, 0]}>
            {text}
        </group>
    );
}

