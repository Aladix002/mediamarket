using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs.Orders.Requests;

public class CreateOrderRequest
{
    public Guid OfferId { get; set; }
    public DateTime PreferredFrom { get; set; }
    public DateTime PreferredTo { get; set; }
    public int? QuantityUnits { get; set; } // Pre UnitPrice model
    public int? Impressions { get; set; } // Pre CPT model
    public string Note { get; set; } = string.Empty;
}
