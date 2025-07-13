import type {FormErrors, NPVCalculationRequest} from "../types/api.ts";
import type {Dispatch, SetStateAction} from "react";


export const validateForm = (formData: NPVCalculationRequest, setErrors: Dispatch<SetStateAction<FormErrors>>): boolean => {
    const newErrors: FormErrors = {};

    // Validate discount rates
    if (formData.lowerBoundDiscountRate <= 0) {
        newErrors.lowerBoundDiscountRate = 'Lower bound discount rate must be greater than 0';
    }

    if (formData.upperBoundDiscountRate <= 0) {
        newErrors.upperBoundDiscountRate = 'Upper bound discount rate must be greater than 0';
    }

    if (formData.discountRateIncrement <= 0) {
        newErrors.discountRateIncrement = 'Discount rate increment must be greater than 0';
    }

    // Validate bounds relationship
    if (formData.upperBoundDiscountRate <= formData.lowerBoundDiscountRate) {
        newErrors.upperBoundDiscountRate = 'Upper bound must be greater than lower bound';
    }

    if (formData.upperBoundDiscountRate - formData.lowerBoundDiscountRate < formData.discountRateIncrement) {
        newErrors.discountRateIncrement = 'Increment must be smaller than the difference between bounds';
    }

    // Validate initial investment
    if (formData.initialInvestment <= 0) {
        newErrors.initialInvestment = 'Initial investment must be greater than 0';
    }

    // Validate cash flows
    if (formData.cashFlows.length === 0) {
        newErrors.cashFlows = 'At least one cash flow is required';
    }

    if (formData.cashFlows.some(cf => isNaN(cf))) {
        newErrors.cashFlows = 'All cash flows must be valid numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};