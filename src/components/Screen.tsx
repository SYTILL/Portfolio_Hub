import { Canvas, useFrame, useThree } from '@react-three/fiber'
import CoreStar from './mesh/star/CoreStar';
import { Html, OrbitControls, Stats } from '@react-three/drei'
import BackgroundStars from './mesh/background/BackgroundStars';
import Network from './mesh/star/NetworkGlobe';
import NebulaCloud from './mesh/background/NebulaCloud';
import SetCameraPosition from './helperFunction/SetCameraPosition';
import ImageBox from './mesh/star/ImageBox';
import PixelatedEffect from './helperFunction/PixelatedEffect';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Grid from './mesh/background/Grid';
import { Grid as GridHelper } from '@react-three/drei';
import { useState } from 'react';
import MorseCodeLine from './mesh/ui/Outline';
import Outline from './mesh/ui/Outline';
import DrawOutline from './mesh/ui/Outline';
import TopUI from './mesh/ui/TopUI';

enum RenderTypes {
    NORMAL = "normal",
    WIREFRAME = "wireframe",
    LOWBUDGET = "lowbudget",
    ASCII = "ascii",
    PIXEL = "pixel",
}

type Vector3 = [number, number, number];

const CAMERA_POSITION: Vector3 = [100, 100, 100];
const CAMERA_ROTATION: Vector3 = [
    -45 * (Math.PI / 180),
    -45 * (Math.PI / 180),
    0,
];
const CAMERA_FAR = 30000;

export default function Screen() {
    const [renderMode, setRenderMode]
        = useState<RenderTypes>(RenderTypes.NORMAL);

    const camera = {
        position: CAMERA_POSITION,
        rotation: CAMERA_ROTATION,
        zoom: 5,
        near: 0.1,
        far: CAMERA_FAR,
        //fov: 120,
    };

    return (
        <div style={{ fontFamily: 'Rubik', cursor: "default", userSelect: "none" }}>
            <Canvas
                camera={camera}
                style={{ height: '100vh', width: '100vw' }}
            >
                <color attach="background" args={[(renderMode == RenderTypes.WIREFRAME) ? '#fff' : '#000']} />
                <ambientLight color="#fff" intensity={5} />
                <BackgroundStars sizeAttenuation={false} />
                <BackgroundStars sizeAttenuation={true} />

                {false && <Network />}

                <CoreStar pos={[-16, 10, -10]} label={['Coding', 'Projects']} />
                <CoreStar pos={[1, 5, 12]} label={['Music ', 'Productions']} />
                <CoreStar pos={[10, 9, -10]} label={['About', ' Me']} />

                {false && <NebulaCloud />}

                {false && <ImageBox imagePath='./images/icon/code.png' />}


                {(renderMode == RenderTypes.PIXEL) && <PixelatedEffect pixelSize={4} />}

                {/* <SetCameraPosition position={CAMERA_POSITION} rotation={CAMERA_ROTATION} /> */}
                {/* <AuroraShader /> */}
                {/* <BackgroundImage /> */}
                {/* <Test /> */}

                <OrbitControls minDistance={50} maxDistance={500} target={[0, 0, 0]} />
                {/* <Stats /> */}

                {/* {<axesHelper args={[100]} />} */}
                {(renderMode == RenderTypes.WIREFRAME) && <Grid size={100} step={5} />}
                {/* <GridHelper sectionSize={10} infiniteGrid cellSize={5}/> */}

            </Canvas>
            <TopUI />
        </div>
        
    );
}