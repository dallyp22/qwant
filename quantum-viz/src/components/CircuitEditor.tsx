import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import { useQuantumState } from '../context/QuantumStateContext';

const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const CircuitGrid = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  overflowY: 'auto',
}));

const QubitLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
}));

const GateButton = styled(Button)(({ theme }) => ({
  minWidth: '60px',
  height: '40px',
}));

const MultiQubitGateButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const ControlPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const QUANTUM_GATES = [
  { name: 'H', label: 'H', tooltip: 'Hadamard Gate - Creates superposition' },
  { name: 'X', label: 'X', tooltip: 'Pauli-X Gate - Quantum NOT gate' },
  { name: 'Y', label: 'Y', tooltip: 'Pauli-Y Gate - Rotation around Y-axis' },
  { name: 'Z', label: 'Z', tooltip: 'Pauli-Z Gate - Phase flip' },
];

interface MultiQubitGateMenuProps {
  qubitIndex: number;
  onCNOT: (control: number, target: number) => void;
  onSwap: (qubit1: number, qubit2: number) => void;
  numQubits: number;
}

function MultiQubitGateMenu({ qubitIndex, onCNOT, onSwap, numQubits }: MultiQubitGateMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [gateType, setGateType] = useState<'CNOT' | 'SWAP' | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>, type: 'CNOT' | 'SWAP') => {
    setAnchorEl(event.currentTarget);
    setGateType(type);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setGateType(null);
  };

  const handleSelect = (targetIndex: number) => {
    if (gateType === 'CNOT') {
      onCNOT(qubitIndex, targetIndex);
    } else if (gateType === 'SWAP') {
      onSwap(qubitIndex, targetIndex);
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="CNOT Gate">
        <MultiQubitGateButton
          size="small"
          onClick={(e) => handleClick(e, 'CNOT')}
        >
          <ControlCameraIcon />
        </MultiQubitGateButton>
      </Tooltip>
      <Tooltip title="SWAP Gate">
        <MultiQubitGateButton
          size="small"
          onClick={(e) => handleClick(e, 'SWAP')}
        >
          <SwapHorizIcon />
        </MultiQubitGateButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem disabled>
          Select {gateType === 'CNOT' ? 'target' : 'second'} qubit:
        </MenuItem>
        {Array.from({ length: numQubits }).map((_, idx) => (
          idx !== qubitIndex && (
            <MenuItem key={idx} onClick={() => handleSelect(idx)}>
              Qubit {idx}
            </MenuItem>
          )
        ))}
      </Menu>
    </>
  );
}

function CircuitEditor() {
  const { state, dispatch } = useQuantumState();

  const handleAddQubit = () => {
    dispatch({ type: 'ADD_QUBIT' });
  };

  const handleApplyGate = (gate: string, qubit: number) => {
    dispatch({ type: 'APPLY_GATE', payload: { gate, qubit } });
  };

  const handleApplyCNOT = (control: number, target: number) => {
    dispatch({ type: 'APPLY_CNOT', payload: { control, target } });
  };

  const handleApplySwap = (qubit1: number, qubit2: number) => {
    dispatch({ type: 'APPLY_SWAP', payload: { qubit1, qubit2 } });
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_CIRCUIT' });
  };

  return (
    <EditorContainer elevation={3}>
      <Typography variant="h6" gutterBottom>
        Circuit Editor
      </Typography>

      <CircuitGrid>
        {state.qubits.map((_, qubitIndex) => (
          <QubitLine key={qubitIndex}>
            <Typography variant="body2">Q{qubitIndex}</Typography>
            {QUANTUM_GATES.map((gate) => (
              <Tooltip key={gate.name} title={gate.tooltip}>
                <GateButton
                  variant="outlined"
                  onClick={() => handleApplyGate(gate.name, qubitIndex)}
                >
                  {gate.label}
                </GateButton>
              </Tooltip>
            ))}
            {state.qubits.length > 1 && (
              <MultiQubitGateMenu
                qubitIndex={qubitIndex}
                onCNOT={handleApplyCNOT}
                onSwap={handleApplySwap}
                numQubits={state.qubits.length}
              />
            )}
          </QubitLine>
        ))}
      </CircuitGrid>

      <ControlPanel>
        <Tooltip title="Add Qubit">
          <IconButton onClick={handleAddQubit} color="primary">
            <AddCircleOutlineIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Undo Last Action">
          <IconButton 
            onClick={handleUndo} 
            disabled={state.history.length === 0}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Circuit">
          <IconButton onClick={handleReset} color="error">
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </ControlPanel>
    </EditorContainer>
  );
}

export default CircuitEditor; 