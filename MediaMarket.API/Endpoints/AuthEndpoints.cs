using System;
using MediaMarket.API.DTOs;
using MediaMarket.API.DTOs.Users.Responses;
using MediaMarket.API.Validators;
using MediaMarket.BL.Interfaces;
using MediaMarket.DAL;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using BCrypt.Net;

namespace MediaMarket.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", RegisterAsync)
            .WithName("Register")
            .WithSummary("Registracia noveho pouzivatela")
            .Produces<RegisterResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError);

        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .WithSummary("Prihlasenie pouzivatela")
            .Produces<LoginResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/logout", LogoutAsync)
            .WithName("Logout")
            .WithSummary("Odhlasenie pouzivatela")
            .Produces(StatusCodes.Status200OK);

        group.MapGet("/me", GetCurrentUserAsync)
            .WithName("GetCurrentUser")
            .WithSummary("Ziskanie aktualneho pouzivatela")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/refresh", RefreshTokenAsync)
            .WithName("RefreshToken")
            .WithSummary("Obnovenie access tokenu")
            .Produces<LoginResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/verify-email", VerifyEmailAsync)
            .WithName("VerifyEmail")
            .WithSummary("Potvrdenie emailu pomocou tokenu")
            .Produces<VerifyEmailResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/resend-verification", ResendVerificationAsync)
            .WithName("ResendVerification")
            .WithSummary("Poslanie znova verification emailu")
            .Produces<VerifyEmailResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        // ARES endpoint pre získanie názvu firmy
        var aresGroup = app.MapGroup("/api/ares").WithTags("ARES");
        aresGroup.MapGet("/company/{ico}", GetCompanyNameFromAresAsync)
            .WithName("GetCompanyNameFromAres")
            .WithSummary("Získanie názvu firmy z ARES podľa IČO")
            .Produces<object>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }
    
    private static async Task<IResult> GetCompanyNameFromAresAsync(
        string ico,
        [FromServices] MediaMarket.BL.Interfaces.IARESService aresService)
    {
        var (companyName, errorMessage) = await aresService.GetCompanyNameAsync(ico);
        
        if (string.IsNullOrWhiteSpace(companyName))
        {
            return Results.BadRequest(new { error = errorMessage ?? "Nepodarilo sa získať názov firmy z ARES" });
        }
        
        return Results.Ok(new { companyName });
    }

    private static async Task<IResult> RegisterAsync(
        [FromBody] RegisterRequest request,
        [FromServices] IAuthService authService,
        [FromServices] IUserService userService,
        [FromServices] RegisterRequestValidator validator,
        [FromServices] MediaMarket.BL.Interfaces.IARESService aresService)
    {
        // Validacia
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errorMessages = validationResult.Errors.Select(e => e.ErrorMessage);
            return Results.BadRequest(new RegisterResponse
            {
                Success = false,
                Message = string.Join(", ", errorMessages)
            });
        }

        // Kontrola ci uz existuje pouzivatel s tymto emailom
        var existingUser = await userService.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Results.BadRequest(new RegisterResponse
            {
                Success = false,
                Message = "Pouzivatel s tymto emailom uz existuje"
            });
        }

        // Získaj názov firmy z ARES ak nie je zadaný
        string companyName = request.CompanyName ?? string.Empty;
        if (string.IsNullOrWhiteSpace(companyName))
        {
            var (aresCompanyName, aresError) = await aresService.GetCompanyNameAsync(request.Ico);
            if (string.IsNullOrWhiteSpace(aresCompanyName))
            {
                return Results.BadRequest(new RegisterResponse
                {
                    Success = false,
                    Message = aresError ?? "Nepodarilo sa získať názov firmy z ARES registra"
                });
            }
            companyName = aresCompanyName;
        }

        // ARES validacia - overenie firmy a emailovej domeny
        var (isValid, aresErrorMessage) = await aresService.ValidateCompanyAsync(request.Ico, companyName, request.Email);
        if (!isValid)
        {
            return Results.BadRequest(new RegisterResponse
            {
                Success = false,
                Message = aresErrorMessage ?? "Overenie firmy v ARES zlyhalo"
            });
        }

        try
        {
            // 1. Registracia v Supabase Auth
            var metadata = new Dictionary<string, object>
            {
                { "company_name", companyName },
                { "contact_name", request.ContactName },
                { "phone", request.Phone },
                { "role", request.Role.ToString() }
            };

            var (accessToken, refreshToken, supabaseUser, emailSent, errorMessage) = await authService.SignUpAsync(request.Email, request.Password, metadata);
            
            // Ak je errorMessage, znamená to, že registrácia zlyhala
            if (!string.IsNullOrEmpty(errorMessage))
            {
                // Parsuj Supabase error message pre lepšiu user-friendly správu
                string userFriendlyMessage = "Nepodařilo se vytvořit účet.";
                
                if (!string.IsNullOrEmpty(errorMessage))
                {
                    // Skús nájsť JSON objekt v error message (môže byť v rámci stringu)
                    var jsonStart = errorMessage.IndexOf('{');
                    if (jsonStart >= 0)
                    {
                        var jsonEnd = errorMessage.LastIndexOf('}');
                        if (jsonEnd > jsonStart)
                        {
                            try
                            {
                                var jsonString = errorMessage.Substring(jsonStart, jsonEnd - jsonStart + 1);
                                var errorJson = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(jsonString);
                                if (errorJson != null && errorJson.ContainsKey("msg"))
                                {
                                    var msg = errorJson["msg"]?.ToString() ?? "";
                                    
                                    // Prekladaj Supabase error messages
                                    if (msg.Contains("rate limit"))
                                    {
                                        userFriendlyMessage = "Příliš mnoho pokusů o registraci. Zkuste to prosím později nebo použijte jiný email.";
                                    }
                                    else if (msg.Contains("already registered") || msg.Contains("already exists"))
                                    {
                                        userFriendlyMessage = "Uživatel s tímto emailem již existuje. Zkuste se přihlásit.";
                                    }
                                    else if (msg.Contains("Password"))
                                    {
                                        userFriendlyMessage = "Heslo nevyhovuje požadavkům. Zkuste silnější heslo.";
                                    }
                                    else
                                    {
                                        userFriendlyMessage = msg;
                                    }
                                }
                            }
                            catch
                            {
                                // Ak sa nepodarí parsovať, použij pôvodnú správu
                                userFriendlyMessage = errorMessage;
                            }
                        }
                        else
                        {
                            userFriendlyMessage = errorMessage;
                        }
                    }
                    else
                    {
                        // Ak nie je JSON, použij pôvodnú správu, ale skús ju upraviť
                        if (errorMessage.Contains("User already registered") || errorMessage.Contains("already exists"))
                        {
                            userFriendlyMessage = "Uživatel s tímto emailem již existuje. Zkuste se přihlásit.";
                        }
                        else if (errorMessage.Contains("Password") || errorMessage.Contains("password"))
                        {
                            userFriendlyMessage = "Heslo nevyhovuje požadavkům. Zkuste silnější heslo (minimálně 8 znaků).";
                        }
                        else if (errorMessage.Contains("null response") || errorMessage.Contains("null User"))
                        {
                            userFriendlyMessage = "Nepodařilo se vytvořit účet. Email může již existovat nebo heslo nevyhovuje požadavkům.";
                        }
                        else
                        {
                            userFriendlyMessage = errorMessage;
                        }
                    }
                }
                else
                {
                    // Ak nie je errorMessage, použij všeobecnú správu
                    userFriendlyMessage = "Nepodařilo se vytvořit účet v Supabase Auth. Zkontrolujte, zda email již není registrován nebo zda heslo splňuje požadavky.";
                }
                
                return Results.BadRequest(new RegisterResponse
                {
                    Success = false,
                    Message = userFriendlyMessage
                });
            }

            // 2. Vytvorenie User v nasej databaze
            // Ziskaj Supabase User ID z metadata
            var supabaseUserId = GetSupabaseUserId(supabaseUser);
            
            var user = new User
            {
                Id = supabaseUserId ?? Guid.NewGuid(), // Pouzi Supabase ID ak je dostupny
                Email = request.Email,
                PasswordHash = string.Empty, // Heslo je v Supabase, nie v nasej DB
                Role = request.Role,
                Status = UserStatus.Pending, // Caka na schvalenie adminom
                CompanyName = companyName, // Použi názov firmy z ARES
                ContactName = request.ContactName,
                Phone = request.Phone,
                Ico = request.Ico,
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await userService.CreateAsync(user);

            return Results.Ok(new RegisterResponse
            {
                Success = true,
                Message = emailSent 
                    ? "Registracia uspesna. Prosim overte vas email - poslali sme vam email s odkazom na overenie."
                    : "Registracia uspesna. Prosim overte vas email.",
                AccessToken = accessToken,
                UserId = createdUser.Id
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }

    private static async Task<IResult> LoginAsync(
        [FromBody] LoginRequest request,
        [FromServices] IUserService userService,
        [FromServices] LoginRequestValidator validator,
        [FromServices] ILoggerFactory loggerFactory)
    {
        // Validacia
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new LoginResponse
            {
                Success = false,
                Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
            });
        }

        try
        {
            // Ziskaj pouzivatela z nasej databazy
            var user = await userService.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Používateľ s týmto emailom neexistuje"
                }, statusCode: 401);
            }

            // Over heslo cez BCrypt
            if (string.IsNullOrEmpty(user.PasswordHash))
            {
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Používateľ nemá nastavené heslo"
                }, statusCode: 401);
            }

            // Debug: Skontroluj hash
            var logger = loggerFactory.CreateLogger("AuthEndpoints");
            logger.LogInformation("Verifying password for user: {Email}, Hash exists: {HasHash}, Hash length: {HashLength}", 
                request.Email, !string.IsNullOrEmpty(user.PasswordHash), user.PasswordHash?.Length ?? 0);
            
            var isValidPassword = await userService.VerifyPasswordAsync(request.Email, request.Password);
            logger.LogInformation("Password verification result: {IsValid}", isValidPassword);
            
            if (!isValidPassword)
            {
                // Debug: Skús overiť heslo priamo
                var directVerify = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                logger.LogWarning("Direct BCrypt verify result: {DirectVerify}, Hash: {HashPrefix}", 
                    directVerify, user.PasswordHash?.Substring(0, Math.Min(20, user.PasswordHash?.Length ?? 0)));
                
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Nesprávne heslo"
                }, statusCode: 401);
            }

            // Vytvor jednoduchy token (pre testovanie - v produkcii by sa mal pouzivat JWT)
            // Pre jednoduchost pouzijeme base64 encoded string s user ID a emailom
            var tokenData = $"{user.Id}:{user.Email}:{DateTime.UtcNow:yyyy-MM-ddTHH:mm:ss}";
            var simpleToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenData));

            return Results.Ok(new LoginResponse
            {
                Success = true,
                Message = "Prihlasenie uspesne",
                AccessToken = simpleToken,
                RefreshToken = null,
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    CompanyName = user.CompanyName,
                    ContactName = user.ContactName
                }
            });
        }
        catch (Exception ex)
        {
            // Log exception pre debugging (v produkcii by sa mal použiť logger)
            return Results.Json(new LoginResponse
            {
                Success = false,
                Message = $"Chyba pri prihlásení: {ex.Message}"
            }, statusCode: 401);
        }
    }

    private static async Task<IResult> LogoutAsync()
    {
        // Jednoduchy logout - v produkcii by sa mal token invalidovat
        return Results.Ok(new { Success = true, Message = "Odhlasenie uspesne" });
    }

    private static async Task<IResult> GetCurrentUserAsync(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromServices] IUserService userService)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        
        try
        {
            // Dekoduj jednoduchy token
            var tokenBytes = Convert.FromBase64String(token);
            var tokenString = System.Text.Encoding.UTF8.GetString(tokenBytes);
            var tokenParts = tokenString.Split(':');
            
            if (tokenParts.Length >= 2 && Guid.TryParse(tokenParts[0], out var userId))
            {
                // Ziskaj pouzivatela podla ID
                var user = await userService.GetByIdAsync(userId);
                if (user != null)
                {
                    var response = new UserResponse
                    {
                        Id = user.Id,
                        Email = user.Email,
                        EmailVerifiedAt = user.EmailVerifiedAt,
                        Role = user.Role,
                        Status = user.Status,
                        CreatedAt = user.CreatedAt,
                        CompanyName = user.CompanyName,
                        ContactName = user.ContactName,
                        Phone = user.Phone
                    };
                    return Results.Ok(response);
                }
            }

            return Results.Unauthorized();
        }
        catch
        {
            return Results.Unauthorized();
        }
    }

    private static Task<IResult> RefreshTokenAsync(
        [FromBody] RefreshTokenRequest request,
        [FromServices] IAuthService authService,
        [FromServices] IUserService userService)
    {
        // TODO: Implementovat refresh token logiku cez Supabase
        // Supabase SDK by mal mat metodu na refresh token
        return Task.FromResult<IResult>(Results.StatusCode(501));
    }

    private static async Task<IResult> VerifyEmailAsync(
        [FromBody] VerifyEmailRequest request,
        [FromServices] IAuthService authService,
        [FromServices] IUserService userService,
        [FromServices] ApplicationDbContext context)
    {
        if (string.IsNullOrEmpty(request.Token))
        {
            return Results.BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = "Token je povinny"
            });
        }

        try
        {
            // Overi email cez Supabase
            var verified = await authService.VerifyEmailAsync(request.Token, request.Type);
            
            if (!verified)
            {
                return Results.BadRequest(new VerifyEmailResponse
                {
                    Success = false,
                    Message = "Neplatny token alebo token uz expiroval"
                });
            }

            // Ziskaj aktualneho pouzivatela z Supabase (po verify by mal byt prihlaseny)
            var supabaseUser = authService.GetCurrentUser();
            if (supabaseUser != null)
            {
                var email = GetEmailFromSupabaseUser(supabaseUser);
                if (!string.IsNullOrEmpty(email))
                {
                    // Aktualizuj EmailVerifiedAt v nasej databaze
                    var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
                    if (user != null)
                    {
                        user.EmailVerifiedAt = DateTime.UtcNow;
                        await context.SaveChangesAsync();
                    }
                }
            }

            return Results.Ok(new VerifyEmailResponse
            {
                Success = true,
                Message = "Email bol uspesne overeny"
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = $"Chyba pri overovani emailu: {ex.Message}"
            });
        }
    }

    private static async Task<IResult> ResendVerificationAsync(
        [FromBody] ResendVerificationRequest request,
        [FromServices] IAuthService authService)
    {
        if (string.IsNullOrEmpty(request.Email))
        {
            return Results.BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = "Email je povinny"
            });
        }

        try
        {
            var sent = await authService.ResendVerificationEmailAsync(request.Email);
            
            if (!sent)
            {
                return Results.BadRequest(new VerifyEmailResponse
                {
                    Success = false,
                    Message = "Nepodarilo sa poslat verification email"
                });
            }

            return Results.Ok(new VerifyEmailResponse
            {
                Success = true,
                Message = "Verification email bol poslany"
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new VerifyEmailResponse
            {
                Success = false,
                Message = $"Chyba pri posielani emailu: {ex.Message}"
            });
        }
    }

    // Helper metody pre extrakciu dat z Supabase user objektu
    private static Guid? GetSupabaseUserId(object supabaseUser)
    {
        try
        {
            var userType = supabaseUser.GetType();
            var idProperty = userType.GetProperty("Id");
            if (idProperty != null)
            {
                var idValue = idProperty.GetValue(supabaseUser);
                if (idValue != null && Guid.TryParse(idValue.ToString(), out var guid))
                {
                    return guid;
                }
            }
        }
        catch
        {
            // Ignore
        }
        return null;
    }

    private static string? GetEmailFromSupabaseUser(object supabaseUser)
    {
        try
        {
            var userType = supabaseUser.GetType();
            var emailProperty = userType.GetProperty("Email");
            if (emailProperty != null)
            {
                return emailProperty.GetValue(supabaseUser)?.ToString();
            }
        }
        catch
        {
            // Ignore
        }
        return null;
    }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
