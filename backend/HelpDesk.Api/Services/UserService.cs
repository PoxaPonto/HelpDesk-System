using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Users;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Services;

public class UserService(AppDbContext context) : IUserService
{
    public async Task<IReadOnlyList<UserResponseDto>> GetAllAsync()
    {
        return await context.Users
            .AsNoTracking()
            .OrderBy(user => user.Name)
            .Select(user => ToResponse(user))
            .ToListAsync();
    }

    public async Task<UserResponseDto> GetByIdAsync(Guid id)
    {
        var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == id)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        return ToResponse(user);
    }

    public async Task<UserResponseDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(user => user.Id == id)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        var email = dto.Email.Trim().ToLower();
        var emailInUse = await context.Users.AnyAsync(existingUser =>
            existingUser.Id != id && existingUser.Email == email);

        if (emailInUse)
        {
            throw new InvalidOperationException("Ja existe outro usuario com este e-mail.");
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
        {
            throw new InvalidOperationException("Perfil de usuario invalido.");
        }

        user.Name = dto.Name.Trim();
        user.Email = email;
        user.Role = role;
        user.Active = dto.Active;

        await context.SaveChangesAsync();
        return ToResponse(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await context.Users.FirstOrDefaultAsync(user => user.Id == id)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        context.Users.Remove(user);
        await context.SaveChangesAsync();
    }

    private static UserResponseDto ToResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            Active = user.Active,
            CreatedAt = user.CreatedAt
        };
    }
}
