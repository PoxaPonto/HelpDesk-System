using HelpDesk.Api.DTOs.Users;

namespace HelpDesk.Api.Services.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserResponseDto>> GetAllAsync(UserQueryDto query);
    Task<UserResponseDto> GetByIdAsync(Guid id);
    Task<UserResponseDto> CreateAsync(CreateUserDto dto);
    Task<UserResponseDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task DeleteAsync(Guid id);
}
