using JetBrains.Annotations;
using NPVCalculatorFunction.Functions;
using Xunit;
using System;
using System.Reflection;

namespace NPVCalculatorFunction.Tests.Functions;

[TestSubject(typeof(CalculateNpvFunction))]
public class CalculateNpvFunctionTest
{
    // Helper method to access the private CalculateNpv method via reflection
    private static double InvokeCalculateNpv(double initialInvestment, double discountRate, double[] cashFlows)
    {
        var method = typeof(CalculateNpvFunction).GetMethod("CalculateNpv", 
            BindingFlags.NonPublic | BindingFlags.Static);
        
        if (method == null)
            throw new InvalidOperationException("CalculateNpv method not found");
            
        return (double)method.Invoke(null, new object[] { initialInvestment, discountRate, cashFlows });
    }

    [Fact]
    public void CalculateNpv_WithPositiveNpv_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.1; // 10%
        double[] cashFlows = { 500, 600, 700 };
        
        // Expected NPV = -1000 + 500/1.1 + 600/1.21 + 700/1.331
        // = -1000 + 454.55 + 495.87 + 525.65 = 476.07
        double expectedNpv = -1000 + (500 / Math.Pow(1.1, 1)) + (600 / Math.Pow(1.1, 2)) + (700 / Math.Pow(1.1, 3));
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
    }

    [Fact]
    public void CalculateNpv_WithNegativeNpv_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 2000;
        double discountRate = 0.15; // 15%
        double[] cashFlows = { 300, 400, 500 };
        
        // Expected NPV = -2000 + 300/1.15 + 400/1.3225 + 500/1.520875
        double expectedNpv = -2000 + (300 / Math.Pow(1.15, 1)) + (400 / Math.Pow(1.15, 2)) + (500 / Math.Pow(1.15, 3));
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
        Assert.True(actualNpv < 0);
    }

    [Fact]
    public void CalculateNpv_WithZeroDiscountRate_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.0; // 0%
        double[] cashFlows = { 300, 400, 500 };
        
        // Expected NPV = -1000 + 300 + 400 + 500 = 200
        double expectedNpv = -1000 + 300 + 400 + 500;
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
    }
    
    [Fact]
    public void CalculateNpv_WithVerySmallDiscountRate_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.0001; // 0.01%
        double[] cashFlows = { 300, 400, 500 };
        
        // Expected NPV with very small discount rate should be close to sum of cash flows minus initial investment
        double expectedNpv = -1000 + 300 + 400 + 500;
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 0);
    }

    [Fact]
    public void CalculateNpv_WithSingleCashFlow_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.08; // 8%
        double[] cashFlows = { 1200 };
        
        // Expected NPV = -1000 + 1200/1.08 = 111.11
        double expectedNpv = -1000 + (1200 / Math.Pow(1.08, 1));
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
    }

    [Fact]
    public void CalculateNpv_WithEmptyCashFlows_ReturnsNegativeInitialInvestment()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.1;
        double[] cashFlows = { };
        
        // Expected NPV = -1000 (no cash flows to discount)
        double expectedNpv = -1000;
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
    }

    [Fact]
    public void CalculateNpv_WithNegativeCashFlows_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.1;
        double[] cashFlows = { 800, -200, 600 };
        
        // Expected NPV = -1000 + 800/1.1 + (-200)/1.21 + 600/1.331
        double expectedNpv = -1000 + (800 / Math.Pow(1.1, 1)) + (-200 / Math.Pow(1.1, 2)) + (600 / Math.Pow(1.1, 3));
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
    }

    [Fact]
    public void CalculateNpv_WithHighDiscountRate_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 1000;
        double discountRate = 0.5; // 50%
        double[] cashFlows = { 600, 700, 800 };
        
        // Expected NPV = -1000 + 600/1.5 + 700/2.25 + 800/3.375
        double expectedNpv = -1000 + (600 / Math.Pow(1.5, 1)) + (700 / Math.Pow(1.5, 2)) + (800 / Math.Pow(1.5, 3));
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
    }

    [Fact]
    public void CalculateNpv_WithZeroInitialInvestment_ReturnsCorrectValue()
    {
        // Arrange
        double initialInvestment = 0;
        double discountRate = 0.1;
        double[] cashFlows = { 100, 200, 300 };
        
        // Expected NPV = 0 + 100/1.1 + 200/1.21 + 300/1.331
        double expectedNpv = 0 + (100 / Math.Pow(1.1, 1)) + (200 / Math.Pow(1.1, 2)) + (300 / Math.Pow(1.1, 3));
        
        // Act
        double actualNpv = InvokeCalculateNpv(initialInvestment, discountRate, cashFlows);
        
        // Assert
        Assert.Equal(expectedNpv, actualNpv, precision: 2);
        Assert.True(actualNpv > 0);
    }
}