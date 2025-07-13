import React, { useState } from 'react';
import { FaCalculator, FaPlus, FaTrash } from 'react-icons/fa';
import type {FormErrors, NPVCalculationRequest} from "./types/api";
import {useCalculateNPV} from "./hooks/useCalculateNPV";
import {validateForm} from "./components/validateForm.ts";

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


const NPVCalculator: React.FC = () => {
  const [formData, setFormData] = useState<NPVCalculationRequest>({
    lowerBoundDiscountRate: 0.05,
    upperBoundDiscountRate: 0.15,
    discountRateIncrement: 0.01,
    cashFlows: [1000, 1500, 2000],
    initialInvestment: 5000
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submit, setSubmit] = useState(false);
  const { npvValues, loading } = useCalculateNPV(formData, submit, setSubmit);
  

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 mx-4">
          <div className="flex justify-center items-center mb-4">
            <FaCalculator className="text-4xl text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">NPV Calculator</h1>
          </div>
          <p className="text-lg text-gray-600">
            Calculate Net Present Value with customizable discount rate ranges
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mx-4">
          {/* Left Side - Form */}
          <div className="md:col-span-12 lg:col-span-4 bg-white rounded-lg shadow-md p-6">
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
          </div>

          {/* Right Side - Chart Placeholder */}
          <div className="md:col-span-12 lg:col-span-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results & Visualization</h2>
            
            {npvValues.length > 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {/* Chart placeholder */}
                <div className="text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-lg font-medium">NPV Sensitivity Chart</p>
                  <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: 'line',
                          height: 400,
                          backgroundColor: 'transparent'
                        },
                        title: {
                          text: 'NPV vs Discount Rate',
                          style: {
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }
                        },
                        xAxis: {
                          title: {
                            text: 'Discount Rate (%)'
                          },
                          labels: {
                            formatter: function() {
                              const point = this as any;
                              return (point.value * 100).toFixed(1) + '%';
                            }
                          },
                          gridLineWidth: 1,
                          gridLineDashStyle: 'dot'
                        },
                        yAxis: {
                          title: {
                            text: 'Net Present Value ($)'
                          },
                          labels: {
                            formatter: function() {
                              const point = this as any;
                              return '$' + point.value.toLocaleString();
                            }
                          },
                          gridLineWidth: 1,
                          gridLineDashStyle: 'dot'
                        },
                        series: [{
                          name: 'NPV',
                          data: npvValues.map(item => [item.discountRate, item.npv]),
                          color: '#3B82F6',
                          lineWidth: 2,
                          marker: {
                            enabled: true,
                            radius: 4,
                            fillColor: '#3B82F6'
                          }
                        }],
                        legend: {
                          enabled: false
                        },
                        tooltip: {
                          formatter: function() {
                            const point = this as any;
                            return `<b>Discount Rate:</b> ${(point.x * 100).toFixed(3)}%<br/>` +
                                `<b>NPV:</b> $${point.y.toLocaleString(undefined, {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3
                                })}`;
                          }
                        },
                        plotOptions: {
                          line: {
                            dataLabels: {
                              enabled: false
                            }
                          }
                        },
                        credits: {
                          enabled: false
                        }
                      }}
                  />

                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-gray-500">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-xl font-medium mb-2">Ready for Analysis</p>
                  <p className="text-gray-600">Enter your parameters and click "Calculate NPV" to see results and visualization</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPVCalculator;