import React from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box, Tabs, Tab } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BlochSphere from './BlochSphere';
import ProbabilityChart from './ProbabilityChart';
import QuantumSimulation from './QuantumSimulation';
import { useQuantumExplanation } from '../hooks/useQuantumExplanation';
import { useQuantumState } from '../context/QuantumStateContext';

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

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index } = props;
  return (
    <Box hidden={value !== index} sx={{ height: '100%' }}>
      {value === index && children}
    </Box>
  );
}

function VisualizationPanel() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { state } = useQuantumState();
  const explanation = useQuantumExplanation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <VisualizationContainer>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Bloch Sphere" />
          <Tab label="Probabilities" />
          <Tab label="Quantum Simulation" />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <CanvasContainer>
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <BlochSphere qubitIndex={0} />
            <OrbitControls />
          </Canvas>
        </CanvasContainer>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <ProbabilityChart qubitIndex={0} />
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <QuantumSimulation />
      </TabPanel>

      <ExplanationPanel>
        <Typography variant="body2">{explanation}</Typography>
      </ExplanationPanel>
    </VisualizationContainer>
  );
}

export default VisualizationPanel; 