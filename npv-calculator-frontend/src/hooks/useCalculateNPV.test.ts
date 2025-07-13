import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCalculateNPV } from './useCalculateNPV';
import type { NPVCalculationRequest, NPVCalculationResponse } from '../types/api';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useCalculateNPV', () => {
  const mockSetSubmit = vi.fn();
  const mockRequestBody: NPVCalculationRequest = {
    lowerBoundDiscountRate: 0.05,
    upperBoundDiscountRate: 0.15,
    discountRateIncrement: 0.01,
    initialInvestment: 50000,
    cashFlows: [15000, 20000, 25000]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with empty npvValues and loading false', () => {
    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, false, mockSetSubmit)
    );

    expect(result.current.npvValues).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should not make API call when submit is false', () => {
    renderHook(() => 
      useCalculateNPV(mockRequestBody, false, mockSetSubmit)
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should make API call when submit is true', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 },
      { discountRate: 0.10, npv: 500 }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5252/NPVCalculation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequestBody)
        }
      );
    });
  });

  it('should set loading to true during API call and false after', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    // Should be loading initially
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should update npvValues with successful response', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 },
      { discountRate: 0.10, npv: 500 },
      { discountRate: 0.15, npv: 0 }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(result.current.npvValues).toEqual(mockResponse);
    });
  });

  it('should call setSubmit(false) after successful API call', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(mockSetSubmit).toHaveBeenCalledWith(false);
    });
  });

  it('should handle non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      body: 'Server error'
    });

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockConsoleError).toHaveBeenCalledWith('Failed to calculate NPV', 'Server error');
    expect(mockSetSubmit).toHaveBeenCalledWith(false);
  });

  it('should handle network error', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockConsoleError).toHaveBeenCalledWith('An unexpected error occurred while calculating NPV', networkError);
    expect(mockSetSubmit).toHaveBeenCalledWith(false);
  });

  it('should handle JSON parsing error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      }
    });

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockConsoleError).toHaveBeenCalledWith('An unexpected error occurred while calculating NPV', expect.any(Error));
    expect(mockSetSubmit).toHaveBeenCalledWith(false);
  });

  it('should make new API call when submit changes from false to true', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 }
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const { rerender } = renderHook(
      ({ submit }) => useCalculateNPV(mockRequestBody, submit, mockSetSubmit),
      { initialProps: { submit: false } }
    );

    expect(mockFetch).not.toHaveBeenCalled();

    rerender({ submit: true });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should not make duplicate API calls when submit remains true', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.05, npv: 1000 }
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const { rerender } = renderHook(
      ({ submit }) => useCalculateNPV(mockRequestBody, submit, mockSetSubmit),
      { initialProps: { submit: true } }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender({ submit: true });

    // Should still be only 1 call
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle empty response array', async () => {
    const mockResponse: NPVCalculationResponse[] = [];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(result.current.npvValues).toEqual([]);
    });
  });

  it('should handle response with negative NPV values', async () => {
    const mockResponse: NPVCalculationResponse[] = [
      { discountRate: 0.20, npv: -500 },
      { discountRate: 0.25, npv: -1000 }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => 
      useCalculateNPV(mockRequestBody, true, mockSetSubmit)
    );

    await waitFor(() => {
      expect(result.current.npvValues).toEqual(mockResponse);
    });
  });
});
