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

    public async Task<List<Offer>> GetFilteredAsync(
        OfferStatus? status = null,
        MediaType? mediaType = null,
        Guid? mediaUserId = null,
        string? format = null,
        DateTime? validFrom = null,
        DateTime? validTo = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        decimal? minCpt = null,
        decimal? maxCpt = null,
        OfferTag? tag = null,
        string? searchQuery = null)
    {
        var query = _context.Offers
            .Include(o => o.MediaUser)
            .AsQueryable();

        // Status filter
        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        // Media type filter
        if (mediaType.HasValue)
        {
            query = query.Where(o => o.MediaType == mediaType.Value);
        }

        // Media user filter
        if (mediaUserId.HasValue)
        {
            query = query.Where(o => o.MediaUserId == mediaUserId.Value);
        }

        // Format filter (case-insensitive partial match)
        if (!string.IsNullOrWhiteSpace(format))
        {
            query = query.Where(o => o.Format != null && o.Format.ToLower().Contains(format.ToLower()));
        }

        // Valid from filter (offer must be valid from this date or earlier)
        if (validFrom.HasValue)
        {
            query = query.Where(o => o.ValidFrom <= validFrom.Value);
        }

        // Valid to filter (offer must be valid until this date or later)
        if (validTo.HasValue)
        {
            query = query.Where(o => o.ValidTo >= validTo.Value);
        }

        // Price range filter (for UnitPrice)
        if (minPrice.HasValue)
        {
            query = query.Where(o => o.UnitPrice.HasValue && o.UnitPrice.Value >= minPrice.Value);
        }
        if (maxPrice.HasValue)
        {
            query = query.Where(o => o.UnitPrice.HasValue && o.UnitPrice.Value <= maxPrice.Value);
        }

        // CPT range filter
        if (minCpt.HasValue)
        {
            query = query.Where(o => o.Cpt.HasValue && o.Cpt.Value >= minCpt.Value);
        }
        if (maxCpt.HasValue)
        {
            query = query.Where(o => o.Cpt.HasValue && o.Cpt.Value <= maxCpt.Value);
        }

        // Tag filter (flags enum - check if tag is set)
        if (tag.HasValue)
        {
            query = query.Where(o => (o.Tags & tag.Value) == tag.Value);
        }

        // Search query filter (search in title, description, format, and media user name)
        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var searchLower = searchQuery.ToLower();
            query = query.Where(o =>
                o.Title.ToLower().Contains(searchLower) ||
                o.Description.ToLower().Contains(searchLower) ||
                (o.Format != null && o.Format.ToLower().Contains(searchLower)) ||
                (o.MediaUser != null && o.MediaUser.CompanyName.ToLower().Contains(searchLower)));
        }

        return await query
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
