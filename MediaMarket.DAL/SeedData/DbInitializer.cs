using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using BCrypt.Net;

namespace MediaMarket.DAL.SeedData;

public static class DbInitializer
{
    /// <summary>
    /// Inicializuje databazu seed datami (admin, media, agency pouzivatelia)
    /// </summary>
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        // Aplikuj migracie
        await context.Database.MigrateAsync();

        // Skontroluj, ci uz existuju seed pouzivatelia
        var seedUsersExist = await context.Users
            .AnyAsync(u => u.Email == "admin@mediamarket.sk" || 
                          u.Email == "media@mediamarket.sk" || 
                          u.Email == "agency@mediamarket.sk");

        if (seedUsersExist)
        {
            return; // Seed pouzivatelia uz existuju
        }

        var now = DateTime.UtcNow;
        var defaultPassword = BCrypt.Net.BCrypt.HashPassword("Password123!"); // Vsetci maju rovnake heslo pre testovanie

        // 1. Admin pouzivatel
        var admin = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "admin@mediamarket.sk",
            PasswordHash = defaultPassword,
            EmailVerifiedAt = now,
            Role = UserRole.Admin,
            Status = UserStatus.Verified,
            CreatedAt = now,
            CompanyName = "MediaMarket",
            ContactName = "Administrator",
            Phone = "+421900000001",
            Ico = "12345678"
        };

        // 2. Media pouzivatel (médium)
        var media = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "media@mediamarket.sk",
            PasswordHash = defaultPassword,
            EmailVerifiedAt = now,
            Role = UserRole.Media,
            Status = UserStatus.Verified,
            CreatedAt = now,
            CompanyName = "TV Markíza",
            ContactName = "Ján Novák",
            Phone = "+421900000002",
            Ico = "87654321"
        };

        // 3. Agency pouzivatel (agentúra)
        var agency = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Email = "agency@mediamarket.sk",
            PasswordHash = defaultPassword,
            EmailVerifiedAt = now,
            Role = UserRole.Agency,
            Status = UserStatus.Verified,
            CreatedAt = now,
            CompanyName = "Creative Agency s.r.o.",
            ContactName = "Mária Horváthová",
            Phone = "+421900000003",
            Ico = "11223344"
        };

        context.Users.AddRange(admin, media, agency);
        await context.SaveChangesAsync();
    }
}
