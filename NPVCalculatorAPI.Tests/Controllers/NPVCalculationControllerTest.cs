using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using JetBrains.Annotations;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using NPVCalculatorAPI.Controllers;
using NPVCalculatorAPI.Models;
using NPVCalculatorFunction.Models;
using Xunit;

namespace NPVCalculatorAPI.Tests.Controllers;

[TestSubject(typeof(NPVCalculationController))]
public class NPVCalculationControllerTest
{
    private readonly Mock<ILogger<NPVCalculationController>> _mockLogger;
    private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
    private readonly HttpClient _httpClient;
    private readonly NPVCalculationController _controller;

    public NPVCalculationControllerTest()
    {
        _mockLogger = new Mock<ILogger<NPVCalculationController>>();
        _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_mockHttpMessageHandler.Object);
        _controller = new NPVCalculationController(_mockLogger.Object, _httpClient);
    }

    [Fact]
    public async Task GetCalculateNPV_WithValidInput_ReturnsExpectedNPVValues()
    {
        // Arrange
        var boundsRequest = new NPVBoundsRequest(
            LowerBoundDiscountRate: 0.05,
            UpperBoundDiscountRate: 0.10,
            DiscountRateIncrement: 0.025,
            CashFlows: new[] { 200.0, 300.0, 400.0 },
            InitialInvestment: 1000.0
        );

        // Mock responses for different discount rates (0.05, 0.075, 0.10)
        var mockResponses = new Dictionary<string, double>
        {
            { "0.100", 67.89 },
            { "0.075", 89.12 },
            { "0.050", 123.45 }
        };

        _mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Returns<HttpRequestMessage, CancellationToken>((request, cancellationToken) =>
            {
                var requestContent = request.Content!.ReadAsStringAsync().Result;
                var requestData = JsonSerializer.Deserialize<NpvRequest>(requestContent, 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var npvResponse = new NpvResponse(mockResponses[requestData!.DiscountRate.ToString("F3")]);
                var responseContent = JsonSerializer.Serialize(npvResponse);

                return Task.FromResult(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseContent, Encoding.UTF8, "application/json")
                });
            });

        // Act
        var result = await _controller.GetCalculateNPV(boundsRequest);

        // Assert
        var npvResults = result.ToList();
        Assert.Equal(3, npvResults.Count);
        
        // Results should be ordered by discount rate ascending
        Assert.Equal(123.45, npvResults[0], precision: 2); // 0.05 discount rate
        Assert.Equal(89.12, npvResults[1], precision: 2); // 0.075 discount rate
        Assert.Equal(67.89, npvResults[2], precision: 2); // 0.10 discount rate
    }

    [Fact]
    public async Task GetCalculateNPV_WithInvalidHttpResponse_LogsErrorAndContinues()
    {
        // Arrange
        var boundsRequest = new NPVBoundsRequest(
            LowerBoundDiscountRate: 0.05,
            UpperBoundDiscountRate: 0.05,
            DiscountRateIncrement: 0.025,
            CashFlows: new[] { 200.0 },
            InitialInvestment: 1000.0
        );

        _mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.BadRequest,
                Content = new StringContent("Invalid request", Encoding.UTF8, "application/json")
            });

        // Act
        var result = await _controller.GetCalculateNPV(boundsRequest);

        // Assert
        var npvResults = result.ToList();
        Assert.Empty(npvResults); // No successful results

        // Verify error was logged
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error calculating NPV for discount rate")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetCalculateNPV_WithZeroIncrement_ReturnsEmptyResult()
    {
        // Arrange
        var boundsRequest = new NPVBoundsRequest(
            LowerBoundDiscountRate: 0.05,
            UpperBoundDiscountRate: 0.10,
            DiscountRateIncrement: 0.0, // Zero increment would cause infinite loop
            CashFlows: new[] { 200.0 },
            InitialInvestment: 1000.0
        );

        // Act
        var result = await _controller.GetCalculateNPV(boundsRequest);

        // Assert
        var npvResults = result.ToList();
        Assert.Empty(npvResults);
    }

    [Fact]
    public async Task GetCalculateNPV_WithNegativeIncrement_ReturnsEmptyResult()
    {
        // Arrange
        var boundsRequest = new NPVBoundsRequest(
            LowerBoundDiscountRate: 0.05,
            UpperBoundDiscountRate: 0.10,
            DiscountRateIncrement: -0.025, // Negative increment
            CashFlows: new[] { 200.0 },
            InitialInvestment: 1000.0
        );

        // Act
        var result = await _controller.GetCalculateNPV(boundsRequest);

        // Assert
        var npvResults = result.ToList();
        Assert.Empty(npvResults);
    }

    [Fact]
    public async Task GetCalculateNPV_WithUpperBoundLowerThanLowerBound_ReturnsEmptyResult()
    {
        // Arrange
        var boundsRequest = new NPVBoundsRequest(
            LowerBoundDiscountRate: 0.10,
            UpperBoundDiscountRate: 0.05, // Upper bound less than lower bound
            DiscountRateIncrement: 0.025,
            CashFlows: [200.0],
            InitialInvestment: 1000.0
        );

        // Act
        var result = await _controller.GetCalculateNPV(boundsRequest);

        // Assert
        var npvResults = result.ToList();
        Assert.Empty(npvResults); // No results because the condition is never met
    }

    [Fact]
    public async Task GetCalculateNPV_WithSingleDiscountRate_ReturnsOneResult()
    {
        // Arrange
        var boundsRequest = new NPVBoundsRequest(
            LowerBoundDiscountRate: 0.05,
            UpperBoundDiscountRate: 0.05, // Same upper and lower bounds
            DiscountRateIncrement: 0.025,
            CashFlows: [200.0, 300.0],
            InitialInvestment: 1000.0
        );

        _mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(
                    JsonSerializer.Serialize(new NpvResponse(125.5)), 
                    Encoding.UTF8, 
                    "application/json")
            });

        // Act
        var result = await _controller.GetCalculateNPV(boundsRequest);

        // Assert
        var npvResults = result.ToList();
        Assert.Single(npvResults);
        Assert.Equal(125.5, npvResults[0]);
    }
}