using MediaMarket.API.DTOs.Users.Requests;
using MediaMarket.API.DTOs.Users.Responses;
using MediaMarket.API.Validators.Users;
using MediaMarket.BL.Interfaces;
using MediaMarket.DAL.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MediaMarket.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users");

        group.MapGet("", GetUsersAsync)
            .WithName("GetUsers")
            .WithSummary("Zoznam pouzivatelov")
            .Produces<List<UserResponse>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetUserByIdAsync)
            .WithName("GetUserById")
            .WithSummary("Detail pouzivatela")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}", UpdateUserAsync)
            .WithName("UpdateUser")
            .WithSummary("Aktualizacia pouzivatela")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/me", GetMyProfileAsync)
            .WithName("GetMyProfile")
            .WithSummary("Ziskanie vlastneho profilu")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPut("/me", UpdateMyProfileAsync)
            .WithName("UpdateMyProfile")
            .WithSummary("Aktualizacia vlastneho profilu")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}/status", UpdateUserStatusAsync)
            .WithName("UpdateUserStatus")
            .WithSummary("Zmena statusu pouzivatela (schvalenie)")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/{id:guid}", DeleteUserAsync)
            .WithName("DeleteUser")
            .WithSummary("Zmazanie pouzivatela")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetUsersAsync(
        [FromServices] IUserService userService,
        [FromQuery] UserRole? role = null,
        [FromQuery] UserStatus? status = null)
    {
        var users = role.HasValue
            ? await userService.GetByRoleAsync(role.Value)
            : status.HasValue
                ? await userService.GetByStatusAsync(status.Value)
                : await userService.GetAllAsync();

        var response = users.Select(u => new UserResponse
        {
            Id = u.Id,
            Email = u.Email,
            EmailVerifiedAt = u.EmailVerifiedAt,
            Role = u.Role,
            Status = u.Status,
            CreatedAt = u.CreatedAt,
            CompanyName = u.CompanyName,
            ContactName = u.ContactName,
            Phone = u.Phone
        }).ToList();

        return Results.Ok(response);
    }

    private static async Task<IResult> GetUserByIdAsync(
        Guid id,
        [FromServices] IUserService userService)
    {
        var user = await userService.GetByIdAsync(id);
        if (user == null)
            return Results.NotFound();

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

    private static async Task<IResult> UpdateUserAsync(
        Guid id,
        [FromBody] UpdateUserRequest request,
        [FromServices] IUserService userService,
        [FromServices] UpdateUserRequestValidator validator)
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }

        var user = await userService.GetByIdAsync(id);
        if (user == null)
            return Results.NotFound();

        user.CompanyName = request.CompanyName;
        user.ContactName = request.ContactName;
        user.Phone = request.Phone;

        var updatedUser = await userService.UpdateAsync(user);

        var response = new UserResponse
        {
            Id = updatedUser.Id,
            Email = updatedUser.Email,
            EmailVerifiedAt = updatedUser.EmailVerifiedAt,
            Role = updatedUser.Role,
            Status = updatedUser.Status,
            CreatedAt = updatedUser.CreatedAt,
            CompanyName = updatedUser.CompanyName,
            ContactName = updatedUser.ContactName,
            Phone = updatedUser.Phone
        };

        return Results.Ok(response);
    }

    private static async Task<IResult> UpdateUserStatusAsync(
        Guid id,
        [FromBody] UpdateUserStatusRequest request,
        [FromServices] IUserService userService)
    {
        var user = await userService.GetByIdAsync(id);
        if (user == null)
            return Results.NotFound();

        user.Status = request.Status;
        var updatedUser = await userService.UpdateAsync(user);

        var response = new UserResponse
        {
            Id = updatedUser.Id,
            Email = updatedUser.Email,
            EmailVerifiedAt = updatedUser.EmailVerifiedAt,
            Role = updatedUser.Role,
            Status = updatedUser.Status,
            CreatedAt = updatedUser.CreatedAt,
            CompanyName = updatedUser.CompanyName,
            ContactName = updatedUser.ContactName,
            Phone = updatedUser.Phone
        };

        return Results.Ok(response);
    }

    private static async Task<IResult> DeleteUserAsync(
        Guid id,
        [FromServices] IUserService userService)
    {
        var result = await userService.DeleteAsync(id);
        if (!result)
            return Results.NotFound();

        return Results.NoContent();
    }

    private static async Task<IResult> GetMyProfileAsync(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromServices] IAuthService authService,
        [FromServices] IUserService userService)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        
        try
        {
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

    private static async Task<IResult> UpdateMyProfileAsync(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromBody] UpdateUserRequest request,
        [FromServices] IAuthService authService,
        [FromServices] IUserService userService,
        [FromServices] UpdateUserRequestValidator validator)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }

        try
        {
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

            var user = await userService.GetByEmailAsync(email);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            // Aktualizuj profil (CompanyName sa nemení - je len na čítanie)
            // user.CompanyName zostáva nezmenený
            user.ContactName = request.ContactName;
            user.Phone = request.Phone;

            var updatedUser = await userService.UpdateAsync(user);

            var response = new UserResponse
            {
                Id = updatedUser.Id,
                Email = updatedUser.Email,
                EmailVerifiedAt = updatedUser.EmailVerifiedAt,
                Role = updatedUser.Role,
                Status = updatedUser.Status,
                CreatedAt = updatedUser.CreatedAt,
                CompanyName = updatedUser.CompanyName,
                ContactName = updatedUser.ContactName,
                Phone = updatedUser.Phone
            };

            return Results.Ok(response);
        }
        catch
        {
            return Results.Unauthorized();
        }
    }

    // Helper metoda pre extrakciu emailu z Supabase user objektu
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
