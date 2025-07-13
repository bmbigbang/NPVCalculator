import React, { useState } from 'react';
import { FaCalculator } from 'react-icons/fa';
import type {NPVCalculationRequest} from "./types/api";
import {useCalculateNPV} from "./hooks/useCalculateNPV";
import {UserInputForm} from "./components/UserInputForm.tsx";
import {NPVChart} from "./components/NPVChart.tsx";


const NPVCalculator: React.FC = () => {
  const [formData, setFormData] = useState<NPVCalculationRequest>({
    lowerBoundDiscountRate: 0.05,
    upperBoundDiscountRate: 0.15,
    discountRateIncrement: 0.01,
    cashFlows: [1000, 1500, 2000],
    initialInvestment: 5000
  });
  
  const [submit, setSubmit] = useState(false);
  const { npvValues, loading } = useCalculateNPV(formData, submit, setSubmit);

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
            <UserInputForm setFormData={setFormData} formData={formData} loading={loading} setSubmit={setSubmit} />
          </div>

          {/* Right Side - Chart Placeholder */}
          <div className="md:col-span-12 lg:col-span-8 bg-white rounded-lg shadow-md p-6  flex flex-col items-center justify-center">
            <NPVChart npvValues={npvValues} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPVCalculator;