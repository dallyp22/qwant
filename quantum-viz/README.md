# Quantum Circuit Visualization Platform

An interactive web application for designing, visualizing, and experimenting with quantum circuits. This platform provides real-time visualization of quantum states, circuit building capabilities, and quantum operation simulations.

## Features

### 1. Circuit Building
- **Drag-and-Drop Interface**: Easily construct quantum circuits by dragging gates onto qubits
- **Multiple Gate Types**:
  - Single-qubit gates: H, X (NOT), Y, Z, S (π/2 phase), T (π/4 phase)
  - Multi-qubit gates: CNOT, Toffoli (CCNOT), SWAP
  - Measurement operations
- **Dynamic Circuit Editing**: Add/remove qubits, undo operations, reset circuit

### 2. Visualization Features
- **Bloch Sphere Representation**: 3D visualization of qubit states
- **Probability Distribution**: Real-time probability amplitudes for each qubit
- **Circuit Diagram**: Visual representation of the quantum circuit
- **Measurement Results**: Visual feedback for quantum measurements

### 3. Advanced Features
- **Circuit Optimization**: Automatic detection and suggestions for circuit optimization
- **QASM Export**: Export circuits in QASM format for use with real quantum computers
- **Save/Load Circuits**: Save your circuits and load them later
- **Custom Gate Creation**: Define and save custom quantum gates

## Getting Started

### Prerequisites
```bash
Node.js (v14 or higher)
npm (v6 or higher)
```

### Installation
1. Clone the repository:
```bash
git clone https://github.com/dallyp22/qwant.git
cd quantum-viz
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Basic Operations

1. **Adding/Removing Qubits**
   - Click the '+' button to add a new qubit
   - Click the '-' button to remove the last qubit
   - The platform starts with one qubit by default

2. **Applying Gates**
   - Drag gates from the gate palette onto the circuit
   - Click on gate buttons in the qubit line
   - Gates will show their effect immediately in the visualization panel

3. **Multi-Qubit Operations**
   - CNOT: Select control and target qubits
   - Toffoli: Select two control qubits and one target
   - SWAP: Select two qubits to swap states

4. **Measurements**
   - Click the measurement icon (⚫) on any qubit
   - A dialog will show the measurement result
   - The qubit state will collapse according to quantum mechanics

### Expected Outputs

1. **Single Qubit Operations**
   - H gate on |0⟩: Creates equal superposition (|0⟩ + |1⟩)/√2 with 50-50 probability
   - X gate: Flips between |0⟩ and |1⟩ with 100% probability
   - Z gate: Adds phase difference (visible on Bloch sphere)
   - S gate: Adds π/2 phase rotation
   - T gate: Adds π/4 phase rotation

2. **Understanding Probabilities**
   - **Basic States**:
     - |0⟩ state: 100% probability of measuring 0
     - |1⟩ state: 100% probability of measuring 1
     - H|0⟩ state: 50% probability each for 0 and 1
   
   - **Creating Different Probabilities**:
     1. Apply H gate to create 50-50 superposition
     2. Apply rotation gates (S, T) to modify phases
     3. Combine gates to create custom states:
        - H → T → H: Approximately 85% |0⟩, 15% |1⟩
        - H → S → H: 75% |0⟩, 25% |1⟩
        - H → T → S → H: Different probability distribution

   - **Phase Effects**:
     - S and T gates modify the phase component
     - Phase changes affect subsequent interference
     - Combine with H gates to see probability changes

3. **Multi-Qubit Effects**
   - CNOT: Entangles two qubits
   - Toffoli: Creates controlled operations
   - SWAP: Exchanges qubit states

4. **Example Sequences for Various Probabilities**:
   ```
   For 75-25 split:
   1. Start with |0⟩
   2. Apply H gate
   3. Apply S gate
   4. Apply H gate

   For ~85-15 split:
   1. Start with |0⟩
   2. Apply H gate
   3. Apply T gate
   4. Apply H gate
   ```

### Advanced Features

1. **Circuit Optimization**
   - Click the optimization button (wrench icon)
   - View suggestions for circuit simplification
   - Common optimizations:
     - Cancellation of consecutive H gates
     - Simplification of CNOT pairs
     - Reduction of redundant operations

2. **Saving/Loading Circuits**
   - Save: Click save icon, choose location for .json file
   - Load: Click load icon, select previously saved circuit
   - Formats supported: JSON (native), QASM (export)

3. **QASM Export**
   - Click the code icon
   - Saves circuit as QASM format
   - Compatible with IBM Quantum Experience and other platforms

## Common Use Cases

1. **Teaching/Learning**
   - Demonstrate quantum superposition with H gates
   - Show entanglement with CNOT operations
   - Visualize quantum state evolution

2. **Algorithm Design**
   - Build basic quantum algorithms
   - Test circuit equivalences
   - Optimize quantum operations

3. **Experimentation**
   - Test quantum gate combinations
   - Observe measurement effects
   - Study quantum state manipulation

## Troubleshooting

Common issues and solutions:

1. **Visualization Not Updating**
   - Refresh the page
   - Check if state is properly initialized
   - Verify gate operations are valid

2. **Gate Drag-and-Drop Issues**
   - Ensure gates are dropped in valid positions
   - Check for browser compatibility
   - Verify touch screen support if applicable

3. **Export Problems**
   - Verify file permissions
   - Check circuit validity
   - Ensure proper file extension

4. **Probability Distribution Issues**
   - **Fixed 50-50 Split**:
     - This is normal for a single H gate
     - Use combinations of H, S, and T gates for other distributions
   - **Always 100%**:
     - This indicates basis states (|0⟩ or |1⟩)
     - Apply H gate first to create superposition
   - **Unexpected Distributions**:
     - Check gate order
     - Verify phase rotations
     - Remember that measurement collapses the state

## Contributing

Contributions are welcome! Please feel free to submit pull requests, create issues, or suggest improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
