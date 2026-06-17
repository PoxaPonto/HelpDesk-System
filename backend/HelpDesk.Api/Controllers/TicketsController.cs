using System.Security.Claims;
using Asp.Versioning;
using HelpDesk.Api.DTOs.Tickets;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Responses;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Authorize]
[Route("api/v{version:apiVersion}/tickets")]
public class TicketsController(ITicketService ticketService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TicketResponseDto>>>> GetAll([FromQuery] TicketQueryDto query)
    {
        var tickets = await ticketService.GetAllAsync(query, GetCurrentUserId(), GetCurrentUserRole());
        return Ok(ApiResponse<IReadOnlyList<TicketResponseDto>>.Ok(tickets));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TicketResponseDto>>> GetById(Guid id)
    {
        var ticket = await ticketService.GetByIdAsync(id, GetCurrentUserId(), GetCurrentUserRole());
        return Ok(ApiResponse<TicketResponseDto>.Ok(ticket));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TicketResponseDto>>> Create(CreateTicketDto dto)
    {
        var ticket = await ticketService.CreateAsync(dto, GetCurrentUserId(), GetCurrentUserRole(), GetCurrentUserName());
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id, version = "1" }, ApiResponse<TicketResponseDto>.Ok(ticket, "Chamado criado com sucesso."));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TicketResponseDto>>> Update(Guid id, UpdateTicketDto dto)
    {
        var ticket = await ticketService.UpdateAsync(id, dto, GetCurrentUserId(), GetCurrentUserRole());
        return Ok(ApiResponse<TicketResponseDto>.Ok(ticket, "Chamado atualizado com sucesso."));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<TicketResponseDto>>> UpdateStatus(Guid id, UpdateTicketStatusDto dto)
    {
        var ticket = await ticketService.UpdateStatusAsync(id, dto, GetCurrentUserId(), GetCurrentUserRole(), GetCurrentUserName());
        return Ok(ApiResponse<TicketResponseDto>.Ok(ticket, "Status atualizado com sucesso."));
    }

    [HttpPut("{id:guid}/assign")]
    public async Task<ActionResult<ApiResponse<TicketResponseDto>>> Assign(Guid id, AssignTicketDto dto)
    {
        var ticket = await ticketService.AssignAsync(id, dto, GetCurrentUserId(), GetCurrentUserRole(), GetCurrentUserName());
        return Ok(ApiResponse<TicketResponseDto>.Ok(ticket, "Chamado atribuido com sucesso."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await ticketService.DeleteAsync(id, GetCurrentUserId(), GetCurrentUserRole());
        return Ok(ApiResponse<object>.Ok(new { }, "Chamado excluido com sucesso."));
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
