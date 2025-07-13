
namespace NPVCalculatorFunction.Models;

public record NpvRequest(
    double InitialInvestment,
    double DiscountRate,
    double[] CashFlows
);
