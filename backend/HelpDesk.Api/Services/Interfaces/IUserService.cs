using HelpDesk.Api.DTOs.Users;

namespace HelpDesk.Api.Services.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto> GetByIdAsync(Guid id);
    Task<UserResponseDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task DeleteAsync(Guid id);
}
