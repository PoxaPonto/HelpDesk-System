using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Messages;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Services;

public class TicketMessageService(
    AppDbContext context,
    IAuditLogService auditLogService) : ITicketMessageService
{
    public async Task<IReadOnlyList<TicketMessageResponseDto>> GetByTicketAsync(
        Guid ticketId,
        Guid currentUserId,
        UserRole currentUserRole)
    {
        var ticket = await context.Tickets.AsNoTracking().FirstOrDefaultAsync(ticket => ticket.Id == ticketId)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        EnsureCanAccessTicket(ticket, currentUserId, currentUserRole);

        return await context.TicketMessages
            .AsNoTracking()
            .Include(message => message.User)
            .Where(message => message.TicketId == ticketId)
            .OrderBy(message => message.CreatedAt)
            .Select(message => ToResponse(message))
            .ToListAsync();
    }

    public async Task<TicketMessageResponseDto> CreateAsync(
        Guid ticketId,
        CreateTicketMessageDto dto,
        Guid currentUserId,
        UserRole currentUserRole,
        string currentUserName)
    {
        var ticket = await context.Tickets.FirstOrDefaultAsync(ticket => ticket.Id == ticketId)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        EnsureCanAccessTicket(ticket, currentUserId, currentUserRole);

        var message = new TicketMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticketId,
            UserId = currentUserId,
            Message = dto.Message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        ticket.UpdatedAt = DateTime.UtcNow;
        context.TicketMessages.Add(message);
        await context.SaveChangesAsync();

        await auditLogService.RegisterAsync(
            "TicketMessageCreated",
            currentUserName,
            $"Mensagem enviada no chamado {ticket.Id}.");

        var createdMessage = await context.TicketMessages
            .AsNoTracking()
            .Include(item => item.User)
            .FirstAsync(item => item.Id == message.Id);

        return ToResponse(createdMessage);
    }

    private static void EnsureCanAccessTicket(Ticket ticket, Guid currentUserId, UserRole currentUserRole)
    {
        if (currentUserRole == UserRole.Admin)
        {
            return;
        }

        if (currentUserRole == UserRole.Client && ticket.ClientId == currentUserId)
        {
            return;
        }

        if (currentUserRole == UserRole.Technician && (ticket.TechnicianId == currentUserId || ticket.TechnicianId is null))
        {
            return;
        }

        throw new UnauthorizedAccessException("Voce nao tem permissao para acessar mensagens deste chamado.");
    }

    private static TicketMessageResponseDto ToResponse(TicketMessage message)
    {
        return new TicketMessageResponseDto
        {
            Id = message.Id,
            TicketId = message.TicketId,
            UserId = message.UserId,
            UserName = message.User?.Name ?? string.Empty,
            UserRole = message.User?.Role.ToString() ?? string.Empty,
            Message = message.Message,
            CreatedAt = message.CreatedAt
        };
    }
}
