using MediaMarket.API.DTOs.Offers.Requests;
using MediaMarket.API.DTOs.Offers.Responses;
using MediaMarket.API.Validators.Offers;
using MediaMarket.BL.Interfaces;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MediaMarket.API.Endpoints;

public static class OfferEndpoints
{
    public static void MapOfferEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/offers").WithTags("Offers");

        group.MapGet("", GetOffersAsync)
            .WithName("GetOffers")
            .WithSummary("Zoznam ponuk")
            .Produces<List<OfferResponse>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetOfferByIdAsync)
            .WithName("GetOfferById")
            .WithSummary("Detail ponuky")
            .Produces<OfferResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("", CreateOfferAsync)
            .WithName("CreateOffer")
            .WithSummary("Vytvorenie ponuky")
            .Produces<OfferResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateOfferAsync)
            .WithName("UpdateOffer")
            .WithSummary("Aktualizacia ponuky")
            .Produces<OfferResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}/publish", PublishOfferAsync)
            .WithName("PublishOffer")
            .WithSummary("Publikovanie ponuky")
            .Produces<OfferResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/archive", ArchiveOfferAsync)
            .WithName("ArchiveOffer")
            .WithSummary("Archivovanie ponuky")
            .Produces<OfferResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteOfferAsync)
            .WithName("DeleteOffer")
            .WithSummary("Zmazanie ponuky")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetOffersAsync(
        [FromServices] IOfferService offerService,
        [FromQuery] OfferStatus? status = null,
        [FromQuery] MediaType? mediaType = null,
        [FromQuery] Guid? mediaUserId = null,
        [FromQuery] DateTime? validFrom = null,
        [FromQuery] DateTime? validTo = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] decimal? minCpt = null,
        [FromQuery] decimal? maxCpt = null,
        [FromQuery] OfferTag? tag = null,
        [FromQuery] string? searchQuery = null)
    {
        // Konvertuj dátumy na UTC ak sú zadané
        var validFromUtc = validFrom.HasValue ? ConvertToUtc(validFrom.Value) : (DateTime?)null;
        var validToUtc = validTo.HasValue ? ConvertToUtc(validTo.Value) : (DateTime?)null;

        var offers = await offerService.GetFilteredAsync(
            status: status,
            mediaType: mediaType,
            mediaUserId: mediaUserId,
            format: null,
            validFrom: validFromUtc,
            validTo: validToUtc,
            minPrice: minPrice,
            maxPrice: maxPrice,
            minCpt: minCpt,
            maxCpt: maxCpt,
            tag: tag,
            searchQuery: searchQuery);

        var response = offers.Select(o => MapToResponse(o)).ToList();
        return Results.Ok(response);
    }

    private static async Task<IResult> GetOfferByIdAsync(
        Guid id,
        [FromServices] IOfferService offerService)
    {
        var offer = await offerService.GetByIdAsync(id);
        if (offer == null)
            return Results.NotFound();

        return Results.Ok(MapToResponse(offer));
    }

    private static async Task<IResult> CreateOfferAsync(
        [FromBody] CreateOfferRequest request,
        [FromServices] IOfferService offerService,
        [FromServices] IUserService userService,
        [FromServices] CreateOfferRequestValidator validator,
        [FromQuery] Guid mediaUserId) // TODO: Ziskat z JWT tokenu
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }

        // Validuj existenciu používateľa
        var user = await userService.GetByIdAsync(mediaUserId);
        if (user == null)
        {
            return Results.BadRequest(new { message = $"Používateľ s ID {mediaUserId} neexistuje" });
        }

        // Konvertuj dátumy na UTC (PostgreSQL vyžaduje UTC)
        var validFromUtc = ConvertToUtc(request.ValidFrom);
        var validToUtc = ConvertToUtc(request.ValidTo);
        var deadlineUtc = request.DeadlineAssetsAt.HasValue ? ConvertToUtc(request.DeadlineAssetsAt.Value) : (DateTime?)null;
        var lastOrderDayUtc = request.LastOrderDay.HasValue ? ConvertToUtc(request.LastOrderDay.Value) : (DateTime?)null;

        var offer = new Offer
        {
            Id = Guid.NewGuid(),
            MediaUserId = mediaUserId,
            Title = request.Title,
            Format = request.Format,
            Description = request.Description,
            MediaType = request.MediaType,
            PricingModel = request.PricingModel,
            UnitPrice = request.UnitPrice,
            Cpt = request.Cpt,
            MinOrderValue = request.MinOrderValue,
            DiscountPercent = request.DiscountPercent,
            Tags = request.Tags,
            DeadlineAssetsAt = deadlineUtc,
            LastOrderDay = lastOrderDayUtc,
            ValidFrom = validFromUtc,
            ValidTo = validToUtc,
            TechnicalConditionsText = request.TechnicalConditionsText,
            TechnicalConditionsUrl = request.TechnicalConditionsUrl,
            Status = OfferStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdOffer = await offerService.CreateAsync(offer);
        return Results.Created($"/api/offers/{createdOffer.Id}", MapToResponse(createdOffer));
    }

    private static async Task<IResult> UpdateOfferAsync(
        Guid id,
        [FromBody] UpdateOfferRequest request,
        [FromServices] IOfferService offerService,
        [FromServices] UpdateOfferRequestValidator validator)
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }

        var offer = await offerService.GetByIdAsync(id);
        if (offer == null)
            return Results.NotFound();

        // Konvertuj dátumy na UTC (PostgreSQL vyžaduje UTC)
        var validFromUtc = ConvertToUtc(request.ValidFrom);
        var validToUtc = ConvertToUtc(request.ValidTo);
        var deadlineUtc = request.DeadlineAssetsAt.HasValue ? ConvertToUtc(request.DeadlineAssetsAt.Value) : (DateTime?)null;
        var lastOrderDayUtc = request.LastOrderDay.HasValue ? ConvertToUtc(request.LastOrderDay.Value) : (DateTime?)null;

        offer.Title = request.Title;
        offer.Format = request.Format;
        offer.Description = request.Description;
        offer.MediaType = request.MediaType;
        offer.PricingModel = request.PricingModel;
        offer.UnitPrice = request.UnitPrice;
        offer.Cpt = request.Cpt;
        offer.MinOrderValue = request.MinOrderValue;
        offer.DiscountPercent = request.DiscountPercent;
        offer.Tags = request.Tags;
        offer.DeadlineAssetsAt = deadlineUtc;
        offer.LastOrderDay = lastOrderDayUtc;
        offer.ValidFrom = validFromUtc;
        offer.ValidTo = validToUtc;
        offer.TechnicalConditionsText = request.TechnicalConditionsText;
        offer.TechnicalConditionsUrl = request.TechnicalConditionsUrl;
        offer.UpdatedAt = DateTime.UtcNow;

        var updatedOffer = await offerService.UpdateAsync(offer);
        return Results.Ok(MapToResponse(updatedOffer));
    }

    private static async Task<IResult> PublishOfferAsync(
        Guid id,
        [FromServices] IOfferService offerService)
    {
        var offer = await offerService.GetByIdAsync(id);
        if (offer == null)
            return Results.NotFound();

        offer.Status = OfferStatus.Published;
        offer.UpdatedAt = DateTime.UtcNow;
        var updatedOffer = await offerService.UpdateAsync(offer);

        return Results.Ok(MapToResponse(updatedOffer));
    }

    private static async Task<IResult> ArchiveOfferAsync(
        Guid id,
        [FromServices] IOfferService offerService)
    {
        var offer = await offerService.GetByIdAsync(id);
        if (offer == null)
            return Results.NotFound();

        offer.Status = OfferStatus.Archived;
        offer.UpdatedAt = DateTime.UtcNow;
        var updatedOffer = await offerService.UpdateAsync(offer);

        return Results.Ok(MapToResponse(updatedOffer));
    }

    private static async Task<IResult> DeleteOfferAsync(
        Guid id,
        [FromServices] IOfferService offerService)
    {
        var result = await offerService.DeleteAsync(id);
        if (!result)
            return Results.NotFound();

        return Results.NoContent();
    }

    private static DateTime ConvertToUtc(DateTime dateTime)
    {
        // Ak je dátum už UTC, vráť ho
        if (dateTime.Kind == DateTimeKind.Utc)
            return dateTime;
        
        // Ak je dátum Unspecified (prichádza z frontendu bez timezone), 
        // predpokladaj že je to dátum bez času (z date inputu) a nastav ho ako UTC
        if (dateTime.Kind == DateTimeKind.Unspecified)
        {
            // Pre dátumy z date inputu (bez času) jednoducho označíme ako UTC
            // Time je už nastavený (zvyčajne 00:00:00)
            return DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
        }
        
        // Ak je dátum Local, konvertuj na UTC
        return dateTime.ToUniversalTime();
    }

    private static OfferResponse MapToResponse(Offer offer)
    {
        return new OfferResponse
        {
            Id = offer.Id,
            MediaUserId = offer.MediaUserId,
            MediaUserName = offer.MediaUser?.CompanyName ?? string.Empty,
            Title = offer.Title,
            Format = offer.Format,
            Description = offer.Description,
            MediaType = offer.MediaType,
            PricingModel = offer.PricingModel,
            UnitPrice = offer.UnitPrice,
            Cpt = offer.Cpt,
            MinOrderValue = offer.MinOrderValue,
            DiscountPercent = offer.DiscountPercent,
            Tags = offer.Tags,
            DeadlineAssetsAt = offer.DeadlineAssetsAt,
            LastOrderDay = offer.LastOrderDay,
            ValidFrom = offer.ValidFrom,
            ValidTo = offer.ValidTo,
            TechnicalConditionsText = offer.TechnicalConditionsText,
            TechnicalConditionsUrl = offer.TechnicalConditionsUrl,
            Status = offer.Status,
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt,
            OrdersCount = offer.Orders?.Count ?? 0
        };
    }
}
