import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CodeIcon from '@mui/icons-material/Code';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useQuantumState } from '../context/QuantumStateContext';
import GatePalette from './GatePalette';

const DiagramContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  overflowX: 'auto',
}));

const CircuitGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '100px repeat(auto-fill, 60px)',
  gap: theme.spacing(1),
  minWidth: '100%',
  position: 'relative',
}));

const QubitLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '60px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '100px',
    right: 0,
    top: '50%',
    height: '2px',
    backgroundColor: theme.palette.divider,
    zIndex: 0,
  }
}));

const GateCell = styled(Box)<{ isDragging?: boolean }>(({ theme, isDragging }) => ({
  width: '50px',
  height: '50px',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  cursor: 'move',
  position: 'relative',
  zIndex: 1,
  opacity: isDragging ? 0.5 : 1,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const ControlPoint = styled(Box)(({ theme }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
}));

const ControlLine = styled(Box)(({ theme }) => ({
  width: '2px',
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
}));

interface Gate {
  type: string;
  qubit: number;
  time: number;
  controls?: number[];
  targets?: number[];
}

interface CircuitState {
  gates: Gate[];
  qubits: number;
  steps: number;
}

function generateQASM(circuit: CircuitState): string {
  let qasm = 'OPENQASM 2.0;\ninclude "qelib1.inc";\n\n';
  qasm += `qreg q[${circuit.qubits}];\n`;
  qasm += `creg c[${circuit.qubits}];\n\n`;

  circuit.gates.sort((a, b) => a.time - b.time).forEach(gate => {
    switch (gate.type) {
      case 'H':
        qasm += `h q[${gate.qubit}];\n`;
        break;
      case 'X':
        qasm += `x q[${gate.qubit}];\n`;
        break;
      case 'Y':
        qasm += `y q[${gate.qubit}];\n`;
        break;
      case 'Z':
        qasm += `z q[${gate.qubit}];\n`;
        break;
      case 'S':
        qasm += `s q[${gate.qubit}];\n`;
        break;
      case 'T':
        qasm += `t q[${gate.qubit}];\n`;
        break;
      case 'CNOT':
        if (gate.controls && gate.controls.length > 0) {
          qasm += `cx q[${gate.controls[0]}],q[${gate.qubit}];\n`;
        }
        break;
      case 'TOFFOLI':
        if (gate.controls && gate.controls.length > 1) {
          qasm += `ccx q[${gate.controls[0]}],q[${gate.controls[1]}],q[${gate.qubit}];\n`;
        }
        break;
    }
  });

  return qasm;
}

function optimizeCircuit(circuit: CircuitState): { circuit: CircuitState; suggestions: string[] } {
  const suggestions: string[] = [];
  const optimizedGates = [...circuit.gates];

  // Check for consecutive H gates that cancel out
  for (let i = 0; i < optimizedGates.length - 1; i++) {
    if (optimizedGates[i].type === 'H' && optimizedGates[i + 1].type === 'H' &&
        optimizedGates[i].qubit === optimizedGates[i + 1].qubit) {
      suggestions.push(`Consecutive H gates on qubit ${optimizedGates[i].qubit} cancel out`);
    }
  }

  // Check for unnecessary CNOT pairs
  for (let i = 0; i < optimizedGates.length - 1; i++) {
    if (optimizedGates[i].type === 'CNOT' && optimizedGates[i + 1].type === 'CNOT' &&
        optimizedGates[i].qubit === optimizedGates[i + 1].qubit &&
        optimizedGates[i].controls?.[0] === optimizedGates[i + 1].controls?.[0]) {
      suggestions.push(`Consecutive CNOT gates with same control and target cancel out`);
    }
  }

  return {
    circuit: { ...circuit, gates: optimizedGates },
    suggestions
  };
}

function CircuitDiagram() {
  const { state } = useQuantumState();
  const [draggingGate, setDraggingGate] = useState<Gate | null>(null);
  const [circuitState, setCircuitState] = useState<CircuitState>({
    gates: [],
    qubits: state.qubits.length,
    steps: 20,
  });
  const [optimizationMenu, setOptimizationMenu] = useState<null | HTMLElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleDragStart = (gate: Gate) => {
    setDraggingGate(gate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (qubit: number, time: number, e: React.DragEvent) => {
    e.preventDefault();
    let newGate: Gate;
    
    try {
      // Try to get gate data from the drag event (from GatePalette)
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        newGate = JSON.parse(data);
        newGate.qubit = qubit;
        newGate.time = time;
      } else if (draggingGate) {
        // If no data in event, use the dragging gate (from existing circuit)
        newGate = { ...draggingGate, qubit, time };
      } else {
        return;
      }

      setCircuitState(prev => ({
        ...prev,
        gates: [...prev.gates, newGate]
      }));
    } catch (error) {
      console.error('Error handling gate drop:', error);
    }
    
    setDraggingGate(null);
  };

  const handleSaveCircuit = () => {
    const circuitData = JSON.stringify(circuitState);
    const blob = new Blob([circuitData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_circuit.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadCircuit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const circuit = JSON.parse(e.target?.result as string);
          setCircuitState(circuit);
        } catch (error) {
          console.error('Error loading circuit:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportQASM = () => {
    const qasm = generateQASM(circuitState);
    const blob = new Blob([qasm], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_circuit.qasm';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptimize = () => {
    const { circuit, suggestions } = optimizeCircuit(circuitState);
    setCircuitState(circuit);
    setSuggestions(suggestions);
  };

  return (
    <>
      <GatePalette />
      <DiagramContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Circuit Diagram</Typography>
          <Box>
            <Tooltip title="Save Circuit">
              <IconButton onClick={handleSaveCircuit}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Load Circuit">
              <IconButton component="label">
                <FileUploadIcon />
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleLoadCircuit}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export QASM">
              <IconButton onClick={handleExportQASM}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Optimize Circuit">
              <IconButton onClick={(e) => setOptimizationMenu(e.currentTarget)}>
                <AutoFixHighIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CircuitGrid>
          {Array.from({ length: state.qubits.length }).map((_, qubit) => (
            <QubitLine
              key={qubit}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const time = Math.floor((e.clientX - rect.left - 100) / 60);
                handleDrop(qubit, time, e);
              }}
            >
              <Typography sx={{ width: 100 }}>Qubit {qubit}</Typography>
              {circuitState.gates
                .filter(gate => gate.qubit === qubit)
                .map((gate, index) => (
                  <GateCell
                    key={index}
                    style={{ gridColumn: gate.time + 2 }}
                    draggable
                    onDragStart={() => handleDragStart(gate)}
                  >
                    {gate.type}
                    {gate.controls?.map(control => (
                      <React.Fragment key={control}>
                        <ControlPoint style={{ top: (control - qubit) * 60 }} />
                        <ControlLine
                          style={{
                            top: Math.min(0, (control - qubit) * 60),
                            height: Math.abs((control - qubit) * 60)
                          }}
                        />
                      </React.Fragment>
                    ))}
                  </GateCell>
                ))}
            </QubitLine>
          ))}
        </CircuitGrid>

        <Menu
          anchorEl={optimizationMenu}
          open={Boolean(optimizationMenu)}
          onClose={() => setOptimizationMenu(null)}
        >
          <MenuItem disabled={suggestions.length === 0}>
            Optimization Suggestions:
          </MenuItem>
          {suggestions.map((suggestion, index) => (
            <MenuItem key={index}>{suggestion}</MenuItem>
          ))}
          {suggestions.length === 0 && (
            <MenuItem>No optimization suggestions available</MenuItem>
          )}
        </Menu>
      </DiagramContainer>
    </>
  );
}

export default CircuitDiagram; 