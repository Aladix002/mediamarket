using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs.Orders.Responses;

public class OrderResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid OfferId { get; set; }
    public string OfferTitle { get; set; } = string.Empty;
    public Guid AgencyUserId { get; set; }
    public string AgencyCompanyName { get; set; } = string.Empty;
    public Guid MediaUserId { get; set; }
    public string MediaCompanyName { get; set; } = string.Empty;
    public DateTime PreferredFrom { get; set; }
    public DateTime PreferredTo { get; set; }
    public PricingModel PricingModelSnapshot { get; set; }
    public decimal? UnitPriceSnapshot { get; set; }
    public decimal? CptSnapshot { get; set; }
    public int? QuantityUnits { get; set; }
    public int? Impressions { get; set; }
    public decimal TotalPrice { get; set; }
    public string Note { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public decimal? CommissionRate { get; set; }
    public decimal? CommissionAmount { get; set; }
}
