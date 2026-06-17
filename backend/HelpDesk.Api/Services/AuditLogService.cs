using HelpDesk.Api.Data;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;

namespace HelpDesk.Api.Services;

public class AuditLogService(AppDbContext context) : IAuditLogService
{
    public async Task RegisterAsync(string action, string userName, string description)
    {
        context.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            UserName = userName,
            Description = description,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
    }
}
