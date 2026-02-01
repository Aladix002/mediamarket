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
        [FromQuery] Guid? mediaUserId = null)
    {
        var offers = await offerService.GetAllAsync();

        if (status.HasValue)
            offers = offers.Where(o => o.Status == status.Value).ToList();

        if (mediaType.HasValue)
            offers = offers.Where(o => o.MediaType == mediaType.Value).ToList();

        if (mediaUserId.HasValue)
            offers = offers.Where(o => o.MediaUserId == mediaUserId.Value).ToList();

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
        [FromServices] CreateOfferRequestValidator validator,
        [FromQuery] Guid mediaUserId) // TODO: Ziskat z JWT tokenu
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }

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
            DeadlineAssetsAt = request.DeadlineAssetsAt,
            LastOrderDay = request.LastOrderDay,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
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
        offer.DeadlineAssetsAt = request.DeadlineAssetsAt;
        offer.LastOrderDay = request.LastOrderDay;
        offer.ValidFrom = request.ValidFrom;
        offer.ValidTo = request.ValidTo;
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
