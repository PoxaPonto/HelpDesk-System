using HelpDesk.Api.DTOs.Dashboard;
using HelpDesk.Api.Enums;

namespace HelpDesk.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetAsync(Guid currentUserId, UserRole currentUserRole);
}
