namespace HelpDesk.Api.DTOs.Dashboard;

public class DashboardResponseDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int InProgressTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int ClosedTickets { get; set; }
    public int CriticalTickets { get; set; }
    public int TotalUsers { get; set; }
    public int TotalTechnicians { get; set; }
    public double AverageResolutionHours { get; set; }
    public IReadOnlyList<DashboardChartItemDto> TicketsByCategory { get; set; } = [];
    public IReadOnlyList<DashboardChartItemDto> TicketsByPriority { get; set; } = [];
    public IReadOnlyList<DashboardChartItemDto> TicketsByStatus { get; set; } = [];
    public IReadOnlyList<DashboardChartItemDto> TicketsByTechnician { get; set; } = [];
    public IReadOnlyList<DashboardChartItemDto> ActiveTechnicians { get; set; } = [];
    public IReadOnlyList<DashboardChartItemDto> ResolvedTicketsByTechnician { get; set; } = [];
    public IReadOnlyList<DashboardChartItemDto> TicketsByMonth { get; set; } = [];
}
