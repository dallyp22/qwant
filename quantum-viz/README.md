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
   - H gate on |0⟩: Creates equal superposition (|0⟩ + |1⟩)/√2
   - X gate: Flips between |0⟩ and |1⟩
   - Z gate: Adds phase difference (visible on Bloch sphere)

2. **Multi-Qubit Effects**
   - CNOT: Entangles two qubits
   - Toffoli: Creates controlled operations
   - SWAP: Exchanges qubit states

3. **Measurement Results**
   - For basis states: Definite |0⟩ or |1⟩
   - For superpositions: Probabilistic outcomes
   - Visualization shows collapse to measured state

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

## Contributing

Contributions are welcome! Please feel free to submit pull requests, create issues, or suggest improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
