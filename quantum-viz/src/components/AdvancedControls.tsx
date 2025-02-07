import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import SecurityIcon from '@mui/icons-material/Security';
import { useQuantumState } from '../context/QuantumStateContext';

const ControlsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const MatrixInput = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(1),
  margin: theme.spacing(2, 0),
}));

interface ComplexInputProps {
  value: { real: number; imag: number };
  onChange: (value: { real: number; imag: number }) => void;
  label: string;
}

function ComplexInput({ value, onChange, label }: ComplexInputProps) {
  return (
    <Box>
      <Typography variant="caption">{label}</Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TextField
            size="small"
            label="Real"
            type="number"
            value={value.real}
            onChange={(e) => onChange({ ...value, real: parseFloat(e.target.value) || 0 })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            size="small"
            label="Imag"
            type="number"
            value={value.imag}
            onChange={(e) => onChange({ ...value, imag: parseFloat(e.target.value) || 0 })}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function AdvancedControls() {
  const { state, dispatch } = useQuantumState();
  const [customGateDialog, setCustomGateDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [newGate, setNewGate] = useState({
    name: '',
    description: '',
    matrix: [
      [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
      [{ real: 0, imag: 0 }, { real: 1, imag: 0 }]
    ]
  });

  const handleAddCustomGate = () => {
    dispatch({
      type: 'ADD_CUSTOM_GATE',
      payload: {
        name: newGate.name,
        description: newGate.description,
        matrix: newGate.matrix
      }
    });
    setCustomGateDialog(false);
  };

  const handleToggleErrorCorrection = () => {
    dispatch({
      type: 'TOGGLE_ERROR_CORRECTION',
      payload: !state.errorCorrectionEnabled
    });
  };

  const handleApplyError = (qubit: number, errorType: 'bit-flip' | 'phase-flip') => {
    dispatch({
      type: 'APPLY_ERROR',
      payload: { qubit, errorType }
    });
  };

  const handleCorrectErrors = () => {
    dispatch({ type: 'CORRECT_ERRORS' });
  };

  return (
    <ControlsContainer>
      <Typography variant="h6" gutterBottom>
        Advanced Controls
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Tooltip title="Create Custom Gate">
          <IconButton onClick={() => setCustomGateDialog(true)}>
            <BuildIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Simulate Quantum Errors">
          <IconButton onClick={() => setErrorDialog(true)}>
            <BugReportIcon />
          </IconButton>
        </Tooltip>
        <FormControlLabel
          control={
            <Switch
              checked={state.errorCorrectionEnabled}
              onChange={handleToggleErrorCorrection}
            />
          }
          label="Error Correction"
        />
        <Tooltip title="Apply Error Correction">
          <IconButton
            onClick={handleCorrectErrors}
            disabled={!state.errorCorrectionEnabled}
          >
            <SecurityIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Custom Gate Dialog */}
      <Dialog open={customGateDialog} onClose={() => setCustomGateDialog(false)}>
        <DialogTitle>Create Custom Gate</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Gate Name"
            value={newGate.name}
            onChange={(e) => setNewGate({ ...newGate, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newGate.description}
            onChange={(e) => setNewGate({ ...newGate, description: e.target.value })}
            margin="normal"
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Gate Matrix (2x2 Unitary)
          </Typography>
          <MatrixInput>
            {newGate.matrix.map((row, i) =>
              row.map((cell, j) => (
                <ComplexInput
                  key={`${i}-${j}`}
                  label={`Matrix[${i}][${j}]`}
                  value={cell}
                  onChange={(value) => {
                    const newMatrix = [...newGate.matrix];
                    newMatrix[i][j] = value;
                    setNewGate({ ...newGate, matrix: newMatrix });
                  }}
                />
              ))
            )}
          </MatrixInput>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomGateDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCustomGate} variant="contained">
            Add Gate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Simulation Dialog */}
      <Dialog open={errorDialog} onClose={() => setErrorDialog(false)}>
        <DialogTitle>Simulate Quantum Errors</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Select qubit and error type to simulate:
          </Typography>
          <Grid container spacing={2}>
            {state.qubits.map((_, index) => (
              <Grid item xs={12} key={index}>
                <Typography variant="body1">Qubit {index}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleApplyError(index, 'bit-flip')}
                  >
                    Bit Flip
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleApplyError(index, 'phase-flip')}
                  >
                    Phase Flip
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ControlsContainer>
  );
}

export default AdvancedControls; 