using HelpDesk.Api.DTOs.Tickets;
using HelpDesk.Api.Enums;

namespace HelpDesk.Api.Services.Interfaces;

public interface ITicketService
{
    Task<IReadOnlyList<TicketResponseDto>> GetAllAsync(TicketQueryDto query, Guid currentUserId, UserRole currentUserRole);
    Task<TicketResponseDto> GetByIdAsync(Guid id, Guid currentUserId, UserRole currentUserRole);
    Task<TicketResponseDto> CreateAsync(CreateTicketDto dto, Guid currentUserId, UserRole currentUserRole, string currentUserName);
    Task<TicketResponseDto> UpdateAsync(Guid id, UpdateTicketDto dto, Guid currentUserId, UserRole currentUserRole);
    Task<TicketResponseDto> UpdateStatusAsync(Guid id, UpdateTicketStatusDto dto, Guid currentUserId, UserRole currentUserRole, string currentUserName);
    Task<TicketResponseDto> AssignAsync(Guid id, AssignTicketDto dto, Guid currentUserId, UserRole currentUserRole, string currentUserName);
    Task DeleteAsync(Guid id, Guid currentUserId, UserRole currentUserRole);
}
