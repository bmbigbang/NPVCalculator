using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using NPVCalculatorFunction.Models;

namespace NPVCalculatorFunction.Functions;

public class CalculateNpvFunction
{
    private readonly ILogger _logger;

    public CalculateNpvFunction(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<CalculateNpvFunction>();
    }

    [Function("CalculateNpv")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request to calculate NPV.");

        try
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var npvRequest = JsonSerializer.Deserialize<NpvRequest>(requestBody, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (npvRequest == null)
            {
                return CreateErrorResponse(req, "Invalid request format", HttpStatusCode.BadRequest);
            }

            // Calculate NPV
            double npvValue = CalculateNpv(
                npvRequest.InitialInvestment, 
                npvRequest.DiscountRate, 
                npvRequest.CashFlows);

            // Create the response
            var response = req.CreateResponse(HttpStatusCode.OK);
            
            await response.WriteAsJsonAsync(new NpvResponse(npvValue));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing NPV calculation request");
            return CreateErrorResponse(req, "Error processing request: " + ex.Message, HttpStatusCode.InternalServerError);
        }
    }

    private static double CalculateNpv(double initialInvestment, double discountRate, double[] cashFlows)
    {
        // NPV = -Initial Investment + Sum(Cash Flow_t / (1 + r)^t)
        // where t is the time period and r is the discount rate
        
        double npv = -initialInvestment;
        
        for (int t = 0; t < cashFlows.Length; t++)
        {
            // The period 't' in the formula starts from 1, so we use (t + 1)
            npv += cashFlows[t] / Math.Pow(1 + discountRate, t + 1);
        }
        
        return npv;
    }

    private static HttpResponseData CreateErrorResponse(HttpRequestData req, string message, HttpStatusCode statusCode)
    {
        var response = req.CreateResponse(statusCode);
        response.WriteString(JsonSerializer.Serialize(new { error = message }));
        return response;
    }
}
