using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Dashboard;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Services;

public class DashboardService(AppDbContext context) : IDashboardService
{
    public async Task<DashboardResponseDto> GetAsync(Guid currentUserId, UserRole currentUserRole)
    {
        var tickets = ApplyRoleScope(context.Tickets.AsNoTracking(), currentUserId, currentUserRole);

        var totalTickets = await tickets.CountAsync();
        var openTickets = await tickets.CountAsync(ticket => ticket.Status == TicketStatus.Open);
        var inProgressTickets = await tickets.CountAsync(ticket => ticket.Status == TicketStatus.InProgress);
        var resolvedTickets = await tickets.CountAsync(ticket => ticket.Status == TicketStatus.Resolved);
        var closedTickets = await tickets.CountAsync(ticket => ticket.Status == TicketStatus.Closed);
        var criticalTickets = await tickets.CountAsync(ticket => ticket.Priority == TicketPriority.Critical);

        var resolutionDates = await tickets
            .Where(ticket =>
                (ticket.Status == TicketStatus.Resolved || ticket.Status == TicketStatus.Closed) &&
                ticket.UpdatedAt.HasValue)
            .Select(ticket => new
            {
                ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt!.Value
            })
            .ToListAsync();

        var averageResolutionHours = resolutionDates.Count == 0
            ? 0
            : Math.Round(resolutionDates.Average(item => (item.UpdatedAt - item.CreatedAt).TotalHours), 2);

        return new DashboardResponseDto
        {
            TotalTickets = totalTickets,
            OpenTickets = openTickets,
            InProgressTickets = inProgressTickets,
            ResolvedTickets = resolvedTickets,
            ClosedTickets = closedTickets,
            CriticalTickets = criticalTickets,
            TotalUsers = currentUserRole == UserRole.Admin ? await context.Users.AsNoTracking().CountAsync() : 0,
            TotalTechnicians = currentUserRole == UserRole.Admin
                ? await context.Users.AsNoTracking().CountAsync(user => user.Role == UserRole.Technician)
                : 0,
            AverageResolutionHours = averageResolutionHours,
            TicketsByCategory = await GetByCategoryAsync(tickets),
            TicketsByPriority = await GetByPriorityAsync(tickets),
            TicketsByStatus = await GetByStatusAsync(tickets),
            TicketsByTechnician = await GetByTechnicianAsync(tickets)
        };
    }

    private static IQueryable<Ticket> ApplyRoleScope(IQueryable<Ticket> tickets, Guid currentUserId, UserRole currentUserRole)
    {
        return currentUserRole switch
        {
            UserRole.Admin => tickets,
            UserRole.Technician => tickets.Where(ticket => ticket.TechnicianId == currentUserId),
            UserRole.Client => tickets.Where(ticket => ticket.ClientId == currentUserId),
            _ => tickets.Where(ticket => false)
        };
    }

    private static async Task<IReadOnlyList<DashboardChartItemDto>> GetByCategoryAsync(IQueryable<Ticket> tickets)
    {
        return await tickets
            .GroupBy(ticket => ticket.Category!.Name)
            .Select(group => new DashboardChartItemDto
            {
                Label = group.Key,
                Value = group.Count()
            })
            .OrderByDescending(item => item.Value)
            .ToListAsync();
    }

    private static async Task<IReadOnlyList<DashboardChartItemDto>> GetByPriorityAsync(IQueryable<Ticket> tickets)
    {
        var data = await tickets
            .GroupBy(ticket => ticket.Priority)
            .Select(group => new
            {
                Priority = group.Key,
                Value = group.Count()
            })
            .ToListAsync();

        return data
            .Select(item => new DashboardChartItemDto
            {
                Label = item.Priority.ToString(),
                Value = item.Value
            })
            .OrderByDescending(item => item.Value)
            .ToList();
    }

    private static async Task<IReadOnlyList<DashboardChartItemDto>> GetByStatusAsync(IQueryable<Ticket> tickets)
    {
        var data = await tickets
            .GroupBy(ticket => ticket.Status)
            .Select(group => new
            {
                Status = group.Key,
                Value = group.Count()
            })
            .ToListAsync();

        return data
            .Select(item => new DashboardChartItemDto
            {
                Label = item.Status.ToString(),
                Value = item.Value
            })
            .OrderByDescending(item => item.Value)
            .ToList();
    }

    private static async Task<IReadOnlyList<DashboardChartItemDto>> GetByTechnicianAsync(IQueryable<Ticket> tickets)
    {
        return await tickets
            .GroupBy(ticket => ticket.Technician == null ? "Nao atribuido" : ticket.Technician.Name)
            .Select(group => new DashboardChartItemDto
            {
                Label = group.Key,
                Value = group.Count()
            })
            .OrderByDescending(item => item.Value)
            .ToListAsync();
    }
}
