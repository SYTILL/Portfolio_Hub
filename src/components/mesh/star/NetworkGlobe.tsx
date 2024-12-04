import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


const Particles = () => {
    const groupRef = useRef<THREE.Group>(null);
    const pointCloudRef = useRef<THREE.Points>(null);
    const lineMeshRef = useRef<THREE.LineSegments>(null);

    const particleCount = 300;
    const r = 20; //radius
    const v = 0.002; //velocity
    const connectionRange = 4; 

    // Particle data (positions and velocities)
    const { positions, colors, directions } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const directions = new Float32Array(particleCount * 3);

        // Initialize positions and rotation directions for satellites
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * 2 * Math.PI; // Random azimuthal angle
            const phi = Math.acos(2 * Math.random() - 1); // Random inclination angle
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Randomize rotation directions (normalized vector)
            const dx = Math.random() * 2 - 1;
            const dy = Math.random() * 2 - 1;
            const dz = Math.random() * 2 - 1;
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz); // Normalize
            directions.set([dx / length, dy / length, dz / length], i * 3);
        }

        return { positions, colors, directions };
    }, []);


    const linePositions = useMemo(() => new Float32Array(particleCount * particleCount * 3), [particleCount]);
    const lineColors = useMemo(() => new Float32Array(particleCount * particleCount * 3), [particleCount]);

    //main loop
    useFrame(() => {
        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for (let i = 0; i < particleCount; i++) {

            const x = positions[i*3];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];

            // Update position based on rotation direction and speed
            const dx = directions[i * 3];
            const dy = directions[i * 3 + 1];
            const dz = directions[i * 3 + 2];
            const cosAngle = Math.cos(v);
            const sinAngle = Math.sin(v);

            // Rotate position around the direction vector
            const rotatedX = cosAngle * x + sinAngle * (-dz * y + dy * z);
            const rotatedY = cosAngle * y + sinAngle * (dz * x - dx * z);
            const rotatedZ = cosAngle * z + sinAngle * (-dy * x + dx * y);

            positions[i * 3] = rotatedX;
            positions[i * 3 + 1] = rotatedY;
            positions[i * 3 + 2] = rotatedZ;


            // Particle connections logic
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < (connectionRange * r / 10)) {
                    const alpha = 1.0 - dist / (connectionRange * r / 10);

                    linePositions[vertexpos++] = positions[i * 3];
                    linePositions[vertexpos++] = positions[i * 3 + 1];
                    linePositions[vertexpos++] = positions[i * 3 + 2];

                    linePositions[vertexpos++] = positions[j * 3];
                    linePositions[vertexpos++] = positions[j * 3 + 1];
                    linePositions[vertexpos++] = positions[j * 3 + 2];

                    lineColors[colorpos++] = alpha;
                    lineColors[colorpos++] = alpha;
                    lineColors[colorpos++] = alpha;

                    lineColors[colorpos++] = alpha;
                    lineColors[colorpos++] = alpha;
                    lineColors[colorpos++] = alpha;

                    numConnected++;
                }
            }
        }

        lineMeshRef.current!.geometry.setDrawRange(0, numConnected * 2);
        lineMeshRef.current!.geometry.attributes.position.needsUpdate = true;
        lineMeshRef.current!.geometry.attributes.color.needsUpdate = true;
        pointCloudRef.current!.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group ref={groupRef}>
            {/* Points */}
            <points ref={pointCloudRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={3} sizeAttenuation={false} transparent blending={THREE.AdditiveBlending} />
            </points>

            {/* Lines */}
            <lineSegments ref={lineMeshRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
                </bufferGeometry>
                <lineBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} />
            </lineSegments>
        </group>
    );
};

const Network = () => {
    return (
        <>
            <ambientLight />
            <Particles />
        </>
    );
};

export default Network;
