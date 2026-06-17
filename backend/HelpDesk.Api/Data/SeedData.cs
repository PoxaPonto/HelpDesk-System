using HelpDesk.Api.Models;
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
}
