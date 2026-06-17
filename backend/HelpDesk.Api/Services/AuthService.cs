using HelpDesk.Api.Configurations;
using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Auth;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HelpDesk.Api.Services;

public class AuthService(
    AppDbContext context,
    IJwtTokenService jwtTokenService,
    IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await context.Users.AnyAsync(user => user.Email.ToLower() == dto.Email.ToLower()))
        {
            throw new InvalidOperationException("Ja existe um usuario cadastrado com este e-mail.");
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
        {
            throw new InvalidOperationException("Perfil de usuario invalido.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            Active = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await context.Users.FirstOrDefaultAsync(user => user.Email == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("E-mail ou senha invalidos.");
        }

        if (!user.Active)
        {
            throw new UnauthorizedAccessException("Usuario desativado.");
        }

        return CreateAuthResponse(user);
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        return new AuthResponseDto
        {
            Token = jwtTokenService.GenerateToken(user, expiresAt),
            ExpiresAt = expiresAt,
            User = new UserSummaryDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString()
            }
        };
    }
}
