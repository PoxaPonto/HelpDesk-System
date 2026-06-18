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
        ValidateName(dto.Name);
        ValidateEmail(dto.Email);
        ValidatePassword(dto.Password, dto.ConfirmPassword);

        if (await context.Users.AnyAsync(user => user.Email.ToLower() == dto.Email.ToLower()))
        {
            throw new InvalidOperationException("Ja existe um usuario cadastrado com este e-mail.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Client,
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

    public async Task<UserSummaryDto> GetProfileAsync(Guid userId)
    {
        var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == userId)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        return ToSummary(user);
    }

    public async Task<UserSummaryDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        ValidateName(dto.Name);

        var user = await context.Users.FirstOrDefaultAsync(user => user.Id == userId)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        user.Name = dto.Name.Trim();
        await context.SaveChangesAsync();

        return ToSummary(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
        {
            throw new InvalidOperationException("Informe a senha atual.");
        }

        ValidatePassword(dto.NewPassword, dto.ConfirmPassword);

        var user = await context.Users.FirstOrDefaultAsync(user => user.Id == userId)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Senha atual invalida.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await context.SaveChangesAsync();
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

    private static UserSummaryDto ToSummary(User user)
    {
        return new UserSummaryDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString()
        };
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

    private static void ValidatePassword(string password, string confirmPassword)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
        {
            throw new InvalidOperationException("A senha deve ter pelo menos 6 caracteres.");
        }

        if (password != confirmPassword)
        {
            throw new InvalidOperationException("A confirmacao de senha nao confere.");
        }
    }
}
