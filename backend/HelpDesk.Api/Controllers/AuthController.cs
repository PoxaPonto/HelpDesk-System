using System.Security.Claims;
using Asp.Versioning;
using HelpDesk.Api.DTOs.Auth;
using HelpDesk.Api.Responses;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(RegisterDto dto)
    {
        var result = await authService.RegisterAsync(dto);
        return Created(string.Empty, ApiResponse<AuthResponseDto>.Ok(result, "Usuario cadastrado com sucesso."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(LoginDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login realizado com sucesso."));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserSummaryDto>>> GetMe()
    {
        var result = await authService.GetProfileAsync(GetCurrentUserId());
        return Ok(ApiResponse<UserSummaryDto>.Ok(result));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<UserSummaryDto>>> UpdateMe(UpdateProfileDto dto)
    {
        var result = await authService.UpdateProfileAsync(GetCurrentUserId(), dto);
        return Ok(ApiResponse<UserSummaryDto>.Ok(result, "Perfil atualizado com sucesso."));
    }

    [Authorize]
    [HttpPut("me/password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword(ChangePasswordDto dto)
    {
        await authService.ChangePasswordAsync(GetCurrentUserId(), dto);
        return Ok(ApiResponse<object>.Ok(new { }, "Senha alterada com sucesso."));
    }

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Usuario autenticado invalido.");
    }
}
