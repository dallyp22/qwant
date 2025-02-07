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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import StraightIcon from '@mui/icons-material/Straight';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useQuantumState } from '../context/QuantumStateContext';

const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
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

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const QUANTUM_GATES = [
  { name: 'H', label: 'H', tooltip: 'Hadamard Gate - Creates superposition' },
  { name: 'X', label: 'X', tooltip: 'Pauli-X Gate - Quantum NOT gate' },
  { name: 'Y', label: 'Y', tooltip: 'Pauli-Y Gate - Rotation around Y-axis' },
  { name: 'Z', label: 'Z', tooltip: 'Pauli-Z Gate - Phase flip' },
  { name: 'S', label: 'S', tooltip: 'Phase Gate - π/2 phase rotation' },
  { name: 'T', label: 'T', tooltip: 'T Gate - π/4 phase rotation' },
];

interface MultiQubitGateMenuProps {
  qubitIndex: number;
  onCNOT: (control: number, target: number) => void;
  onToffoli: (control1: number, control2: number, target: number) => void;
  onSwap: (qubit1: number, qubit2: number) => void;
  numQubits: number;
}

function MultiQubitGateMenu({ qubitIndex, onCNOT, onToffoli, onSwap, numQubits }: MultiQubitGateMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [gateType, setGateType] = useState<'CNOT' | 'TOFFOLI' | 'SWAP' | null>(null);
  const [control2, setControl2] = useState<number | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>, type: 'CNOT' | 'TOFFOLI' | 'SWAP') => {
    setAnchorEl(event.currentTarget);
    setGateType(type);
    setControl2(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setGateType(null);
    setControl2(null);
  };

  const handleSelect = (targetIndex: number) => {
    if (gateType === 'CNOT') {
      onCNOT(qubitIndex, targetIndex);
      handleClose();
    } else if (gateType === 'TOFFOLI') {
      if (control2 === null) {
        setControl2(targetIndex);
      } else {
        onToffoli(qubitIndex, control2, targetIndex);
        handleClose();
      }
    } else if (gateType === 'SWAP') {
      onSwap(qubitIndex, targetIndex);
      handleClose();
    }
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
      <Tooltip title="Toffoli Gate">
        <MultiQubitGateButton
          size="small"
          onClick={(e) => handleClick(e, 'TOFFOLI')}
        >
          <StraightIcon />
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
          {gateType === 'TOFFOLI' && control2 === null
            ? 'Select first control qubit:'
            : gateType === 'TOFFOLI'
            ? 'Select target qubit:'
            : `Select ${gateType === 'CNOT' ? 'target' : 'second'} qubit:`}
        </MenuItem>
        {Array.from({ length: numQubits }).map((_, idx) => (
          idx !== qubitIndex && (!control2 || idx !== control2) && (
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
  const [measurementResult, setMeasurementResult] = useState<{ qubit: number; result: string } | null>(null);

  const handleAddQubit = () => {
    dispatch({ type: 'ADD_QUBIT' });
  };

  const handleRemoveQubit = () => {
    if (state.qubits.length > 1) {
      dispatch({ type: 'REMOVE_QUBIT' });
    }
  };

  const handleApplyGate = (gate: string, qubit: number) => {
    dispatch({ type: 'APPLY_GATE', payload: { gate, qubit } });
  };

  const handleApplyCNOT = (control: number, target: number) => {
    dispatch({ type: 'APPLY_CNOT', payload: { control, target } });
  };

  const handleApplyToffoli = (control1: number, control2: number, target: number) => {
    dispatch({ type: 'APPLY_TOFFOLI', payload: { control1, control2, target } });
  };

  const handleApplySwap = (qubit1: number, qubit2: number) => {
    dispatch({ type: 'APPLY_SWAP', payload: { qubit1, qubit2 } });
  };

  const handleMeasure = (qubit: number) => {
    dispatch({ type: 'MEASURE_QUBIT', payload: { qubit } });
    const lastAction = state.history[state.history.length - 1];
    if (lastAction && lastAction.startsWith('Measured')) {
      setMeasurementResult({
        qubit,
        result: lastAction.split('|')[1].split('⟩')[0]
      });
    }
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_CIRCUIT' });
  };

  const handleRunCircuit = () => {
    // This will be implemented to execute the circuit from the CircuitDiagram
    console.log('Running circuit...');
  };

  return (
    <EditorContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Quantum Circuit Editor</Typography>
        <ButtonContainer>
          <Tooltip title="Add Qubit">
            <IconButton onClick={handleAddQubit}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Qubit">
            <IconButton 
              onClick={handleRemoveQubit}
              disabled={state.qubits.length <= 1}
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </ButtonContainer>
      </Box>
      <ControlsContainer>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleRunCircuit}
        >
          Run Circuit
        </Button>
        <Typography>
          Qubits: {state.qubits.length}
        </Typography>
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
      </ControlsContainer>
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
            <Tooltip title="Measure Qubit">
              <MultiQubitGateButton
                size="small"
                onClick={() => handleMeasure(qubitIndex)}
              >
                <RadioButtonCheckedIcon />
              </MultiQubitGateButton>
            </Tooltip>
            {state.qubits.length > 1 && (
              <MultiQubitGateMenu
                qubitIndex={qubitIndex}
                onCNOT={handleApplyCNOT}
                onToffoli={handleApplyToffoli}
                onSwap={handleApplySwap}
                numQubits={state.qubits.length}
              />
            )}
          </QubitLine>
        ))}
      </CircuitGrid>

      <ControlPanel>
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

      <Dialog
        open={measurementResult !== null}
        onClose={() => setMeasurementResult(null)}
      >
        <DialogTitle>Measurement Result</DialogTitle>
        <DialogContent>
          <Typography>
            Qubit {measurementResult?.qubit} collapsed to |{measurementResult?.result}⟩
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeasurementResult(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </EditorContainer>
  );
}

export default CircuitEditor; 