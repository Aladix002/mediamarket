using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs.Orders.Requests;

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
}
