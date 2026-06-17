using Asp.Versioning;
using HelpDesk.Api.Responses;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Route("api/v{version:apiVersion}/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiResponse<object>> Get()
    {
        return Ok(ApiResponse<object>.Ok(new
        {
            status = "Healthy",
            service = "HelpDesk.Api",
            timestamp = DateTime.UtcNow
        }));
    }
}
