using HelpDesk.Api.DTOs.Messages;
using HelpDesk.Api.Enums;

namespace HelpDesk.Api.Services.Interfaces;

public interface ITicketMessageService
{
    Task<IReadOnlyList<TicketMessageResponseDto>> GetByTicketAsync(Guid ticketId, Guid currentUserId, UserRole currentUserRole);
    Task<TicketMessageResponseDto> CreateAsync(Guid ticketId, CreateTicketMessageDto dto, Guid currentUserId, UserRole currentUserRole, string currentUserName);
}
