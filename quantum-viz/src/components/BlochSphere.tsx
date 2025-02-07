import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useQuantumState, getBlochSphereCoordinates } from '../context/QuantumStateContext';

interface SphereLineProps {
  points: [number, number, number][];
  color?: string;
  lineWidth?: number;
}

function SphereLine({ points, color = 'gray', lineWidth = 1 }: SphereLineProps) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
    />
  );
}

function BlochSphere() {
  const sphereRef = useRef<THREE.Group>(null);
  const { state } = useQuantumState();
  
  // We'll visualize the first qubit's state
  const coordinates = useMemo(() => 
    getBlochSphereCoordinates(state.qubits[0]),
    [state.qubits[0]]
  );

  // Create sphere wireframe points
  const spherePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push([Math.cos(theta), Math.sin(theta), 0]);
    }
    return points;
  }, []);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={sphereRef}>
      {/* Bloch Sphere Wireframe */}
      <SphereLine points={spherePoints} />
      <SphereLine 
        points={spherePoints.map(([x, y]) => [x, 0, y])}
      />
      <SphereLine 
        points={spherePoints.map(([x, y]) => [0, x, y])}
      />

      {/* Coordinate Axes */}
      <SphereLine
        points={[[-1, 0, 0], [1, 0, 0]]}
        color="red"
        lineWidth={2}
      />
      <SphereLine
        points={[[0, -1, 0], [0, 1, 0]]}
        color="green"
        lineWidth={2}
      />
      <SphereLine
        points={[[0, 0, -1], [0, 0, 1]]}
        color="blue"
        lineWidth={2}
      />

      {/* State Vector */}
      <SphereLine
        points={[[0, 0, 0], [coordinates.x, coordinates.y, coordinates.z]]}
        color="purple"
        lineWidth={3}
      />
      <mesh position={[coordinates.x, coordinates.y, coordinates.z]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="purple" />
      </mesh>

      {/* Basis State Labels */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>
      <Text
        position={[1.2, 0, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        |+⟩
      </Text>
      <Text
        position={[-1.2, 0, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        |-⟩
      </Text>
    </group>
  );
}

export default BlochSphere; 