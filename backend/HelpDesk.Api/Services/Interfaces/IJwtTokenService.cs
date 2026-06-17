using HelpDesk.Api.Models;

namespace HelpDesk.Api.Services.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user, DateTime expiresAt);
}
