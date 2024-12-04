import { Canvas, useFrame, useThree } from '@react-three/fiber'
import CoreStar from './mesh/star/CoreStar';
import { OrbitControls, Stats } from '@react-three/drei'
import BackgroundStars from './mesh/background/BackgroundStars';
import Network from './mesh/star/NetworkGlobe';
import NebulaCloud from './mesh/background/NebulaCloud';
import SetCameraPosition from './helperFunction/SetCameraPosition';
import ImageBox from './mesh/star/ImageBox';
import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';


function PixelatedEffect({ pixelSize }: { pixelSize: number }) {
    const { gl, scene, camera, size } = useThree();
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


// enum RenderMode {
//     NORMAL,
//     WIREFRAME,
//     LOWBUDGET,
//     ASCII,
//     PIXEL,
// }

type Vector3 = [number, number, number];

const CAMERA_POSITION: Vector3 = [0, 50, 50];
const CAMERA_ROTATION: Vector3 = [
    -45 * (Math.PI / 180),
    0,
    0,
];
const CAMERA_FAR = 30000;

export default function Screen() {


    const camera = {
        position: CAMERA_POSITION,
        rotation: CAMERA_ROTATION,
        zoom: 10,
        near: 1,
        far: CAMERA_FAR,
        //fov: 120,
    };

    return (
        <Canvas
            orthographic
            camera={camera}
            style={{ height: '100vh', width: '100vw' }}

        >
            <color attach="background" args={['#000']} />
            <ambientLight color="#fff" intensity={5} />
            <axesHelper args={[100]} />
            <BackgroundStars sizeAttenuation={false} />
            <BackgroundStars sizeAttenuation={true} />

            {/* <Network /> */}

            <CoreStar pos={[-16, 20, 10]} label='Coding Projects' />
            <CoreStar pos={[1, 16, 32]} label='Music Productions' />
            <CoreStar pos={[10, 20, 10]} label='About me' />

            {/* <NebulaCloud /> */}

            <ImageBox imagePath='./images/icon/code.png' />


            <OrbitControls minZoom={4} maxZoom={20} />
            <Stats />



            {/* <PixelatedEffect pixelSize={4} /> */}

            {/* <SetCameraPosition position={CAMERA_POSITION} rotation={CAMERA_ROTATION} /> */}
            {/* <AuroraShader /> */}
            {/* <BackgroundImage /> */}
            {/* <Test /> */}
        </Canvas>
    );
}
