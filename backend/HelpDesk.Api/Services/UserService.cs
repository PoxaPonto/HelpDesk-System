using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Users;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Services;

public class UserService(AppDbContext context) : IUserService
{
    public async Task<IReadOnlyList<UserResponseDto>> GetAllAsync(UserQueryDto query)
    {
        var users = context.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            users = users.Where(user =>
                user.Name.ToLower().Contains(search) ||
                user.Email.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            var role = ParseRole(query.Role);
            users = users.Where(user => user.Role == role);
        }

        if (query.Active.HasValue)
        {
            users = users.Where(user => user.Active == query.Active.Value);
        }

        return await users.OrderBy(user => user.Name)
            .Select(user => ToResponse(user))
            .ToListAsync();
    }

    public async Task<UserResponseDto> GetByIdAsync(Guid id)
    {
        var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == id)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        return ToResponse(user);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto)
    {
        ValidateName(dto.Name);
        ValidateEmail(dto.Email);

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
        {
            throw new InvalidOperationException("A senha deve ter pelo menos 6 caracteres.");
        }

        var email = dto.Email.Trim().ToLower();
        var emailInUse = await context.Users.AnyAsync(user => user.Email == email);

        if (emailInUse)
        {
            throw new InvalidOperationException("Ja existe um usuario com este e-mail.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = ParseRole(dto.Role),
            Active = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return ToResponse(user);
    }

    public async Task<UserResponseDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(user => user.Id == id)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        ValidateName(dto.Name);
        ValidateEmail(dto.Email);

        var email = dto.Email.Trim().ToLower();
        var emailInUse = await context.Users.AnyAsync(existingUser =>
            existingUser.Id != id && existingUser.Email == email);

        if (emailInUse)
        {
            throw new InvalidOperationException("Ja existe outro usuario com este e-mail.");
        }

        user.Name = dto.Name.Trim();
        user.Email = email;
        user.Role = ParseRole(dto.Role);
        user.Active = dto.Active;

        await context.SaveChangesAsync();
        return ToResponse(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await context.Users.FirstOrDefaultAsync(user => user.Id == id)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        user.Active = false;
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

    private static UserRole ParseRole(string value)
    {
        return Enum.TryParse<UserRole>(value, true, out var role)
            ? role
            : throw new InvalidOperationException("Perfil de usuario invalido.");
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length < 3)
        {
            throw new InvalidOperationException("Informe um nome com pelo menos 3 caracteres.");
        }
    }

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@') || !email.Contains('.'))
        {
            throw new InvalidOperationException("Informe um e-mail valido.");
        }
    }
}
