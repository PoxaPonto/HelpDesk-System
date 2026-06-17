namespace HelpDesk.Api.Services.Interfaces;

public interface IAuditLogService
{
    Task RegisterAsync(string action, string userName, string description);
}
