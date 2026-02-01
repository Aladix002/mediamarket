using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Services.Orders;

public class OrderCommissionService
{
    private const decimal CommissionRateLow = 0.025m;  // 2.5%
    private const decimal CommissionRateHigh = 0.05m; // 5%

    /// <summary>
    /// Vypocita proviziu automaticky pri zmene statusu na Closed
    /// </summary>
    public void CalculateCommission(Order order)
    {
        // Provizia sa pocita len ak je status Closed a este nie je vypocitana
        if (order.Status != OrderStatus.Closed)
        {
            return;
        }

        // Ak uz je provizia vypocitana, nerobime nic
        if (order.CommissionAmount.HasValue)
        {
            return;
        }

        // Zvolime proviznu sadzbu podla business pravidiel
        // Pre MVP: pouzivame nizsiu sadzbu (2.5%)
        // Neskor moze byt logika zalozena na TotalPrice alebo inych faktoroch
        decimal commissionRate = DetermineCommissionRate(order);
        
        order.CommissionRate = commissionRate;
        order.CommissionAmount = order.TotalPrice * commissionRate;
    }

    /// <summary>
    /// Urci proviznu sadzbu podla business pravidiel
    /// </summary>
    private decimal DetermineCommissionRate(Order order)
    {
        // Pre MVP: jednoducha logika - pouzivame nizsiu sadzbu
        // Neskor moze byt zalozena na:
        // - TotalPrice (napr. nad 100k = 5%, inak 2.5%)
        // - MediaType
        // - Ine business pravidla
        
        // TODO: Implementovat business pravidla pre urcenie proviznej sadzby
        // Zatial pouzivame nizsiu sadzbu (2.5%)
        return CommissionRateLow;
    }

    /// <summary>
    /// Validuje, ci je provizna sadzba platna
    /// </summary>
    public bool IsValidCommissionRate(decimal? rate)
    {
        if (!rate.HasValue)
        {
            return false;
        }

        return rate.Value == CommissionRateLow || rate.Value == CommissionRateHigh;
    }
}
