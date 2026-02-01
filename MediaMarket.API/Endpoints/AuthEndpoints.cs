using MediaMarket.API.DTOs;
using MediaMarket.API.Validators;
using MediaMarket.BL.Interfaces;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using Microsoft.AspNetCore.Mvc;

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
            return Results.BadRequest(new RegisterResponse
            {
                Success = false,
                Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
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

            var accessToken = await authService.SignUpAsync(request.Email, request.Password, metadata);
            
            if (accessToken == null)
            {
                return Results.BadRequest(new RegisterResponse
                {
                    Success = false,
                    Message = "Nepodarilo sa vytvorit ucet v Supabase Auth"
                });
            }

            // 2. Vytvorenie User v nasej databaze
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = string.Empty, // Heslo je v Supabase, nie v nasej DB
                Role = request.Role,
                Status = UserStatus.Pending, // Caka na schvalenie adminom
                CompanyName = request.CompanyName,
                ContactName = request.ContactName,
                Phone = request.Phone,
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await userService.CreateAsync(user);

            return Results.Ok(new RegisterResponse
            {
                Success = true,
                Message = "Registracia uspesna. Prosim overte vas email.",
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
}
