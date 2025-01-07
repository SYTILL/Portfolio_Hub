import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';


export default function PixelatedEffect({ pixelSize }: { pixelSize: number }) {
    const { gl, scene, camera } = useThree();
    const composer = useRef<any>();

    useEffect(() => {
        // Initialize the composer and pass
        const renderPass = new RenderPixelatedPass(pixelSize, scene, camera);
        composer.current = new EffectComposer(gl);
        composer.current.addPass(renderPass);

        // Handle resize updates
        const handleResize = () => {
            const { width, height } = gl.domElement;
            gl.setSize(width, height);
            composer.current.setSize(width, height);
            camera.updateProjectionMatrix();
        };

        // Set up resize listener
        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => {
            composer.current?.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [gl, scene, camera, pixelSize]);

    useFrame(() => {
        composer.current?.render();
    }, 1);

    return null;
}