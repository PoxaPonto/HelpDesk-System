using System.Security.Claims;
using Asp.Versioning;
using HelpDesk.Api.DTOs.Messages;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Responses;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Authorize]
[Route("api/v{version:apiVersion}/tickets/{ticketId:guid}/messages")]
public class TicketMessagesController(ITicketMessageService ticketMessageService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TicketMessageResponseDto>>>> GetByTicket(Guid ticketId)
    {
        var messages = await ticketMessageService.GetByTicketAsync(ticketId, GetCurrentUserId(), GetCurrentUserRole());
        return Ok(ApiResponse<IReadOnlyList<TicketMessageResponseDto>>.Ok(messages));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TicketMessageResponseDto>>> Create(Guid ticketId, CreateTicketMessageDto dto)
    {
        var message = await ticketMessageService.CreateAsync(
            ticketId,
            dto,
            GetCurrentUserId(),
            GetCurrentUserRole(),
            GetCurrentUserName());

        return Created(string.Empty, ApiResponse<TicketMessageResponseDto>.Ok(message, "Mensagem enviada com sucesso."));
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

    private string GetCurrentUserName()
    {
        return User.FindFirstValue(ClaimTypes.Name) ?? "Usuario autenticado";
    }
}
