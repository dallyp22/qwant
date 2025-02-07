import React from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BlochSphere from './BlochSphere';
import ProbabilityChart from './ProbabilityChart';
import { useQuantumExplanation } from '../hooks/useQuantumExplanation';

const VisualizationContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const CanvasContainer = styled(Box)({
  flex: 1,
  minHeight: '300px',
  position: 'relative',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
});

const ExplanationPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
}));

function VisualizationPanel() {
  const explanation = useQuantumExplanation();

  return (
    <VisualizationContainer elevation={3}>
      <Typography variant="h6" gutterBottom>
        Quantum State Visualization
      </Typography>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <BlochSphere />
          <OrbitControls enablePan={false} />
        </Canvas>
      </CanvasContainer>

      <Box sx={{ height: '200px' }}>
        <Typography variant="subtitle1" gutterBottom>
          Measurement Probabilities
        </Typography>
        <ProbabilityChart />
      </Box>

      <ExplanationPanel>
        <Typography variant="subtitle2" gutterBottom>
          Explanation
        </Typography>
        <Typography variant="body2">
          {explanation}
        </Typography>
      </ExplanationPanel>
    </VisualizationContainer>
  );
}

export default VisualizationPanel; 