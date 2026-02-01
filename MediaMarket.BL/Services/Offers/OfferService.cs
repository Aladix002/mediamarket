using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using MediaMarket.BL.Interfaces;

namespace MediaMarket.BL.Services.Offers;

public class OfferService : IOfferService
{
    private readonly ApplicationDbContext _context;

    public OfferService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Offer?> GetByIdAsync(Guid id)
    {
        return await _context.Offers
            .Include(o => o.MediaUser)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Offer>> GetAllAsync()
    {
        return await _context.Offers
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Offer>> GetByMediaUserIdAsync(Guid mediaUserId)
    {
        return await _context.Offers
            .Where(o => o.MediaUserId == mediaUserId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Offer>> GetPublishedAsync()
    {
        return await _context.Offers
            .Where(o => o.Status == OfferStatus.Published
                && o.ValidFrom <= DateTime.UtcNow
                && o.ValidTo >= DateTime.UtcNow)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Offer>> GetByStatusAsync(OfferStatus status)
    {
        return await _context.Offers
            .Where(o => o.Status == status)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Offer>> GetByMediaTypeAsync(MediaType mediaType)
    {
        return await _context.Offers
            .Where(o => o.MediaType == mediaType
                && o.Status == OfferStatus.Published)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Offer>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        return await _context.Offers
            .Where(o => o.ValidFrom <= to && o.ValidTo >= from
                && o.Status == OfferStatus.Published)
            .Include(o => o.MediaUser)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Offer> CreateAsync(Offer offer)
    {
        offer.CreatedAt = DateTime.UtcNow;
        offer.UpdatedAt = DateTime.UtcNow;
        _context.Offers.Add(offer);
        await _context.SaveChangesAsync();
        return offer;
    }

    public async Task<Offer> UpdateAsync(Offer offer)
    {
        offer.UpdatedAt = DateTime.UtcNow;
        _context.Offers.Update(offer);
        await _context.SaveChangesAsync();
        return offer;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var offer = await GetByIdAsync(id);
        if (offer == null)
        {
            return false;
        }

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> PublishAsync(Guid id)
    {
        var offer = await GetByIdAsync(id);
        if (offer == null)
        {
            return false;
        }

        offer.Status = OfferStatus.Published;
        offer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ArchiveAsync(Guid id)
    {
        var offer = await GetByIdAsync(id);
        if (offer == null)
        {
            return false;
        }

        offer.Status = OfferStatus.Archived;
        offer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
