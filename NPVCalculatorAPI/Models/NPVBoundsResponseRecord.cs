using System.Text.Json.Serialization;

namespace NPVCalculatorAPI.Models;

public record NPVBoundsResponseRecord(
    [property: JsonPropertyName("npv")] double NpvNetPresentValue,
    [property: JsonPropertyName("discountRate")] double DiscountRate
);