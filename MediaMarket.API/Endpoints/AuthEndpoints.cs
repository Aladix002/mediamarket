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

        group.MapPost("/change-password", ChangePasswordAsync)
            .WithName("ChangePassword")
            .WithSummary("Zmena hesla prihláseného používateľa")
            .Produces<ChangePasswordResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/forgot-password", ForgotPasswordAsync)
            .WithName("ForgotPassword")
            .WithSummary("Poslanie emailu na reset hesla")
            .Produces<ForgotPasswordResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/reset-password", ResetPasswordAsync)
            .WithName("ResetPassword")
            .WithSummary("Nastavení nového hesla pomocou tokenu z emailu")
            .Produces<ResetPasswordResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

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
        [FromServices] RegisterRequestValidator validator)
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

        try
        {
            // 1. Registracia v Supabase Auth
            var metadata = new Dictionary<string, object>
            {
                { "company_name", request.CompanyName },
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
            Guid? supabaseUserId = null;
            if (supabaseUser != null)
            {
                supabaseUserId = GetSupabaseUserId(supabaseUser);
            }
            
            var user = new User
            {
                Id = supabaseUserId ?? Guid.NewGuid(), // Pouzi Supabase ID ak je dostupny
                Email = request.Email,
                PasswordHash = string.Empty, // Heslo je v Supabase, nie v nasej DB
                Role = request.Role,
                Status = UserStatus.Pending, // Caka na schvalenie adminom
                CompanyName = request.CompanyName,
                ContactName = request.ContactName,
                Phone = request.Phone,
                Ico = string.Empty, // ICO už nie je povinné
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
                RefreshToken = refreshToken,
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
        [FromServices] IAuthService authService,
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
            // Prihlásenie cez Supabase Auth
            var (accessToken, refreshToken, supabaseUser) = await authService.SignInAsync(request.Email, request.Password);
            
            if (string.IsNullOrEmpty(accessToken) || supabaseUser == null)
            {
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Nesprávne prihlasovacie údaje alebo email nie je overený"
                }, statusCode: 401);
            }

            // Získaj email z Supabase user objektu
            var email = GetEmailFromSupabaseUser(supabaseUser);
            if (string.IsNullOrEmpty(email))
            {
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Nepodarilo sa získať email z autentifikácie"
                }, statusCode: 401);
            }

            // Získaj používateľa z našej databázy
            var user = await userService.GetByEmailAsync(email);
            if (user == null)
            {
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Používateľ s týmto emailom neexistuje v databáze"
                }, statusCode: 401);
            }

            // Skontroluj, či je email overený v Supabase
            var emailVerified = IsEmailVerified(supabaseUser);
            if (!emailVerified)
            {
                return Results.Json(new LoginResponse
                {
                    Success = false,
                    Message = "Email nie je overený. Prosím overte váš email pred prihlásením."
                }, statusCode: 401);
            }

            return Results.Ok(new LoginResponse
            {
                Success = true,
                Message = "Prihlasenie uspesne",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
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
            var logger = loggerFactory.CreateLogger("AuthEndpoints");
            logger.LogError(ex, "Chyba pri prihlásení pre email: {Email}", request.Email);
            
            return Results.Json(new LoginResponse
            {
                Success = false,
                Message = $"Chyba pri prihlásení: {ex.Message}"
            }, statusCode: 401);
        }
    }

    private static async Task<IResult> LogoutAsync(
        [FromServices] IAuthService authService)
    {
        try
        {
            await authService.SignOutAsync();
            return Results.Ok(new { Success = true, Message = "Odhlasenie uspesne" });
        }
        catch
        {
            // Aj keby zlyhalo, vratime uspesnu odpoved
            return Results.Ok(new { Success = true, Message = "Odhlasenie uspesne" });
        }
    }

    private static async Task<IResult> GetCurrentUserAsync(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromServices] IUserService userService,
        [FromServices] IAuthService authService)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        
        try
        {
            // Validuj token cez Supabase
            var isValid = await authService.ValidateTokenAsync(token);
            if (!isValid)
            {
                return Results.Unauthorized();
            }

            // Získaj používateľa z tokenu
            var supabaseUser = await authService.GetUserFromTokenAsync(token);
            if (supabaseUser == null)
            {
                return Results.Unauthorized();
            }

            // Získaj email z Supabase user objektu
            var email = GetEmailFromSupabaseUser(supabaseUser);
            if (string.IsNullOrEmpty(email))
            {
                return Results.Unauthorized();
            }

            // Získaj používateľa z našej databázy
            var user = await userService.GetByEmailAsync(email);
            if (user == null)
            {
                return Results.Unauthorized();
            }

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
        catch
        {
            return Results.Unauthorized();
        }
    }

    private static async Task<IResult> RefreshTokenAsync(
        [FromBody] RefreshTokenRequest request,
        [FromServices] IAuthService authService,
        [FromServices] IUserService userService)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
        {
            return Results.BadRequest(new LoginResponse
            {
                Success = false,
                Message = "Refresh token je povinný"
            });
        }

        try
        {
            // Obnov token cez Supabase
            var (accessToken, refreshToken, supabaseUser) = await authService.RefreshTokenAsync(request.RefreshToken);
            
            if (string.IsNullOrEmpty(accessToken) || supabaseUser == null)
            {
                return Results.Unauthorized();
            }

            // Získaj email z Supabase user objektu
            var email = GetEmailFromSupabaseUser(supabaseUser);
            if (string.IsNullOrEmpty(email))
            {
                return Results.Unauthorized();
            }

            // Získaj používateľa z našej databázy
            var user = await userService.GetByEmailAsync(email);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new LoginResponse
            {
                Success = true,
                Message = "Token bol obnovený",
                AccessToken = accessToken,
                RefreshToken = refreshToken ?? request.RefreshToken,
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
        catch
        {
            return Results.Unauthorized();
        }
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
            // Skús získať používateľa z tokenu (môže to byť access_token alebo token_hash)
            object? supabaseUser = null;
            bool verified = false;
            
            // Ak je to access_token, email je už overený v Supabase
            // Skús získať používateľa priamo z tokenu
            supabaseUser = await authService.GetUserFromTokenAsync(request.Token);
            
            if (supabaseUser != null)
            {
                // Token je platný, email je overený
                verified = true;
            }
            else
            {
                // Skús overiť cez VerifyOTP (pre token_hash)
                verified = await authService.VerifyEmailAsync(request.Token, request.Type);
                
                if (verified)
                {
                    // Po verify by mal byť používateľ v session
                    supabaseUser = authService.GetCurrentUser();
                }
            }
            
            if (!verified || supabaseUser == null)
            {
                return Results.BadRequest(new VerifyEmailResponse
                {
                    Success = false,
                    Message = "Neplatny token alebo token uz expiroval"
                });
            }

            // Získaj email z Supabase user objektu
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

    private static async Task<IResult> ChangePasswordAsync(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromBody] ChangePasswordRequest request,
        [FromServices] IAuthService authService,
        [FromServices] ChangePasswordRequestValidator validator,
        [FromServices] IUserService userService)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var token = authorization.Substring("Bearer ".Length).Trim();

        // Validácia
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errorMessages = validationResult.Errors.Select(e => e.ErrorMessage);
            return Results.BadRequest(new ChangePasswordResponse
            {
                Success = false,
                Message = string.Join(", ", errorMessages)
            });
        }

        try
        {
            // Získaj používateľa z tokenu
            var supabaseUser = await authService.GetUserFromTokenAsync(token);
            if (supabaseUser == null)
            {
                return Results.Unauthorized();
            }

            var email = GetEmailFromSupabaseUser(supabaseUser);
            if (string.IsNullOrEmpty(email))
            {
                return Results.Unauthorized();
            }

            // Over aktuálne heslo - skús prihlásiť sa s aktuálnym heslom
            var (accessToken, _, _) = await authService.SignInAsync(email, request.CurrentPassword);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Results.BadRequest(new ChangePasswordResponse
                {
                    Success = false,
                    Message = "Aktuálne heslo nie je správne"
                });
            }

            // Zmeň heslo
            var success = await authService.UpdatePasswordAsync(request.NewPassword);
            if (!success)
            {
                return Results.BadRequest(new ChangePasswordResponse
                {
                    Success = false,
                    Message = "Nepodarilo sa zmeniť heslo"
                });
            }

            return Results.Ok(new ChangePasswordResponse
            {
                Success = true,
                Message = "Heslo bolo úspešne zmenené"
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new ChangePasswordResponse
            {
                Success = false,
                Message = $"Chyba pri zmene hesla: {ex.Message}"
            });
        }
    }

    private static async Task<IResult> ForgotPasswordAsync(
        [FromBody] ForgotPasswordRequest request,
        [FromServices] IAuthService authService,
        [FromServices] IConfiguration configuration)
    {
        if (string.IsNullOrEmpty(request.Email))
        {
            return Results.BadRequest(new ForgotPasswordResponse
            {
                Success = false,
                Message = "Email je povinný"
            });
        }

        try
        {
            // Nastav redirect URL na stránku pre reset hesla
            var frontendUrl = configuration["Frontend:Url"] ?? "http://localhost:5173";
            var redirectUrl = $"{frontendUrl}/reset-password";
            
            var sent = await authService.ResetPasswordAsync(request.Email, redirectUrl);
            
            if (!sent)
            {
                return Results.BadRequest(new ForgotPasswordResponse
                {
                    Success = false,
                    Message = "Nepodařilo se poslat email na reset hesla"
                });
            }

            return Results.Ok(new ForgotPasswordResponse
            {
                Success = true,
                Message = "Email s instrukcemi na reset hesla byl odeslán"
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new ForgotPasswordResponse
            {
                Success = false,
                Message = $"Chyba pri posielani emailu: {ex.Message}"
            });
        }
    }

    private static async Task<IResult> ResetPasswordAsync(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromBody] ResetPasswordRequest request,
        [FromServices] IAuthService authService,
        [FromServices] ResetPasswordRequestValidator validator,
        [FromServices] ILoggerFactory loggerFactory)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var token = authorization.Substring("Bearer ".Length).Trim();

        // Validácia
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errorMessages = validationResult.Errors.Select(e => e.ErrorMessage);
            var logger = loggerFactory.CreateLogger("AuthEndpoints");
            logger.LogWarning("ResetPasswordAsync: Validation failed. Errors: {Errors}", string.Join(", ", errorMessages));
            
            return Results.BadRequest(new ResetPasswordResponse
            {
                Success = false,
                Message = string.Join(", ", errorMessages)
            });
        }

        try
        {
            var logger = loggerFactory.CreateLogger("AuthEndpoints");
            
            // Získaj používateľa z tokenu (z reset password linku)
            var supabaseUser = await authService.GetUserFromTokenAsync(token);
            if (supabaseUser == null)
            {
                logger.LogWarning("ResetPasswordAsync: Invalid or expired token");
                return Results.Unauthorized();
            }

            logger.LogInformation("ResetPasswordAsync: User found, attempting to update password");

            // Zmeň heslo pomocou recovery tokenu - musíme nastaviť session najprv
            var success = await authService.UpdatePasswordWithTokenAsync(token, request.NewPassword);
            if (!success)
            {
                logger.LogWarning("ResetPasswordAsync: Failed to update password");
                return Results.BadRequest(new ResetPasswordResponse
                {
                    Success = false,
                    Message = "Nepodařilo se změnit heslo. Token môže byť neplatný alebo expirovaný."
                });
            }

            logger.LogInformation("ResetPasswordAsync: Password successfully updated");

            return Results.Ok(new ResetPasswordResponse
            {
                Success = true,
                Message = "Heslo bylo úspěšně změněno"
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new ResetPasswordResponse
            {
                Success = false,
                Message = $"Chyba pri zmene hesla: {ex.Message}"
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

    private static bool IsEmailVerified(object supabaseUser)
    {
        try
        {
            var userType = supabaseUser.GetType();
            var emailConfirmedProperty = userType.GetProperty("EmailConfirmedAt");
            if (emailConfirmedProperty != null)
            {
                var emailConfirmedAt = emailConfirmedProperty.GetValue(supabaseUser);
                return emailConfirmedAt != null;
            }
            
            // Alternatívne skús EmailVerified alebo ConfirmedAt
            var emailVerifiedProperty = userType.GetProperty("EmailVerified");
            if (emailVerifiedProperty != null)
            {
                var emailVerified = emailVerifiedProperty.GetValue(supabaseUser);
                if (emailVerified is bool verified)
                {
                    return verified;
                }
            }
        }
        catch
        {
            // Ignore
        }
        // Ak sa nepodarí zistiť, predpokladajme že je overený (Supabase to kontroluje)
        return true;
    }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
