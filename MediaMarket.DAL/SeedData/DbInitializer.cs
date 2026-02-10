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
        var existingUsers = await context.Users
            .Where(u => u.Email == "admin@mediamarket.sk" || 
                       u.Email == "media@mediamarket.sk" || 
                       u.Email == "agency@mediamarket.sk")
            .ToListAsync();

        var now = DateTime.UtcNow;
        var mediaUserId = Guid.Parse("22222222-2222-2222-2222-222222222222"); // Media user ID

        // Ak existujú, aktualizuj ich heslo (pre prípad, že hash nie je správny)
        if (existingUsers.Any())
        {
            var correctPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!", BCrypt.Net.BCrypt.GenerateSalt());
            foreach (var user in existingUsers)
            {
                // Aktualizuj heslo len ak hash nevyzerá správne (nie je BCrypt hash)
                if (string.IsNullOrEmpty(user.PasswordHash) || !user.PasswordHash.StartsWith("$2"))
                {
                    user.PasswordHash = correctPasswordHash;
                }
            }
            await context.SaveChangesAsync();
            
            // Ak už existujú všetci tri, len vytvor offers ak ešte neexistujú
            if (existingUsers.Count >= 3)
            {
                await SeedOffersAsync(context, mediaUserId);
                await SeedOffersForAllMediaUsersAsync(context, mediaUserId);
                return;
            }
        }

        // Ak seed používatelia neexistujú, skús vytvoriť offers pre existujúceho Media používateľa
        var anyMediaUser = await context.Users
            .Where(u => u.Role == UserRole.Media)
            .FirstOrDefaultAsync();
        
        if (anyMediaUser != null)
        {
            // Vytvor offers pre existujúceho Media používateľa (ak ešte nemá offers)
            var hasOffers = await context.Offers
                .Where(o => o.MediaUserId == anyMediaUser.Id)
                .AnyAsync();
            
            if (!hasOffers)
            {
                await SeedOffersAsync(context, anyMediaUser.Id);
            }
            
            // Vytvor offers aj pre ostatných Media používateľov
            await SeedOffersForAllMediaUsersAsync(context, anyMediaUser.Id);
        }

        // Použijeme rovnaký spôsob hashovania ako v PasswordHasher
        var defaultPassword = BCrypt.Net.BCrypt.HashPassword("Password123!", BCrypt.Net.BCrypt.GenerateSalt()); // Vsetci maju rovnake heslo pre testovanie

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
            Id = mediaUserId,
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

        // Seed offers - vytvorime roznorode offers pre testovanie filtrov
        await SeedOffersAsync(context, mediaUserId);
        
        // Vytvor offers aj pre existujúcich Media používateľov (ak ešte nemajú offers)
        var additionalMediaUsers = await context.Users
            .Where(u => u.Role == UserRole.Media && u.Id != mediaUserId)
            .ToListAsync();
        
        foreach (var mediaUser in additionalMediaUsers)
        {
            var hasOffers = await context.Offers
                .Where(o => o.MediaUserId == mediaUser.Id)
                .AnyAsync();
            
            if (!hasOffers)
            {
                await SeedOffersAsync(context, mediaUser.Id);
            }
        }
    }

    private static async Task SeedOffersForAllMediaUsersAsync(ApplicationDbContext context, Guid excludeUserId)
    {
        // Vytvor offers aj pre existujúcich Media používateľov (ak ešte nemajú offers)
        var allMediaUsers = await context.Users
            .Where(u => u.Role == UserRole.Media && u.Id != excludeUserId)
            .ToListAsync();
        
        foreach (var mediaUser in allMediaUsers)
        {
            var hasOffers = await context.Offers
                .Where(o => o.MediaUserId == mediaUser.Id)
                .AnyAsync();
            
            if (!hasOffers)
            {
                await SeedOffersAsync(context, mediaUser.Id);
            }
        }
    }

    private static async Task SeedOffersAsync(ApplicationDbContext context, Guid mediaUserId)
    {
        // Skontroluj, ci uz existuju seed offers
        var existingOffers = await context.Offers
            .Where(o => o.MediaUserId == mediaUserId && o.Title.StartsWith("[SEED]"))
            .ToListAsync();

        if (existingOffers.Any())
        {
            return; // Seed offers uz existuju
        }

        var now = DateTime.UtcNow;
        var offers = new List<Offer>();

        // 1. Online - Banner Leaderboard (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Prémiový banner Leaderboard na homepage",
            Format = "Leaderboard 970x250",
            Description = "Výrazný banner na hlavnej stránke portálu. Ideálne pre brandovú komunikáciu a zvýšenie povedomia o značke. Zobrazenie na všetkých zariadeniach s vysokou viditeľnosťou.",
            MediaType = MediaType.Online,
            PricingModel = PricingModel.Cpt,
            Cpt = 120,
            MinOrderValue = 50000,
            DiscountPercent = 0,
            Tags = OfferTag.None,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(3),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-5),
            UpdatedAt = now.AddDays(-5),
            TechnicalConditionsText = "Podklady vo formáte HTML5, JPG alebo PNG. Maximálna veľkosť súboru 200KB. Animácia max 15 sekúnd.",
            TechnicalConditionsUrl = "https://example.com/specs/banner-leaderboard"
        });

        // 2. Online - Advertorial (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Advertorial článok v sekcii Bydlenie",
            Format = "Advertorial 800x1200",
            Description = "Príležitosť publikovať vlastný obsah v sekcii Bydlenie. Ideálne pre komplexnú prezentáciu produktov a služieb. Článok zostane v archíve trvalo.",
            MediaType = MediaType.Online,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 45000,
            MinOrderValue = 45000,
            DiscountPercent = 10,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(2),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-10),
            UpdatedAt = now.AddDays(-10),
            TechnicalConditionsText = "Textový obsah max 2000 slov, 3-5 obrázkov vo formáte JPG/PNG. SEO optimalizácia zahrnutá."
        });

        // 3. Online - Last Minute (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Last Minute - Skyscraper banner",
            Format = "Skyscraper 160x600",
            Description = "Posledná možnosť rezervovať bannerové miesto tento mesiac. Vynikajúca viditeľnosť na pravom bočnom paneli. Obmedzené množstvo miest.",
            MediaType = MediaType.Online,
            PricingModel = PricingModel.Cpt,
            Cpt = 80,
            MinOrderValue = 30000,
            DiscountPercent = 25,
            Tags = OfferTag.LastMinute,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddDays(7), // Krátka platnosť pre last minute
            LastOrderDay = now.Date.AddDays(5),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-2),
            UpdatedAt = now.AddDays(-2)
        });

        // 4. Print - PR článek (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] PR článok v tlačenom časopise",
            Format = "PR článek A4",
            Description = "Plnostranový PR článok v tlačenom časopise. Ideálne pre detailnú prezentáciu produktov, služieb alebo spoločnosti. Vysoká dôveryhodnosť tlačených médií.",
            MediaType = MediaType.Print,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 85000,
            MinOrderValue = 85000,
            DiscountPercent = 0,
            Tags = OfferTag.None,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(6),
            DeadlineAssetsAt = now.Date.AddDays(14),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-15),
            UpdatedAt = now.AddDays(-15),
            TechnicalConditionsText = "Text max 2500 slov, 4-6 obrázkov vo vysokom rozlíšení (min 300 DPI). CMYK farby."
        });

        // 5. Rádio - Spot (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Rádiový spot v dopravnej špičke",
            Format = "30 sekúnd spot",
            Description = "Rádiový spot v dopravnej špičke (7:00-9:00, 16:00-18:00). Vysoká dosiahnuteľnosť aktívnych poslucháčov. Ideálne pre lokálne kampane.",
            MediaType = MediaType.Radio,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 35000,
            MinOrderValue = 70000, // Minimálne 2 spoty
            DiscountPercent = 15,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(4),
            DeadlineAssetsAt = now.Date.AddDays(10),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-8),
            UpdatedAt = now.AddDays(-8),
            TechnicalConditionsText = "Audio súbor vo formáte MP3, WAV alebo AIFF. Kvalita min 44.1 kHz, 16-bit. Dĺžka presne 30 sekúnd."
        });

        // 6. OOH - Billboard (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Billboard na hlavnej ceste",
            Format = "Billboard 6x3m",
            Description = "Výrazný billboard na hlavnej dopravnej tepne mesta. Denná viditeľnosť pre desiatky tisíc ľudí. Ideálne pre brandovú kampaň.",
            MediaType = MediaType.OOH,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 120000,
            MinOrderValue = 120000,
            DiscountPercent = 0,
            Tags = OfferTag.None,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(6),
            DeadlineAssetsAt = now.Date.AddDays(21),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-20),
            UpdatedAt = now.AddDays(-20),
            TechnicalConditionsText = "Tlač vo vysokom rozlíšení (min 300 DPI), formát PDF. Rozmery 6000x3000mm. CMYK farby."
        });

        // 7. Sociální sítě - Facebook/Instagram (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Facebook a Instagram Stories",
            Format = "Stories 1080x1920",
            Description = "Kampaň na Facebook a Instagram Stories. Cieľenie podľa veku, záujmov a lokality. Vysoká interaktivita a engagement.",
            MediaType = MediaType.SocialMedia,
            PricingModel = PricingModel.Cpt,
            Cpt = 150,
            MinOrderValue = 75000,
            DiscountPercent = 20,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(2),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-12),
            UpdatedAt = now.AddDays(-12),
            TechnicalConditionsText = "Obrázok alebo video. Stories: 1080x1920px, max 15 sekúnd video. Formát JPG, PNG alebo MP4."
        });

        // 8. Video - YouTube preroll (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] YouTube preroll reklama",
            Format = "Video preroll 15s",
            Description = "Video reklama pred YouTube videami. Cieľenie podľa záujmov a demografie. Vysoká dosiahnuteľnosť mladšej generácie.",
            MediaType = MediaType.Video,
            PricingModel = PricingModel.Cpt,
            Cpt = 200,
            MinOrderValue = 100000,
            DiscountPercent = 0,
            Tags = OfferTag.None,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(3),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-7),
            UpdatedAt = now.AddDays(-7),
            TechnicalConditionsText = "Video vo formáte MP4, H.264 kodek. Rozlíšenie min 1280x720, max 15 sekúnd. Zvuk voliteľný."
        });

        // 9. Influenceři - Instagram post (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Instagram post od lifestyle influencera",
            Format = "Instagram post + Stories",
            Description = "Spolupráca s top lifestyle influencerom. 1x feed post + 3x Stories. Organický reach + garantované zobrazenia. Cieľenie: ženy 25-45 rokov.",
            MediaType = MediaType.Influencers,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 95000,
            MinOrderValue = 95000,
            DiscountPercent = 10,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(2),
            DeadlineAssetsAt = now.Date.AddDays(7),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-5),
            UpdatedAt = now.AddDays(-5)
        });

        // 10. Online - Newsletter (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Banner v týždennom newsletteri",
            Format = "Newsletter banner 600x200",
            Description = "Banner v týždennom newsletteri s 50 000 odberateľmi. Vysoká open rate a CTR. Ideálne pre B2B kampane.",
            MediaType = MediaType.Online,
            PricingModel = PricingModel.Cpt,
            Cpt = 100,
            MinOrderValue = 50000,
            DiscountPercent = 0,
            Tags = OfferTag.None,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(4),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-18),
            UpdatedAt = now.AddDays(-18)
        });

        // 11. Print - Akce (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Akce - Dvojstrana v časopise",
            Format = "Dvojstrana A4",
            Description = "Špeciálna akcia - dvojstrana v tlačenom časopise. Vynikajúca viditeľnosť a priestor pre detailnú prezentáciu. Obmedzené množstvo miest.",
            MediaType = MediaType.Print,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 150000,
            MinOrderValue = 150000,
            DiscountPercent = 30,
            Tags = OfferTag.Akce | OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(1),
            LastOrderDay = now.Date.AddDays(10),
            DeadlineAssetsAt = now.Date.AddDays(12),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-3),
            UpdatedAt = now.AddDays(-3)
        });

        // 12. OOH - Last Minute (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Last Minute - Citylight panel",
            Format = "Citylight 175x118cm",
            Description = "Posledná možnosť rezervovať citylight panel na kľúčovej zastávke MHD. Vysoká frekvencia prechádzajúcich. Platnosť len tento mesiac.",
            MediaType = MediaType.OOH,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 45000,
            MinOrderValue = 45000,
            DiscountPercent = 35,
            Tags = OfferTag.LastMinute,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddDays(15),
            LastOrderDay = now.Date.AddDays(10),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-1),
            UpdatedAt = now.AddDays(-1)
        });

        // 13. Rádio - Akce (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Akce - Rádiový balíček",
            Format = "60 sekúnd spot",
            Description = "Špeciálna akcia - dlhší spot (60s) v rádiu. Viac času na prezentáciu produktu. Balíček obsahuje 10 spotov v dopravnej špičke.",
            MediaType = MediaType.Radio,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 55000,
            MinOrderValue = 550000, // 10 spotov
            DiscountPercent = 25,
            Tags = OfferTag.Akce,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(2),
            DeadlineAssetsAt = now.Date.AddDays(7),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-6),
            UpdatedAt = now.AddDays(-6)
        });

        // 14. Sociální sítě - Akce (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Akce - Facebook feed reklama",
            Format = "Feed post 1200x628",
            Description = "Špeciálna akcia - Facebook feed reklama s rozšíreným cieľením. Vysoká relevancia a engagement. Ideálne pre e-commerce.",
            MediaType = MediaType.SocialMedia,
            PricingModel = PricingModel.Cpt,
            Cpt = 130,
            MinOrderValue = 65000,
            DiscountPercent = 30,
            Tags = OfferTag.Akce,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(1),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-4),
            UpdatedAt = now.AddDays(-4)
        });

        // 15. Video - YouTube midroll (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] YouTube midroll reklama",
            Format = "Video midroll 30s",
            Description = "Video reklama uprostred YouTube videa. Diváci už sú zapojení do obsahu, vyššia pozornosť. Cieľenie podľa kanálov a záujmov.",
            MediaType = MediaType.Video,
            PricingModel = PricingModel.Cpt,
            Cpt = 180,
            MinOrderValue = 90000,
            DiscountPercent = 5,
            Tags = OfferTag.None,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(4),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-9),
            UpdatedAt = now.AddDays(-9)
        });

        // 16. Influenceři - YouTube (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] YouTube spolupráca s tech influencerom",
            Format = "Dedicated video + mention",
            Description = "Spolupráca s tech influencerom. 1x dedikované video (5-10 min) + mention v ďalšom videu. Cieľenie: muži 18-35 rokov, záujem o technológie.",
            MediaType = MediaType.Influencers,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 180000,
            MinOrderValue = 180000,
            DiscountPercent = 0,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(3),
            DeadlineAssetsAt = now.Date.AddDays(14),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-11),
            UpdatedAt = now.AddDays(-11)
        });

        // 17. Online - Last Minute + Akce (CPT)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Last Minute + Akce - Display banner",
            Format = "Display banner 728x90",
            Description = "Kombinácia Last Minute a Akce - výhodná cena za display banner. Posledné miesta tento týždeň. Vysoká viditeľnosť na všetkých stránkach portálu.",
            MediaType = MediaType.Online,
            PricingModel = PricingModel.Cpt,
            Cpt = 90,
            MinOrderValue = 45000,
            DiscountPercent = 40,
            Tags = OfferTag.LastMinute | OfferTag.Akce,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddDays(5),
            LastOrderDay = now.Date.AddDays(3),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-1),
            UpdatedAt = now.AddDays(-1)
        });

        // 18. Print - Speciál (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Speciál - Obálka časopisu",
            Format = "Obálka časopisu A4",
            Description = "Exkluzívna možnosť - obálka tlačeného časopisu. Maximálna viditeľnosť a prestíž. Obmedzené množstvo - len 2 miesta mesačne.",
            MediaType = MediaType.Print,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 250000,
            MinOrderValue = 250000,
            DiscountPercent = 0,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(6),
            DeadlineAssetsAt = now.Date.AddDays(30),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-25),
            UpdatedAt = now.AddDays(-25)
        });

        // 19. OOH - Speciál (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Speciál - Digitálny billboard",
            Format = "Digitálny billboard 5x3m",
            Description = "Moderný digitálny billboard s dynamickým obsahom. Možnosť zmeny reklamy počas dňa. Vysoká viditeľnosť na hlavnej triede.",
            MediaType = MediaType.OOH,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 180000,
            MinOrderValue = 180000,
            DiscountPercent = 10,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(6),
            DeadlineAssetsAt = now.Date.AddDays(21),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-14),
            UpdatedAt = now.AddDays(-14),
            TechnicalConditionsText = "Digitálny obsah vo formáte MP4 alebo obrázky JPG/PNG. Rozlíšenie 5000x3000px. Možnosť animácie."
        });

        // 20. Rádio - Speciál (UnitPrice)
        offers.Add(new Offer
        {
            Id = Guid.NewGuid(), // Generuj unikátne ID pre každého používateľa
            MediaUserId = mediaUserId,
            Title = "[SEED] Speciál - Rádiový programový blok",
            Format = "Programový blok 5 minút",
            Description = "Exkluzívny programový blok v rádiu. 5 minút vlastného obsahu v prime time. Ideálne pre rozhovor, prezentáciu alebo diskusiu.",
            MediaType = MediaType.Radio,
            PricingModel = PricingModel.UnitPrice,
            UnitPrice = 200000,
            MinOrderValue = 200000,
            DiscountPercent = 0,
            Tags = OfferTag.Special,
            ValidFrom = now.Date,
            ValidTo = now.Date.AddMonths(3),
            DeadlineAssetsAt = now.Date.AddDays(14),
            Status = OfferStatus.Published,
            CreatedAt = now.AddDays(-13),
            UpdatedAt = now.AddDays(-13)
        });

        context.Offers.AddRange(offers);
        await context.SaveChangesAsync();
    }
}
