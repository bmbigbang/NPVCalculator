﻿using System.Text.Json.Serialization;

namespace NPVCalculatorAPI.Models;

public record NPVBoundsRequest(
    [property: JsonPropertyName("lowerBoundDiscountRate")] double LowerBoundDiscountRate, 
    [property: JsonPropertyName("upperBoundDiscountRate")] double UpperBoundDiscountRate, 
    [property: JsonPropertyName("discountRateIncrement")] double DiscountRateIncrement,
    [property: JsonPropertyName("cashFlows")] double[] CashFlows,
    [property: JsonPropertyName("initialInvestment")] double InitialInvestment);