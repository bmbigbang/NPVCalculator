
export interface NPVCalculationRequest {
    lowerBoundDiscountRate: number;
    upperBoundDiscountRate: number;
    discountRateIncrement: number;
    cashFlows: number[];
    initialInvestment: number;
}


export interface FormErrors {
    lowerBoundDiscountRate?: string;
    upperBoundDiscountRate?: string;
    discountRateIncrement?: string;
    cashFlows?: string;
    initialInvestment?: string;
    general?: string;
}

export type NPVCalculationResponse = {
    npv: number;
    discountRate: number;
}
