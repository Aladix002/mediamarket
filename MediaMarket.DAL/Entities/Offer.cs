using MediaMarket.DAL.Enums;

namespace MediaMarket.DAL.Entities;

public class Offer
{
    public Guid Id { get; set; }
    public Guid MediaUserId { get; set; } // FK na User (rola Media)
    public string Title { get; set; } = string.Empty;
    public string? Format { get; set; } // Format reklamy, napr. "Leaderboard 970x250", "30s spot"
    public string Description { get; set; } = string.Empty;
    public MediaType MediaType { get; set; } 

    // Cenovy model
    public PricingModel PricingModel { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? Cpt { get; set; }
    public decimal? MinOrderValue { get; set; }
    public decimal DiscountPercent { get; set; } = 0; // Sleva v percentach

    // Stitky (moze byt viacero naraz)
    public OfferTag Tags { get; set; } = OfferTag.None;

    // Terminy
    public DateTime? DeadlineAssetsAt { get; set; }
    public DateTime? LastOrderDay { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }

    // Technicke podmienky
    public string? TechnicalConditionsText { get; set; }
    public string? TechnicalConditionsUrl { get; set; }

    // Stav
    public OfferStatus Status { get; set; } = OfferStatus.Draft;

    // Casove znacky
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigacne vlastnosti
    public User MediaUser { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>(); // Jedna nabidka moze mat viacero objednavok (rozdelenie podla datumov)
}
