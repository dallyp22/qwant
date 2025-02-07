import { useQuantumState } from '../context/QuantumStateContext';
import { getExplanation } from '../utils/explanations';

export function useQuantumExplanation(): string {
  const { state } = useQuantumState();
  const lastAction = state.history.length > 0 ? state.history[state.history.length - 1] : '';
  return getExplanation(lastAction);
} 