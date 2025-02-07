import React from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box, Tooltip } from '@mui/material';

const PaletteContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const GatesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const GateItem = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:active': {
    cursor: 'grabbing',
  },
}));

const gates = [
  { type: 'H', description: 'Hadamard Gate - Creates superposition' },
  { type: 'X', description: 'Pauli-X Gate (NOT) - Flips the qubit state' },
  { type: 'Y', description: 'Pauli-Y Gate' },
  { type: 'Z', description: 'Pauli-Z Gate - Phase flip' },
  { type: 'S', description: 'S Gate - π/2 phase rotation' },
  { type: 'T', description: 'T Gate - π/4 phase rotation' },
  { type: 'CNOT', description: 'Controlled-NOT Gate' },
  { type: 'TOFFOLI', description: 'Toffoli Gate (CCNOT)' },
];

interface Gate {
  type: string;
  qubit: number;
  time: number;
  controls?: number[];
  targets?: number[];
}

function GatePalette() {
  const handleDragStart = (e: React.DragEvent, gate: { type: string }) => {
    const newGate: Gate = {
      type: gate.type,
      qubit: -1, // Will be set on drop
      time: -1,  // Will be set on drop
      controls: gate.type === 'CNOT' ? [0] : gate.type === 'TOFFOLI' ? [0, 1] : undefined,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(newGate));
  };

  return (
    <PaletteContainer>
      <Typography variant="h6">Available Gates</Typography>
      <GatesGrid>
        {gates.map((gate) => (
          <Tooltip key={gate.type} title={gate.description} arrow>
            <GateItem
              draggable
              onDragStart={(e) => handleDragStart(e, gate)}
            >
              {gate.type}
            </GateItem>
          </Tooltip>
        ))}
      </GatesGrid>
    </PaletteContainer>
  );
}

export default GatePalette; 