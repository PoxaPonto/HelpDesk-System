namespace HelpDesk.Api.DTOs.Tickets;

public class TicketQueryDto
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public Guid? CategoryId { get; set; }
}
