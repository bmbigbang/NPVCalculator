using Microsoft.AspNetCore.Mvc;
using NPVCalculatorAPI.Models;
using NPVCalculatorFunction.Models;

namespace NPVCalculatorAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class NPVCalculationController : ControllerBase
{
    private readonly ILogger<NPVCalculationController> _logger;

    public NPVCalculationController(ILogger<NPVCalculationController> logger)
    {
        _logger = logger;
    }

    [HttpPost(Name = "CalculateNPV")]
    public IEnumerable<(NPVBoundsRequest Request, NpvResponse Response)> GetCalculateNPV([FromBody] NPVBoundsRequest boundsRequest)
    {
        return [];
    }
}