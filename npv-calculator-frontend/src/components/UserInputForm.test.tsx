import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserInputForm } from './UserInputForm';

describe('UserInputForm', () => {
    const mockSetFormData = vi.fn();
    const mockSetSubmit = vi.fn();
    
    const defaultProps = {
        setFormData: mockSetFormData,
        formData: {
            lowerBoundDiscountRate: 0.05,
            upperBoundDiscountRate: 0.15,
            discountRateIncrement: 0.01,
            initialInvestment: 50000,
            cashFlows: [15000]
        },
        loading: false,
        setSubmit: mockSetSubmit
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form inputs correctly', () => {
        render(<UserInputForm {...defaultProps} />);
        expect(screen.getByLabelText('Lower Bound (%)')).toBeInTheDocument();
        expect(screen.getByLabelText('Upper Bound (%)')).toBeInTheDocument();
        expect(screen.getByLabelText('Increment (%)')).toBeInTheDocument();
        expect(screen.getByLabelText('Initial Investment ($)')).toBeInTheDocument();
        expect(screen.getByText('Cash Flows ($)')).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(<UserInputForm {...defaultProps} />);
        const lowerBoundInput = screen.getByLabelText('Lower Bound (%)');
        fireEvent.change(lowerBoundInput, { target: { value: '0.1' } });
        
        expect(mockSetFormData).toHaveBeenCalled();
        
        const updateFunction = mockSetFormData.mock.calls[0][0];
        const result = updateFunction(defaultProps.formData);
        
        expect(result).toEqual(expect.objectContaining({
            lowerBoundDiscountRate: 0.1
        }));
    });

    it('handles cash flow addition', () => {
        render(<UserInputForm {...defaultProps} />);
        const addButton = screen.getByText(/Add Year/i);
        fireEvent.click(addButton);
        
        expect(mockSetFormData).toHaveBeenCalled();
        
        const updateFunction = mockSetFormData.mock.calls[0][0];
        const result = updateFunction(defaultProps.formData);
        
        expect(result).toEqual(expect.objectContaining({
            cashFlows: [15000, 0]
        }));
    });

    it('handles cash flow input change', () => {
        render(<UserInputForm {...defaultProps} />);
        const cashFlowInput = screen.getAllByPlaceholderText('e.g., 15000')[0];
        fireEvent.change(cashFlowInput, { target: { value: '20000' } });
        
        expect(mockSetFormData).toHaveBeenCalled();
        
        const updateFunction = mockSetFormData.mock.calls[0][0];
        const result = updateFunction(defaultProps.formData);
        
        expect(result).toEqual(expect.objectContaining({
            cashFlows: [20000]
        }));
    });

    it('handles cash flow removal', () => {
        const propsWithMultipleCashFlows = {
            ...defaultProps,
            formData: { ...defaultProps.formData, cashFlows: [15000, 20000] }
        };
        render(<UserInputForm {...propsWithMultipleCashFlows} />);
        const deleteButton = screen.getByTestId('remove-0');
        fireEvent.click(deleteButton);
        
        expect(mockSetFormData).toHaveBeenCalled();
        
        const updateFunction = mockSetFormData.mock.calls[0][0];
        const result = updateFunction(propsWithMultipleCashFlows.formData);
        
        expect(result).toEqual(expect.objectContaining({
            cashFlows: [20000]
        }));
    });

    it('disables submit button when loading', () => {
        const propsWithLoading = { ...defaultProps, loading: true };
        render(<UserInputForm {...propsWithLoading} />);
        const submitButton = screen.getByText(/Calculating.../i);
        expect(submitButton).toBeDisabled();
    });

    it('handles form submission', () => {
        render(<UserInputForm {...defaultProps} />);
        const form = screen.getByTestId('user-input-form');
        fireEvent.submit(form);
        expect(mockSetSubmit).toHaveBeenCalledWith(true);
    });
});