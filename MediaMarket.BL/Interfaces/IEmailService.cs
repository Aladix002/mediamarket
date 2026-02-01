using MediaMarket.DAL.Entities;

namespace MediaMarket.BL.Interfaces;

public interface IEmailService
{
    Task<bool> SendNewOrderNotificationAsync(Order order);
    Task<bool> SendOrderStatusChangedNotificationAsync(Order order, string oldStatus);
}
