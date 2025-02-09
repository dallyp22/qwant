interface ComplexNumber {
  real: number;
  imag: number;
}

export const multiply = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  real: a.real * b.real - a.imag * b.imag,
  imag: a.real * b.imag + a.imag * b.real,
});

export const add = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  real: a.real + b.real,
  imag: a.imag + b.imag,
});

// Quantum Gates as 2x2 matrices
export const gates = {
  H: [
    [{ real: 1/Math.sqrt(2), imag: 0 }, { real: 1/Math.sqrt(2), imag: 0 }],
    [{ real: 1/Math.sqrt(2), imag: 0 }, { real: -1/Math.sqrt(2), imag: 0 }],
  ],
  X: [
    [{ real: 0, imag: 0 }, { real: 1, imag: 0 }],
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
  ],
  Y: [
    [{ real: 0, imag: 0 }, { real: 0, imag: -1 }],
    [{ real: 0, imag: 1 }, { real: 0, imag: 0 }],
  ],
  Z: [
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: -1, imag: 0 }],
  ],
};

export const applyGate = (gate: ComplexNumber[][], state: ComplexNumber[]): ComplexNumber[] => {
  return [
    add(
      multiply(gate[0][0], state[0]),
      multiply(gate[0][1], state[1])
    ),
    add(
      multiply(gate[1][0], state[0]),
      multiply(gate[1][1], state[1])
    ),
  ];
};

export const createRotationGate = (theta: number, axis: 'X' | 'Y' | 'Z'): ComplexNumber[][] => {
  const c = Math.cos(theta/2);
  const s = Math.sin(theta/2);
  
  switch(axis) {
    case 'X':
      return [
        [{ real: c, imag: 0 }, { real: 0, imag: -s }],
        [{ real: 0, imag: -s }, { real: c, imag: 0 }],
      ];
    case 'Y':
      return [
        [{ real: c, imag: 0 }, { real: -s, imag: 0 }],
        [{ real: s, imag: 0 }, { real: c, imag: 0 }],
      ];
    case 'Z':
      return [
        [{ real: c, imag: -s }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: c, imag: s }],
      ];
  }
}; 