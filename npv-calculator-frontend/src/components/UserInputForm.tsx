import {FaPlus, FaTrash} from "react-icons/fa";
import React, {useState, type Dispatch, type SetStateAction} from "react";
import type {FormErrors, NPVCalculationRequest} from "../types/api.ts";
import {validateForm} from "./validateForm.ts";

type Props = {
    setFormData: Dispatch<SetStateAction<NPVCalculationRequest>>
    formData: NPVCalculationRequest
    loading: boolean
    setSubmit: Dispatch<SetStateAction<boolean>>
}

export const UserInputForm = ({ setFormData, formData, loading, setSubmit } : Props) => {
    const [errors, setErrors] = useState<FormErrors>({});
    
    const handleInputChange = (field: keyof NPVCalculationRequest, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleCashFlowChange = (index: number, value: number) => {
        const newCashFlows = [...formData.cashFlows];
        newCashFlows[index] = value;
        setFormData(prev => ({
            ...prev,
            cashFlows: newCashFlows
        }));
    };

    const addCashFlow = () => {
        setFormData(prev => ({
            ...prev,
            cashFlows: [...prev.cashFlows, 0]
        }));
    };

    const removeCashFlow = (index: number) => {
        if (formData.cashFlows.length > 1) {
            const newCashFlows = formData.cashFlows.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                cashFlows: newCashFlows
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm(formData, setErrors)) {
            return;
        }

        setErrors({});

        setFormData(formData)
        setSubmit(true)
    };
    
    return <>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Input Parameters</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Discount Rate Range */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Discount Rate Range</h3>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label whitespace-nowrap">Lower Bound (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="1"
                            value={formData.lowerBoundDiscountRate}
                            onChange={(e) => handleInputChange('lowerBoundDiscountRate', parseFloat(e.target.value) || 0)}
                            className={`form-input ${errors.lowerBoundDiscountRate ? 'border-red-500' : ''}`}
                            placeholder="e.g., 0.05"
                        />
                        {errors.lowerBoundDiscountRate && (
                            <p className="error-message">{errors.lowerBoundDiscountRate}</p>
                        )}
                    </div>
    
                    <div className="form-group">
                        <label className="form-label whitespace-nowrap">Upper Bound (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="1"
                            value={formData.upperBoundDiscountRate}
                            onChange={(e) => handleInputChange('upperBoundDiscountRate', parseFloat(e.target.value) || 0)}
                            className={`form-input ${errors.upperBoundDiscountRate ? 'border-red-500' : ''}`}
                            placeholder="e.g., 0.15"
                        />
                        {errors.upperBoundDiscountRate && (
                            <p className="error-message">{errors.upperBoundDiscountRate}</p>
                        )}
                    </div>
                </div>
    
                <div className="form-group">
                    <label className="form-label whitespace-nowrap">Increment (%)</label>
                    <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        max="0.1"
                        value={formData.discountRateIncrement}
                        onChange={(e) => handleInputChange('discountRateIncrement', parseFloat(e.target.value) || 0)}
                        className={`form-input ${errors.discountRateIncrement ? 'border-red-500' : ''}`}
                        placeholder="e.g., 0.01"
                    />
                    {errors.discountRateIncrement && (
                        <p className="error-message">{errors.discountRateIncrement}</p>
                    )}
                </div>
            </div>
    
            {/* Initial Investment */}
            <div className="form-group">
                <label className="form-label">Initial Investment ($)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.initialInvestment}
                    onChange={(e) => handleInputChange('initialInvestment', parseFloat(e.target.value) || 0)}
                    className={`form-input ${errors.initialInvestment ? 'border-red-500' : ''}`}
                    placeholder="e.g., 50000"
                />
                {errors.initialInvestment && (
                    <p className="error-message">{errors.initialInvestment}</p>
                )}
            </div>
    
            {/* Cash Flows */}
            <div className="form-group">
                <div className="flex justify-between items-center mb-3">
                    <label className="form-label">Cash Flows ($)</label>
                    <button
                        type="button"
                        onClick={addCashFlow}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FaPlus className="mr-1" />
                        Add Year
                    </button>
                </div>
    
                <div className="space-y-2">
                    {formData.cashFlows.map((cashFlow, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 w-16">{index + 1}:</span>
                            <input
                                type="number"
                                step="0.01"
                                value={cashFlow}
                                onChange={(e) => handleCashFlowChange(index, parseFloat(e.target.value) || 0)}
                                className="form-input flex-1"
                                placeholder="e.g., 15000"
                            />
                            {formData.cashFlows.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeCashFlow(index)}
                                    className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {errors.cashFlows && (
                    <p className="error-message">{errors.cashFlows}</p>
                )}
            </div>
    
            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
                {loading ? 'Calculating...' : 'Calculate NPV'}
            </button>
    
            {/* General Error */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800">{errors.general}</p>
                </div>
            )}
        </form>
    </>
}