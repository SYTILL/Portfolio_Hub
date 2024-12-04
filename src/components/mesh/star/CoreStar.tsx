import { Html } from "@react-three/drei";
import ScalableLabel from "../ScalableLabel";

interface CoreStarProps {
    pos: [number, number, number];
    color?: string;
    label?: string;
    labelColor?: string;
}

export default function CoreStar({ pos, color = "white", label = "", labelColor = "white" }: CoreStarProps) {

    return (
        <mesh position={pos}>
            <sphereGeometry />
            <meshStandardMaterial
                color={color}
            />
            {/* <WireframeMaterial /> */}

            {/* <Label text={label} position={[0,0,0]}/> */}

            {/* <ScalableLabel position={[0, 0, 0]} text={label} /> */}

            <Html position={[0, 0, 0]}>
                <div className="size-[64px] border-4 ml-[-32px] mt-[-32px]">
                    <div style={{ color: labelColor, fontSize: '16px' }}>
                        {label}
                    </div>
                </div>
            </Html>
        </mesh>
    )
}