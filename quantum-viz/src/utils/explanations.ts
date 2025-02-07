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
    case 'S':
      return 'The S gate (phase gate) applies a π/2 phase rotation, equivalent to a quarter turn around the Z-axis.';
    case 'T':
      return 'The T gate applies a π/4 phase rotation, used in many quantum algorithms for universal quantum computation.';
    case 'CNOT':
      return 'The CNOT (Controlled-NOT) gate flips the target qubit only if the control qubit is in state |1⟩. This creates quantum entanglement between the qubits.';
    case 'TOFFOLI':
      return 'The Toffoli (CCNOT) gate is a three-qubit gate that flips the target qubit only if both control qubits are in state |1⟩. It is universal for classical computation.';
    case 'SWAP':
      return 'The SWAP gate exchanges the quantum states of two qubits.';
    default:
      // Check if it's a custom gate name
      if (gateName.startsWith('CUSTOM_')) {
        return 'A custom-defined quantum gate with user-specified unitary matrix.';
      }
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

  if (lastAction.startsWith('Applied Toffoli')) {
    const match = lastAction.match(/controls=(\d+),(\d+) and target=(\d+)/);
    if (match) {
      return `${getGateDescription('TOFFOLI')} (Controls: Qubits ${match[1]},${match[2]}, Target: Qubit ${match[3]})`;
    }
  }

  if (lastAction.startsWith('Swapped qubits')) {
    const match = lastAction.match(/qubits (\d+) and (\d+)/);
    if (match) {
      return `${getGateDescription('SWAP')} (Qubits ${match[1]} and ${match[2]})`;
    }
  }

  if (lastAction.startsWith('Measured qubit')) {
    const match = lastAction.match(/qubit (\d+): \|(\d+)⟩/);
    if (match) {
      return `Measured Qubit ${match[1]}, which collapsed to state |${match[2]}⟩ based on its probability distribution.`;
    }
  }

  if (lastAction.startsWith('Applied custom gate')) {
    const match = lastAction.match(/gate (.*) to qubit (\d+)/);
    if (match) {
      return `Applied custom gate "${match[1]}" to Qubit ${match[2]}.`;
    }
  }

  if (lastAction === 'Applied error correction') {
    return 'Applied quantum error correction to detect and fix bit-flip and phase-flip errors.';
  }

  if (lastAction.includes('bit-flip')) {
    const match = lastAction.match(/to qubit (\d+)/);
    if (match) {
      return `Simulated a bit-flip error on Qubit ${match[1]}, which flips between |0⟩ and |1⟩ states.`;
    }
  }

  if (lastAction.includes('phase-flip')) {
    const match = lastAction.match(/to qubit (\d+)/);
    if (match) {
      return `Simulated a phase-flip error on Qubit ${match[1]}, which changes the relative phase between |0⟩ and |1⟩ states.`;
    }
  }

  if (lastAction.startsWith('Enabled error correction')) {
    return 'Enabled quantum error correction using the 3-qubit bit-flip and phase-flip codes.';
  }

  if (lastAction.startsWith('Disabled error correction')) {
    return 'Disabled quantum error correction. Errors will not be automatically corrected.';
  }
  
  const gateAction = parseGateAction(lastAction);
  if (gateAction) {
    return `${getGateDescription(gateAction.gate)} (Applied to Qubit ${gateAction.qubit})`;
  }
  
  return lastAction;
} 