import { Line } from "@react-three/drei";

interface GridProps {
    size: number;
    step: number;
}

export default function Grid({ size, step }: GridProps) {
    const gridLines = [];

    // Create grid lines on the X and Z axes
    for (let i = -size; i <= size; i += step) {
        // Horizontal lines (parallel to the X axis)
        gridLines.push([-size, 0, i, size, 0, i]);

        // Vertical lines (parallel to the Z axis)
        gridLines.push([i, 0, -size, i, 0, size]);
    }

    return (
        <group>
            {gridLines.map((line, index) => {
                var lineColor = "gray";
                if (line[0] === 0) {
                    lineColor = "red"
                }
                else if (line[2] === 0) {
                    lineColor = "blue"
                }

                return (
                    <line key={index}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={line.length / 3}
                                array={new Float32Array(line)}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        {/* Change the color of the center lines */}
                        <lineBasicMaterial color={lineColor} />
                    </line>
                );
            })}
            <Line points={[[0, size/2, 0], [0, -size/2, 0]]} color={"green"} lineWidth={2}>

            </Line>
        </group>
    );
}