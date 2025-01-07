import { Html, Text } from "@react-three/drei";
import MorseCodeLine from "../ui/Outline";
import LoadingText from "../ui/LoadingText";

interface CoreStarProps {
    pos: [number, number, number];
    color?: string;
    label?: [string, string];
    labelColor?: string;
}

export default function CoreStar({ pos, color = "green", label = ["", ""], labelColor = "white" }: CoreStarProps) {


    return (
        <mesh position={pos}>
            {/* <sphereGeometry />
            <meshStandardMaterial
                color={color}
            /> */}


            {/* <WireframeMaterial /> */}


            <Html position={[0, 0, 0]}>
                <div className="h-[24px] w-[120px] ml-[-12px] mt-[-12px] flex gap-2">
                    {/* <img width={32} height={32} src="./images/icon/code.png" alt="" /> */}
                    <div className="size-6 rounded-full border flex justify-center items-center hover:bg-sky-300 hover:shadow-glow transition duration-500">
                        <div className="size-2 rounded-full bg-white shadow-glow-white">

                        </div>
                    </div>
                    <div style={{ color: labelColor, fontSize: '10px', marginTop: '-3px' }}>
                        <LoadingText text={label[0]} />
                        <LoadingText text={label[1]} wait={1000}/>
                    </div>
                </div>
            </Html>
        </mesh>
    )
}