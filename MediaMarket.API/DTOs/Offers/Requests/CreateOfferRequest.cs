using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs.Offers.Requests;

public class CreateOfferRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Format { get; set; }
    public string Description { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public PricingModel PricingModel { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? Cpt { get; set; }
    public decimal? MinOrderValue { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public OfferTag Tags { get; set; } = OfferTag.None;
    public DateTime? DeadlineAssetsAt { get; set; }
    public DateTime? LastOrderDay { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public string? TechnicalConditionsText { get; set; }
    public string? TechnicalConditionsUrl { get; set; }
}
