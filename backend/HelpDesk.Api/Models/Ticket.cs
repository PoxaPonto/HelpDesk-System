using HelpDesk.Api.Enums;

namespace HelpDesk.Api.Models;

public class Ticket
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public Guid CategoryId { get; set; }
    public Guid ClientId { get; set; }
    public Guid? TechnicianId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Category? Category { get; set; }
    public User? Client { get; set; }
    public User? Technician { get; set; }
    public ICollection<TicketMessage> Messages { get; set; } = [];
}
