using HelpDesk.Api.DTOs.Auth;

namespace HelpDesk.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<UserSummaryDto> GetProfileAsync(Guid userId);
    Task<UserSummaryDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}
