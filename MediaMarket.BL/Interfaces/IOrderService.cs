using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Interfaces;

public interface IOrderService
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<Order?> GetByOrderNumberAsync(string orderNumber);
    Task<List<Order>> GetAllAsync();
    Task<List<Order>> GetByAgencyUserIdAsync(Guid agencyUserId);
    Task<List<Order>> GetByMediaUserIdAsync(Guid mediaUserId);
    Task<List<Order>> GetByOfferIdAsync(Guid offerId);
    Task<List<Order>> GetByStatusAsync(OrderStatus status);
    Task<Order> CreateAsync(Order order);
    Task<Order> UpdateAsync(Order order);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ChangeStatusAsync(Guid id, OrderStatus newStatus);
    Task<bool> CloseOrderAsync(Guid id); // Automaticky vypocita commission
}
