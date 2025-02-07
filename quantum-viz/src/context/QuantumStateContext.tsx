import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

interface ComplexNumber {
  real: number;
  imag: number;
}

interface Qubit {
  alpha: ComplexNumber;
  beta: ComplexNumber;
  error?: 'bit-flip' | 'phase-flip' | null;
}

interface CustomGate {
  name: string;
  matrix: ComplexNumber[][];
  description: string;
}

interface QuantumState {
  qubits: Qubit[];
  history: string[];
  customGates: CustomGate[];
  errorCorrectionEnabled: boolean;
}

type Action =
  | { type: 'ADD_QUBIT' }
  | { type: 'REMOVE_QUBIT' }
  | { type: 'APPLY_GATE'; payload: { gate: string; qubit: number } }
  | { type: 'APPLY_CUSTOM_GATE'; payload: { gateName: string; qubit: number } }
  | { type: 'APPLY_CNOT'; payload: { control: number; target: number } }
  | { type: 'APPLY_TOFFOLI'; payload: { control1: number; control2: number; target: number } }
  | { type: 'APPLY_SWAP'; payload: { qubit1: number; qubit2: number } }
  | { type: 'MEASURE_QUBIT'; payload: { qubit: number } }
  | { type: 'ADD_CUSTOM_GATE'; payload: CustomGate }
  | { type: 'TOGGLE_ERROR_CORRECTION'; payload: boolean }
  | { type: 'APPLY_ERROR'; payload: { qubit: number; errorType: 'bit-flip' | 'phase-flip' } }
  | { type: 'CORRECT_ERRORS' }
  | { type: 'RESET_CIRCUIT' }
  | { type: 'UNDO' };

interface QuantumStateContextType {
  state: QuantumState;
  dispatch: Dispatch<Action>;
}

// Quantum gates as 2x2 complex matrices
const QUANTUM_GATES = {
  H: [
    [{ real: 1/Math.sqrt(2), imag: 0 }, { real: 1/Math.sqrt(2), imag: 0 }],
    [{ real: 1/Math.sqrt(2), imag: 0 }, { real: -1/Math.sqrt(2), imag: 0 }]
  ],
  X: [
    [{ real: 0, imag: 0 }, { real: 1, imag: 0 }],
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }]
  ],
  Y: [
    [{ real: 0, imag: 0 }, { real: 0, imag: -1 }],
    [{ real: 0, imag: 1 }, { real: 0, imag: 0 }]
  ],
  Z: [
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
  ],
  S: [
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 1 }]
  ],
  T: [
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: Math.cos(Math.PI/8), imag: Math.sin(Math.PI/8) }]
  ]
};

// Complex number operations
const complexAdd = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  real: a.real + b.real,
  imag: a.imag + b.imag
});

const complexMult = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  real: a.real * b.real - a.imag * b.imag,
  imag: a.real * b.imag + a.imag * b.real
});

const complexMagnitudeSquared = (a: ComplexNumber): number => 
  a.real * a.real + a.imag * a.imag;

// Apply a single-qubit gate to a quantum state
const applyGate = (state: Qubit, gate: ComplexNumber[][]): Qubit => {
  const newAlpha = complexAdd(
    complexMult(gate[0][0], state.alpha),
    complexMult(gate[0][1], state.beta)
  );
  const newBeta = complexAdd(
    complexMult(gate[1][0], state.alpha),
    complexMult(gate[1][1], state.beta)
  );

  // Normalize the state
  const normalization = Math.sqrt(
    complexMagnitudeSquared(newAlpha) + complexMagnitudeSquared(newBeta)
  );

  return {
    alpha: {
      real: newAlpha.real / normalization,
      imag: newAlpha.imag / normalization
    },
    beta: {
      real: newBeta.real / normalization,
      imag: newBeta.imag / normalization
    }
  };
};

// Add CNOT operation
function applyCNOT(state: QuantumState, control: number, target: number): QuantumState {
  if (control >= state.qubits.length || target >= state.qubits.length) {
    return state;
  }

  // For simplicity, we'll just implement the basic CNOT operation
  // In a real quantum computer, this would handle the full tensor product space
  const controlQubit = state.qubits[control];
  const targetQubit = state.qubits[target];
  
  // Only apply X gate to target if control is in |1⟩ state
  const controlProb1 = controlQubit.beta.real * controlQubit.beta.real + 
                      controlQubit.beta.imag * controlQubit.beta.imag;
  
  if (controlProb1 > 0.5) {
    // Apply X gate to target qubit
    const newTargetQubit = applyGate(targetQubit, QUANTUM_GATES.X);
    const newQubits = [...state.qubits];
    newQubits[target] = newTargetQubit;
    return {
      ...state,
      qubits: newQubits,
      history: [...state.history, `Applied CNOT with control=${control} and target=${target}`]
    };
  }
  
  return state;
}

// Add SWAP operation
function applySwap(state: QuantumState, qubit1: number, qubit2: number): QuantumState {
  if (qubit1 >= state.qubits.length || qubit2 >= state.qubits.length) {
    return state;
  }

  const newQubits = [...state.qubits];
  const temp = newQubits[qubit1];
  newQubits[qubit1] = newQubits[qubit2];
  newQubits[qubit2] = temp;

  return {
    ...state,
    qubits: newQubits,
    history: [...state.history, `Swapped qubits ${qubit1} and ${qubit2}`]
  };
}

// Add Toffoli operation
function applyToffoli(state: QuantumState, control1: number, control2: number, target: number): QuantumState {
  if (control1 >= state.qubits.length || control2 >= state.qubits.length || target >= state.qubits.length) {
    return state;
  }

  const control1Qubit = state.qubits[control1];
  const control2Qubit = state.qubits[control2];
  const targetQubit = state.qubits[target];
  
  // Check if both control qubits are in |1⟩ state
  const control1Prob1 = control1Qubit.beta.real * control1Qubit.beta.real + 
                       control1Qubit.beta.imag * control1Qubit.beta.imag;
  const control2Prob1 = control2Qubit.beta.real * control2Qubit.beta.real + 
                       control2Qubit.beta.imag * control2Qubit.beta.imag;
  
  if (control1Prob1 > 0.5 && control2Prob1 > 0.5) {
    // Apply X gate to target qubit
    const newTargetQubit = applyGate(targetQubit, QUANTUM_GATES.X);
    const newQubits = [...state.qubits];
    newQubits[target] = newTargetQubit;
    return {
      ...state,
      qubits: newQubits,
      history: [...state.history, `Applied Toffoli with controls=${control1},${control2} and target=${target}`]
    };
  }
  
  return state;
}

// Add measurement operation
function measureQubit(state: QuantumState, qubitIndex: number): QuantumState {
  if (qubitIndex >= state.qubits.length) {
    return state;
  }

  const qubit = state.qubits[qubitIndex];
  const [prob0, prob1] = getMeasurementProbabilities(qubit);
  
  // Random measurement based on probabilities
  const measurement = Math.random() < prob0 ? 0 : 1;
  
  const newQubits = [...state.qubits];
  newQubits[qubitIndex] = {
    alpha: measurement === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 },
    beta: measurement === 1 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
  };

  return {
    ...state,
    qubits: newQubits,
    history: [...state.history, `Measured qubit ${qubitIndex}: |${measurement}⟩`]
  };
}

// Error correction codes
const BitFlipCode = {
  encode: (qubit: Qubit): Qubit[] => {
    // Encode logical qubit into three physical qubits
    return [
      { ...qubit },
      { ...qubit },
      { ...qubit }
    ];
  },
  decode: (qubits: Qubit[]): Qubit => {
    // Majority vote to correct bit-flip errors
    const votes = qubits.map(q => 
      (q.beta.real * q.beta.real + q.beta.imag * q.beta.imag) > 0.5 ? 1 : 0
    );
    const majorityVote = votes.filter(v => v === 1).length > votes.length / 2 ? 1 : 0;
    
    return {
      alpha: majorityVote === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 },
      beta: majorityVote === 1 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
    };
  }
};

const PhaseFlipCode = {
  encode: (qubit: Qubit): Qubit[] => {
    // Apply Hadamard gates before and after bit-flip code
    const encoded = BitFlipCode.encode(qubit);
    return encoded.map(q => applyGate(q, QUANTUM_GATES.H));
  },
  decode: (qubits: Qubit[]): Qubit => {
    // Apply Hadamard gates, then use bit-flip correction
    const decoded = qubits.map(q => applyGate(q, QUANTUM_GATES.H));
    return BitFlipCode.decode(decoded);
  }
};

// Add error simulation
function simulateError(qubit: Qubit, errorType: 'bit-flip' | 'phase-flip'): Qubit {
  if (errorType === 'bit-flip') {
    return applyGate(qubit, QUANTUM_GATES.X);
  } else {
    return applyGate(qubit, QUANTUM_GATES.Z);
  }
}

function applyErrorCorrection(state: QuantumState): QuantumState {
  if (!state.errorCorrectionEnabled) return state;

  const newQubits = [...state.qubits];
  for (let i = 0; i < newQubits.length; i += 3) {
    if (i + 2 < newQubits.length) {
      const logicalQubit = [newQubits[i], newQubits[i + 1], newQubits[i + 2]];
      const hasPhaseError = logicalQubit.some(q => q.error === 'phase-flip');
      const hasBitError = logicalQubit.some(q => q.error === 'bit-flip');

      let correctedQubit: Qubit;
      if (hasPhaseError) {
        correctedQubit = PhaseFlipCode.decode(logicalQubit);
      } else if (hasBitError) {
        correctedQubit = BitFlipCode.decode(logicalQubit);
      } else {
        continue;
      }

      newQubits[i] = { ...correctedQubit, error: null };
      newQubits[i + 1] = { ...correctedQubit, error: null };
      newQubits[i + 2] = { ...correctedQubit, error: null };
    }
  }

  return {
    ...state,
    qubits: newQubits,
    history: [...state.history, 'Applied error correction']
  };
}

const initialState: QuantumState = {
  qubits: [{
    alpha: { real: 1, imag: 0 },
    beta: { real: 0, imag: 0 },
    error: null
  }],
  history: [],
  customGates: [],
  errorCorrectionEnabled: false
};

function quantumReducer(state: QuantumState, action: Action): QuantumState {
  switch (action.type) {
    case 'ADD_QUBIT':
      return {
        ...state,
        qubits: [
          ...state.qubits,
          { alpha: { real: 1, imag: 0 }, beta: { real: 0, imag: 0 }, error: null }
        ],
        history: [...state.history, 'Added new qubit']
      };

    case 'REMOVE_QUBIT':
      if (state.qubits.length <= 1) {
        return state;
      }
      return {
        ...state,
        qubits: state.qubits.slice(0, -1),
        history: [...state.history, 'Removed qubit']
      };

    case 'APPLY_GATE': {
      const newQubits = [...state.qubits];
      const gate = QUANTUM_GATES[action.payload.gate as keyof typeof QUANTUM_GATES];
      if (gate && action.payload.qubit < newQubits.length) {
        newQubits[action.payload.qubit] = applyGate(newQubits[action.payload.qubit], gate);
      }
      return {
        ...state,
        qubits: newQubits,
        history: [...state.history, `Applied ${action.payload.gate} to qubit ${action.payload.qubit}`]
      };
    }

    case 'APPLY_CNOT':
      return applyCNOT(state, action.payload.control, action.payload.target);

    case 'APPLY_SWAP':
      return applySwap(state, action.payload.qubit1, action.payload.qubit2);

    case 'APPLY_TOFFOLI':
      return applyToffoli(state, action.payload.control1, action.payload.control2, action.payload.target);

    case 'MEASURE_QUBIT':
      return measureQubit(state, action.payload.qubit);

    case 'ADD_CUSTOM_GATE':
      return {
        ...state,
        customGates: [...state.customGates, action.payload],
        history: [...state.history, `Added custom gate ${action.payload.name}`]
      };

    case 'TOGGLE_ERROR_CORRECTION':
      return {
        ...state,
        errorCorrectionEnabled: action.payload,
        history: [...state.history, `${action.payload ? 'Enabled' : 'Disabled'} error correction`]
      };

    case 'APPLY_ERROR': {
      const newQubits = [...state.qubits];
      if (action.payload.qubit < newQubits.length) {
        newQubits[action.payload.qubit] = {
          ...simulateError(newQubits[action.payload.qubit], action.payload.errorType),
          error: action.payload.errorType
        };
      }
      return {
        ...state,
        qubits: newQubits,
        history: [...state.history, `Applied ${action.payload.errorType} to qubit ${action.payload.qubit}`]
      };
    }

    case 'CORRECT_ERRORS':
      return applyErrorCorrection(state);

    case 'APPLY_CUSTOM_GATE': {
      const customGate = state.customGates.find(g => g.name === action.payload.gateName);
      if (!customGate || action.payload.qubit >= state.qubits.length) return state;

      const newQubits = [...state.qubits];
      newQubits[action.payload.qubit] = applyGate(newQubits[action.payload.qubit], customGate.matrix);
      return {
        ...state,
        qubits: newQubits,
        history: [...state.history, `Applied custom gate ${action.payload.gateName} to qubit ${action.payload.qubit}`]
      };
    }

    case 'RESET_CIRCUIT':
      return initialState;

    case 'UNDO':
      if (state.history.length === 0) return state;
      const newHistory = [...state.history];
      newHistory.pop();
      return {
        ...initialState,
        history: newHistory
      };

    default:
      return state;
  }
}

const QuantumStateContext = createContext<QuantumStateContextType | null>(null);

export function QuantumStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quantumReducer, initialState);

  return (
    <QuantumStateContext.Provider value={{ state, dispatch }}>
      {children}
    </QuantumStateContext.Provider>
  );
}

export function useQuantumState(): QuantumStateContextType {
  const context = useContext(QuantumStateContext);
  if (!context) {
    throw new Error('useQuantumState must be used within a QuantumStateProvider');
  }
  return context;
}

// Helper functions for components
export function getBlochSphereCoordinates(qubit: Qubit) {
  const { alpha, beta } = qubit;
  
  // Calculate theta and phi from the quantum state
  const r = Math.sqrt(alpha.real * alpha.real + alpha.imag * alpha.imag +
                     beta.real * beta.real + beta.imag * beta.imag);
  const theta = 2 * Math.acos(Math.sqrt(alpha.real * alpha.real + alpha.imag * alpha.imag) / r);
  const phi = Math.atan2(beta.imag, beta.real) - Math.atan2(alpha.imag, alpha.real);

  // Convert to Cartesian coordinates
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta)
  };
}

export function getMeasurementProbabilities(qubit: Qubit): [number, number] {
  const prob0 = qubit.alpha.real * qubit.alpha.real + qubit.alpha.imag * qubit.alpha.imag;
  const prob1 = qubit.beta.real * qubit.beta.real + qubit.beta.imag * qubit.beta.imag;
  return [prob0, prob1];
} 