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
            LastLoginAt = u.LastLoginAt,
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
            LastLoginAt = user.LastLoginAt,
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
            LastLoginAt = updatedUser.LastLoginAt,
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
            LastLoginAt = updatedUser.LastLoginAt,
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
}
