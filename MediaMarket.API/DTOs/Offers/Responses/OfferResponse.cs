using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs.Offers.Responses;

public class OfferResponse
{
    public Guid Id { get; set; }
    public Guid MediaUserId { get; set; }
    public string MediaUserName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Format { get; set; }
    public string Description { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public PricingModel PricingModel { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? Cpt { get; set; }
    public decimal? MinOrderValue { get; set; }
    public decimal DiscountPercent { get; set; }
    public OfferTag Tags { get; set; }
    public DateTime? DeadlineAssetsAt { get; set; }
    public DateTime? LastOrderDay { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public string? TechnicalConditionsText { get; set; }
    public string? TechnicalConditionsUrl { get; set; }
    public OfferStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int OrdersCount { get; set; }
}
