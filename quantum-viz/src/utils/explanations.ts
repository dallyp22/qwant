export function getGateDescription(gateName: string): string {
  switch (gateName) {
    case 'H':
      return 'The Hadamard gate creates an equal superposition of |0⟩ and |1⟩ states.';
    case 'X':
      return 'The Pauli-X gate (NOT gate) flips the state from |0⟩ to |1⟩ or vice versa.';
    case 'Y':
      return 'The Pauli-Y gate rotates the state around the Y-axis of the Bloch sphere.';
    case 'Z':
      return 'The Pauli-Z gate adds a phase difference between |0⟩ and |1⟩ states.';
    case 'CNOT':
      return 'The CNOT (Controlled-NOT) gate flips the target qubit only if the control qubit is in state |1⟩. This creates quantum entanglement between the qubits.';
    case 'SWAP':
      return 'The SWAP gate exchanges the quantum states of two qubits.';
    default:
      return '';
  }
}

interface GateAction {
  gate: string;
  qubit: string;
}

function parseGateAction(action: string): GateAction | null {
  if (!action.startsWith('Applied ')) return null;
  
  const parts = action.split(' ');
  if (parts.length < 5) return null;
  
  return {
    gate: parts[1],
    qubit: parts[4]
  };
}

export function getExplanation(lastAction: string): string {
  if (!lastAction) return 'No operations performed yet.';
  
  if (lastAction.startsWith('Added new qubit')) {
    return 'Added a new qubit initialized in the |0⟩ state.';
  }

  if (lastAction.startsWith('Applied CNOT')) {
    const match = lastAction.match(/control=(\d+) and target=(\d+)/);
    if (match) {
      return `${getGateDescription('CNOT')} (Control: Qubit ${match[1]}, Target: Qubit ${match[2]})`;
    }
  }

  if (lastAction.startsWith('Swapped qubits')) {
    const match = lastAction.match(/qubits (\d+) and (\d+)/);
    if (match) {
      return `${getGateDescription('SWAP')} (Qubits ${match[1]} and ${match[2]})`;
    }
  }
  
  const gateAction = parseGateAction(lastAction);
  if (gateAction) {
    return `${getGateDescription(gateAction.gate)} (Applied to Qubit ${gateAction.qubit})`;
  }
  
  return lastAction;
} 