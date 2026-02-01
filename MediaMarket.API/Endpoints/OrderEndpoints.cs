using MediaMarket.API.DTOs.Orders.Requests;
using MediaMarket.API.DTOs.Orders.Responses;
using MediaMarket.API.Validators.Orders;
using MediaMarket.BL.Interfaces;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MediaMarket.API.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders");

        group.MapGet("", GetOrdersAsync)
            .WithName("GetOrders")
            .WithSummary("Zoznam objednavok")
            .Produces<List<OrderResponse>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetOrderByIdAsync)
            .WithName("GetOrderById")
            .WithSummary("Detail objednavky")
            .Produces<OrderResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("", CreateOrderAsync)
            .WithName("CreateOrder")
            .WithSummary("Vytvorenie objednavky")
            .Produces<OrderResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}/status", UpdateOrderStatusAsync)
            .WithName("UpdateOrderStatus")
            .WithSummary("Zmena statusu objednavky")
            .Produces<OrderResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/{id:guid}", DeleteOrderAsync)
            .WithName("DeleteOrder")
            .WithSummary("Zmazanie objednavky")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetOrdersAsync(
        [FromServices] IOrderService orderService,
        [FromQuery] OrderStatus? status = null,
        [FromQuery] Guid? agencyUserId = null,
        [FromQuery] Guid? mediaUserId = null,
        [FromQuery] Guid? offerId = null)
    {
        var orders = await orderService.GetAllAsync();

        if (status.HasValue)
            orders = orders.Where(o => o.Status == status.Value).ToList();

        if (agencyUserId.HasValue)
            orders = orders.Where(o => o.AgencyUserId == agencyUserId.Value).ToList();

        if (mediaUserId.HasValue)
            orders = orders.Where(o => o.MediaUserId == mediaUserId.Value).ToList();

        if (offerId.HasValue)
            orders = orders.Where(o => o.OfferId == offerId.Value).ToList();

        var response = orders.Select(o => MapToResponse(o)).ToList();
        return Results.Ok(response);
    }

    private static async Task<IResult> GetOrderByIdAsync(
        Guid id,
        [FromServices] IOrderService orderService)
    {
        var order = await orderService.GetByIdAsync(id);
        if (order == null)
            return Results.NotFound();

        return Results.Ok(MapToResponse(order));
    }

    private static async Task<IResult> CreateOrderAsync(
        [FromBody] CreateOrderRequest request,
        [FromServices] IOrderService orderService,
        [FromServices] IOfferService offerService,
        [FromServices] CreateOrderRequestValidator validator,
        [FromQuery] Guid agencyUserId) // TODO: Ziskat z JWT tokenu
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }

        var offer = await offerService.GetByIdAsync(request.OfferId);
        if (offer == null)
        {
            return Results.BadRequest(new { message = "Ponuka neexistuje" });
        }

        // Vypocitaj TotalPrice
        decimal totalPrice = 0;
        if (offer.PricingModel == PricingModel.UnitPrice && request.QuantityUnits.HasValue && offer.UnitPrice.HasValue)
        {
            totalPrice = offer.UnitPrice.Value * request.QuantityUnits.Value;
        }
        else if (offer.PricingModel == PricingModel.Cpt && request.Impressions.HasValue && offer.Cpt.HasValue)
        {
            totalPrice = offer.Cpt.Value * request.Impressions.Value;
        }

        // Aplikuj zlavu
        if (offer.DiscountPercent > 0)
        {
            totalPrice = totalPrice * (1 - offer.DiscountPercent / 100);
        }

        // Kontrola MinOrderValue
        if (offer.MinOrderValue.HasValue && totalPrice < offer.MinOrderValue.Value)
        {
            return Results.BadRequest(new { message = $"Minimalna hodnota objednavky je {offer.MinOrderValue.Value} EUR" });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OfferId = request.OfferId,
            AgencyUserId = agencyUserId,
            MediaUserId = offer.MediaUserId,
            PreferredFrom = request.PreferredFrom,
            PreferredTo = request.PreferredTo,
            PricingModelSnapshot = offer.PricingModel,
            UnitPriceSnapshot = offer.UnitPrice,
            CptSnapshot = offer.Cpt,
            QuantityUnits = request.QuantityUnits,
            Impressions = request.Impressions,
            TotalPrice = totalPrice,
            Note = request.Note,
            Status = OrderStatus.New,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdOrder = await orderService.CreateAsync(order);
        return Results.Created($"/api/orders/{createdOrder.Id}", MapToResponse(createdOrder));
    }

    private static async Task<IResult> UpdateOrderStatusAsync(
        Guid id,
        [FromBody] UpdateOrderStatusRequest request,
        [FromServices] IOrderService orderService)
    {
        var result = await orderService.ChangeStatusAsync(id, request.Status);
        if (!result)
            return Results.NotFound();

        var order = await orderService.GetByIdAsync(id);
        return Results.Ok(MapToResponse(order!));
    }

    private static async Task<IResult> DeleteOrderAsync(
        Guid id,
        [FromServices] IOrderService orderService)
    {
        var result = await orderService.DeleteAsync(id);
        if (!result)
            return Results.NotFound();

        return Results.NoContent();
    }

    private static OrderResponse MapToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OfferId = order.OfferId,
            OfferTitle = order.Offer?.Title ?? string.Empty,
            AgencyUserId = order.AgencyUserId,
            AgencyCompanyName = order.AgencyUser?.CompanyName ?? string.Empty,
            MediaUserId = order.MediaUserId,
            MediaCompanyName = order.MediaUser?.CompanyName ?? string.Empty,
            PreferredFrom = order.PreferredFrom,
            PreferredTo = order.PreferredTo,
            PricingModelSnapshot = order.PricingModelSnapshot,
            UnitPriceSnapshot = order.UnitPriceSnapshot,
            CptSnapshot = order.CptSnapshot,
            QuantityUnits = order.QuantityUnits,
            Impressions = order.Impressions,
            TotalPrice = order.TotalPrice,
            Note = order.Note,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            CommissionRate = order.CommissionRate,
            CommissionAmount = order.CommissionAmount
        };
    }
}
