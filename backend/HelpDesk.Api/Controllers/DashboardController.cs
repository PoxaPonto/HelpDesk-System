using System.Security.Claims;
using Asp.Versioning;
using HelpDesk.Api.DTOs.Dashboard;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Responses;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Authorize(Roles = "Admin")]
[Route("api/v{version:apiVersion}/dashboard")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardResponseDto>>> Get()
    {
        var dashboard = await dashboardService.GetAsync(GetCurrentUserId(), GetCurrentUserRole());
        return Ok(ApiResponse<DashboardResponseDto>.Ok(dashboard));
    }

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Usuario autenticado invalido.");
    }

    private UserRole GetCurrentUserRole()
    {
        var value = User.FindFirstValue(ClaimTypes.Role);
        return Enum.TryParse<UserRole>(value, true, out var role)
            ? role
            : throw new UnauthorizedAccessException("Perfil autenticado invalido.");
    }
}
