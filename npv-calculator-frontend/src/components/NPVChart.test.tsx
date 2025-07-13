import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { NPVChart } from './NPVChart';
import type { NPVCalculationResponse } from '../types/api';
import * as Highcharts from "highcharts";

// Mock Highcharts
vi.mock('highcharts', () => ({
  default: {}
}));


// Mock HighchartsReact
vi.mock('highcharts-react-official', () => ({
  default: ({ options }: { options: Highcharts.Options }) => (
      <div data-testid="highcharts-mock" data-npv-values={JSON.stringify((options.series![0] as any).data)}>
        Mocked Highcharts Chart
      </div>
  )
}));

describe('NPVChart', () => {
  it('renders empty state when npvValues is empty', () => {
    render(<NPVChart npvValues={[]} />);

    expect(screen.getByText('📈')).toBeInTheDocument();
    expect(screen.getByText('Ready for Analysis')).toBeInTheDocument();
    expect(screen.getByText('Enter your parameters and click "Calculate NPV" to see results and visualization')).toBeInTheDocument();
    expect(screen.queryByTestId('highcharts-mock')).not.toBeInTheDocument();
  });

  it('renders chart when npvValues has data', () => {
    const mockNpvValues: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 },
      { discountRate: 0.10, npv: 500 },
      { discountRate: 0.15, npv: 0 }
    ];

    render(<NPVChart npvValues={mockNpvValues} />);

    expect(screen.queryByText('Ready for Analysis')).not.toBeInTheDocument();
    expect(screen.getByTestId('highcharts-mock')).toBeInTheDocument();
    expect(screen.getByText('Mocked Highcharts Chart')).toBeInTheDocument();
  });

  it('passes correct npvValues to HighchartsReact', () => {
    const mockNpvValues: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 },
      { discountRate: 0.10, npv: 500 }
    ];

    render(<NPVChart npvValues={mockNpvValues} />);

    const chartElement = screen.getByTestId('highcharts-mock');
    const npvValuesData = JSON.parse(chartElement.getAttribute('data-npv-values') || '[]');

    expect(npvValuesData).toEqual([[0.05, 1000], [0.1, 500]]);
  });
});