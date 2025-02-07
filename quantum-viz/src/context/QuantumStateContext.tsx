import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

interface ComplexNumber {
  real: number;
  imag: number;
}

interface Qubit {
  alpha: ComplexNumber;
  beta: ComplexNumber;
}

interface QuantumState {
  qubits: Qubit[];
  history: string[];
}

type Action =
  | { type: 'ADD_QUBIT' }
  | { type: 'APPLY_GATE'; payload: { gate: string; qubit: number } }
  | { type: 'APPLY_CNOT'; payload: { control: number; target: number } }
  | { type: 'APPLY_SWAP'; payload: { qubit1: number; qubit2: number } }
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
  return { alpha: newAlpha, beta: newBeta };
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

const initialState: QuantumState = {
  qubits: [{
    alpha: { real: 1, imag: 0 },
    beta: { real: 0, imag: 0 }
  }],
  history: []
};

function quantumReducer(state: QuantumState, action: Action): QuantumState {
  switch (action.type) {
    case 'ADD_QUBIT':
      return {
        ...state,
        qubits: [
          ...state.qubits,
          { alpha: { real: 1, imag: 0 }, beta: { real: 0, imag: 0 } }
        ],
        history: [...state.history, 'Added new qubit']
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