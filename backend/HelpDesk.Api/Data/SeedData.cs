using HelpDesk.Api.Models;
using HelpDesk.Api.Enums;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Data;

public static class SeedData
{
    public static void Configure(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "Hardware" },
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Name = "Software" },
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), Name = "Rede" },
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), Name = "Impressora" },
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000005"), Name = "Acesso" },
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000006"), Name = "E-mail" },
            new Category { Id = Guid.Parse("00000000-0000-0000-0000-000000000007"), Name = "Outros" }
        );
    }

    public static async Task EnsureSeededAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        try
        {
            if (!await context.Database.CanConnectAsync())
            {
                return;
            }

            await EnsureUserAsync(
                context,
                Guid.Parse("10000000-0000-0000-0000-000000000001"),
                "Administrador",
                "admin@teste.com",
                "$2a$11$xuROaxBx0o2u3w2kUxBwjOYqV5NngCwDGplx51dLjXaNrP5FkPx5m",
                UserRole.Admin);

            await EnsureUserAsync(
                context,
                Guid.Parse("10000000-0000-0000-0000-000000000002"),
                "Tecnico",
                "tecnico@teste.com",
                "$2a$11$cAMavWG46ReQqvUVeMeHvu/Fhbs7aRn.p/H6PKPDg6nAewpAXxrJ6",
                UserRole.Technician);

            await EnsureUserAsync(
                context,
                Guid.Parse("10000000-0000-0000-0000-000000000003"),
                "Cliente",
                "cliente@teste.com",
                "$2a$11$Iq9Nq952u/6GxXbosMKyTOVTo.0M39BHyzGsTKvky2ykrXK.pP/.6",
                UserRole.Client);

            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _ = ex;
        }
    }

    private static async Task EnsureUserAsync(
        AppDbContext context,
        Guid id,
        string name,
        string email,
        string passwordHash,
        UserRole role)
    {
        var user = await context.Users.FirstOrDefaultAsync(user => user.Email == email);

        if (user is null)
        {
            context.Users.Add(new User
            {
                Id = id,
                Name = name,
                Email = email,
                PasswordHash = passwordHash,
                Role = role,
                Active = true,
                CreatedAt = DateTime.UtcNow
            });

            return;
        }

        user.Name = name;
        user.Role = role;
        user.Active = true;
    }
}
