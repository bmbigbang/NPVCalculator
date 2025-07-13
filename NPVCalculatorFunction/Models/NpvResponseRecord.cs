using System.Text.Json.Serialization;

namespace NPVCalculatorFunction.Models;

public record NpvResponse(
    [property: JsonPropertyName("npv")] double NpvNetPresentValue
);
