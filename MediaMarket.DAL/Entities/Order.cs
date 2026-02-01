using MediaMarket.DAL.Enums;

namespace MediaMarket.DAL.Entities;

public class Order
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty; // Unikatne, napr. "MMH-2026-000123"
    public Guid OfferId { get; set; } // FK na Offer
    public Guid AgencyUserId { get; set; } // FK na User (rola Agency)
    public Guid MediaUserId { get; set; } // FK na User (rola Media) - denormalizovane pre rychle filtre

    // Preferovane datumy
    public DateTime PreferredFrom { get; set; }
    public DateTime PreferredTo { get; set; }

    // Snapshot ceny 
    public PricingModel PricingModelSnapshot { get; set; }
    public decimal? UnitPriceSnapshot { get; set; }
    public decimal? CptSnapshot { get; set; }
    public int? QuantityUnits { get; set; } // 1-100
    public int? Impressions { get; set; }
    public decimal TotalPrice { get; set; } // Vypocitane na backendu

    // Poznamka
    public string Note { get; set; } = string.Empty;

    // Stav
    public OrderStatus Status { get; set; } = OrderStatus.New;

    // Casove znacky
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Polia provizie (vypocitane automaticky pri uzavreti objednavky - Status = Closed)
    public decimal? CommissionRate { get; set; } // 0.025 alebo 0.05 (2.5% alebo 5%)
    public decimal? CommissionAmount { get; set; } // Vypocitane: TotalPrice * CommissionRate

    // Navigacne vlastnosti
    public Offer Offer { get; set; } = null!;
    public User AgencyUser { get; set; } = null!;
    public User MediaUser { get; set; } = null!;
}
