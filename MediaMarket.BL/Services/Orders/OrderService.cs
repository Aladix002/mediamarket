using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using MediaMarket.BL.Interfaces;
using MediaMarket.BL.Services.Orders;

namespace MediaMarket.BL.Services.Orders;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly OrderCommissionService _commissionService;
    private readonly IEmailService? _emailService;

    public OrderService(ApplicationDbContext context, OrderCommissionService commissionService, IEmailService? emailService = null)
    {
        _context = context;
        _commissionService = commissionService;
        _emailService = emailService;
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.Offer)
            .Include(o => o.AgencyUser)
            .Include(o => o.MediaUser)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber)
    {
        return await _context.Orders
            .Include(o => o.Offer)
            .Include(o => o.AgencyUser)
            .Include(o => o.MediaUser)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
    }

    public async Task<List<Order>> GetAllAsync()
    {
        return await _context.Orders
            .Include(o => o.Offer)
            .Include(o => o.AgencyUser)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByAgencyUserIdAsync(Guid agencyUserId)
    {
        return await _context.Orders
            .Where(o => o.AgencyUserId == agencyUserId)
            .Include(o => o.Offer)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByMediaUserIdAsync(Guid mediaUserId)
    {
        return await _context.Orders
            .Where(o => o.MediaUserId == mediaUserId)
            .Include(o => o.Offer)
            .Include(o => o.AgencyUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByOfferIdAsync(Guid offerId)
    {
        return await _context.Orders
            .Where(o => o.OfferId == offerId)
            .Include(o => o.AgencyUser)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByStatusAsync(OrderStatus status)
    {
        return await _context.Orders
            .Where(o => o.Status == status)
            .Include(o => o.Offer)
            .Include(o => o.AgencyUser)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order> CreateAsync(Order order)
    {
        // Generuj OrderNumber ak nie je vyplnene
        if (string.IsNullOrEmpty(order.OrderNumber))
        {
            order.OrderNumber = GenerateOrderNumber();
        }

        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Posli email notifikaciu
        if (_emailService != null)
        {
            _ = Task.Run(async () => await _emailService.SendNewOrderNotificationAsync(order));
        }

        return order;
    }

    public async Task<Order> UpdateAsync(Order order)
    {
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var order = await GetByIdAsync(id);
        if (order == null)
        {
            return false;
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangeStatusAsync(Guid id, OrderStatus newStatus)
    {
        var order = await GetByIdAsync(id);
        if (order == null)
        {
            return false;
        }

        var oldStatus = order.Status;
        var oldStatusText = oldStatus.ToString();
        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        // Ak sa status zmenil na Closed, vypocitaj commission
        if (newStatus == OrderStatus.Closed && oldStatus != OrderStatus.Closed)
        {
            _commissionService.CalculateCommission(order);
        }

        await _context.SaveChangesAsync();

        // Posli email notifikaciu o zmene statusu
        if (_emailService != null && oldStatus != newStatus)
        {
            _ = Task.Run(async () => await _emailService.SendOrderStatusChangedNotificationAsync(order, oldStatusText));
        }

        return true;
    }

    public async Task<bool> CloseOrderAsync(Guid id)
    {
        return await ChangeStatusAsync(id, OrderStatus.Closed);
    }

    private static string GenerateOrderNumber()
    {
        var date = DateTime.UtcNow;
        var year = date.Year;
        var month = date.Month.ToString("D2");
        var random = new Random().Next(1000, 9999);
        return $"MMH-{year}-{month}-{random}";
    }
}
