using HelpDesk.Api.Enums;

namespace HelpDesk.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool Active { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Ticket> ClientTickets { get; set; } = [];
    public ICollection<Ticket> TechnicianTickets { get; set; } = [];
    public ICollection<TicketMessage> Messages { get; set; } = [];
}
