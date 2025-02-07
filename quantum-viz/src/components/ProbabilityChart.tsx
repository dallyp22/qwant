import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useQuantumState, getMeasurementProbabilities } from '../context/QuantumStateContext';

interface ProbabilityData {
  state: string;
  probability: number;
}

interface ProbabilityChartProps {
  qubitIndex: number;
}

function ProbabilityChart({ qubitIndex }: ProbabilityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state } = useQuantumState();

  useEffect(() => {
    if (!svgRef.current) return;

    // Get probabilities for the specified qubit
    const [prob0, prob1] = getMeasurementProbabilities(state.qubits[qubitIndex]);
    const data: ProbabilityData[] = [
      { state: '|0⟩', probability: prob0 },
      { state: '|1⟩', probability: prob1 },
    ];

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    x.domain(data.map(d => d.state));
    y.domain([0, 1]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5, '%'));

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.state) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.probability))
      .attr('height', d => height - y(d.probability))
      .attr('fill', '#2196f3')
      .attr('rx', 4)
      .attr('ry', 4);

    // Add value labels
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.state) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.probability) - 5)
      .attr('text-anchor', 'middle')
      .text(d => `${(d.probability * 100).toFixed(1)}%`);

  }, [state.qubits[qubitIndex]]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    />
  );
}

export default ProbabilityChart; 