import React, { useRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button, ButtonGroup, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useQuantumState } from '../context/QuantumStateContext';
import { gates, applyGate, createRotationGate } from '../utils/quantumGates';

const SimulationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const CanvasContainer = styled(Box)({
  flex: 1,
  minHeight: '300px',
  position: 'relative',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  overflow: 'hidden',
});

function QuantumState({ state }: { state: { alpha: { real: number; imag: number }; beta: { real: number; imag: number } } }) {
  const probability = Math.sqrt(state.alpha.real ** 2 + state.alpha.imag ** 2);
  const theta = Math.acos(probability) * 2;
  const phi = Math.atan2(state.beta.imag, state.beta.real);
  
  const position: [number, number, number] = [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta)
  ];

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 32, 32]} />
      <meshStandardMaterial color="#2196f3" />
    </mesh>
  );
}

function BlochSphereGrid() {
  return (
    <group>
      <gridHelper args={[2, 20]} rotation={[Math.PI / 2, 0, 0]} />
      <gridHelper args={[2, 20]} />
      <gridHelper args={[2, 20]} rotation={[0, 0, Math.PI / 2]} />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
    </group>
  );
}

function QuantumSimulation() {
  const { state, dispatch } = useQuantumState();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [rotationAngle, setRotationAngle] = useState(0);

  const handleGateClick = (gateName: keyof typeof gates) => {
    dispatch({ 
      type: 'APPLY_GATE',
      payload: { 
        gate: gateName,
        qubit: 0
      }
    });
  };

  const handleRotationChange = (event: Event, newValue: number | number[]) => {
    setRotationAngle(newValue as number);
    const rotationGate = createRotationGate((newValue as number) * Math.PI / 180, 'X');
    dispatch({
      type: 'APPLY_CUSTOM_GATE',
      payload: {
        matrix: rotationGate,
        qubit: 0
      }
    });
  };

  const handleAlgorithmChange = (event: { target: { value: string } }) => {
    setSelectedAlgorithm(event.target.value);
    switch (event.target.value) {
      case 'grover':
        // Apply Hadamard to all qubits
        state.qubits.forEach((_, index) => {
          dispatch({
            type: 'APPLY_GATE',
            payload: { gate: 'H', qubit: index }
          });
        });
        break;
      case 'qft':
        // Apply QFT sequence
        dispatch({
          type: 'APPLY_GATE',
          payload: { gate: 'H', qubit: 0 }
        });
        break;
      // Add more algorithm implementations
    }
  };

  return (
    <SimulationContainer>
      <Typography variant="h6" gutterBottom>
        Quantum State Simulation
      </Typography>
      
      <ControlsContainer>
        <ButtonGroup size="small">
          <Button onClick={() => dispatch({ type: 'RESET' })}>Reset</Button>
          <Button onClick={() => handleGateClick('H')}>Apply H</Button>
          <Button onClick={() => handleGateClick('X')}>Apply X</Button>
          <Button onClick={() => handleGateClick('Z')}>Apply Z</Button>
        </ButtonGroup>
        
        <Box sx={{ width: 200 }}>
          <Typography gutterBottom>Rotation (X-axis)</Typography>
          <Slider
            value={rotationAngle}
            onChange={handleRotationChange}
            min={0}
            max={360}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel>Algorithm</InputLabel>
          <Select value={selectedAlgorithm} onChange={handleAlgorithmChange} label="Algorithm">
            <MenuItem value="grover">Grover's</MenuItem>
            <MenuItem value="qft">QFT</MenuItem>
            <MenuItem value="teleport">Teleportation</MenuItem>
          </Select>
        </FormControl>
      </ControlsContainer>

      <CanvasContainer>
        <Canvas camera={{ position: [2, 2, 2], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <BlochSphereGrid />
          <QuantumState state={state.qubits[0]} />
          <OrbitControls />
        </Canvas>
      </CanvasContainer>
    </SimulationContainer>
  );
}

export default QuantumSimulation; 