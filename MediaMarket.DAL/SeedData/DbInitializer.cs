using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using BCrypt.Net;

namespace MediaMarket.DAL.SeedData;

public static class DbInitializer
{
    /// <summary>
    /// Inicializuje databazu seed datami (admin pouzivatel)
    /// </summary>
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        // Aplikuj migracie
        await context.Database.MigrateAsync();

        // Skontroluj, ci uz existuje admin
        var adminExists = await context.Users
            .AnyAsync(u => u.Role == UserRole.Admin);

        if (adminExists)
        {
            return; // Admin uz existuje
        }

        // Vytvor admin pouzivatela
        var admin = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@mediamarket.sk",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), // Default heslo - treba zmenit pri prvom prihlaseni
            EmailVerifiedAt = DateTime.UtcNow,
            Role = UserRole.Admin,
            Status = UserStatus.Verified,
            CreatedAt = DateTime.UtcNow,
            CompanyName = "MediaMarket",
            ContactName = "Administrator",
            Phone = "+421900000000"
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();
    }
}
