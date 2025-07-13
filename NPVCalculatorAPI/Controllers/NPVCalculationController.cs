using Microsoft.AspNetCore.Mvc;
using NPVCalculatorAPI.Models;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Text;
using NPVCalculatorFunction.Models;

namespace NPVCalculatorAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class NPVCalculationController : ControllerBase
{
    private readonly ILogger<NPVCalculationController> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _functionAppUrl = "http://localhost:7073/api/CalculateNpv";

    public NPVCalculationController(ILogger<NPVCalculationController> logger, HttpClient httpClient)
    {
        _logger = logger;
        _httpClient = httpClient;
    }

    [HttpPost(Name = "CalculateNPV")]
    public async Task<IEnumerable<NPVBoundsResponseRecord>> GetCalculateNPV([FromBody] NPVBoundsRequest boundsRequest)
    {
        var discountRates = new List<double>();
        var currentRate = boundsRequest.LowerBoundDiscountRate;

        if (boundsRequest.DiscountRateIncrement <= 0)
        {
            _logger.LogError("Invalid discount rate increment");
            return [];
        }
        
        // Generate all discount rates to test
        while (currentRate <= boundsRequest.UpperBoundDiscountRate)
        {
            discountRates.Add(currentRate);
            currentRate += boundsRequest.DiscountRateIncrement;
        }

        // Thread-safe collection to store results
        var npvResults = new ConcurrentBag<(double DiscountRate, double NPV)>();

        // Create tasks for parallel execution
        var tasks = discountRates.Select(async discountRate =>
        {
            try
            {
                var requestData = new
                {
                    initialInvestment = boundsRequest.InitialInvestment,
                    discountRate = discountRate,
                    cashFlows = boundsRequest.CashFlows
                };

                var jsonContent = JsonSerializer.Serialize(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_functionAppUrl, content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var npvResponse = JsonSerializer.Deserialize<NpvResponse>(responseContent);

                npvResults.Add((discountRate, npvResponse!.NpvNetPresentValue));
                
                _logger.LogInformation($"NPV calculated for discount rate {discountRate}: {npvResponse.NpvNetPresentValue}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error calculating NPV for discount rate {discountRate}");
            }
        });

        // Execute all tasks concurrently
        await Task.WhenAll(tasks);

        // Return results ordered by discount rate
        return npvResults
            .OrderBy(x => x.DiscountRate)
            .Select(x => new NPVBoundsResponseRecord(x.NPV, x.DiscountRate));
    }
}