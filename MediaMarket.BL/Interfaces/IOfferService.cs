using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Interfaces;

public interface IOfferService
{
    Task<Offer?> GetByIdAsync(Guid id);
    Task<List<Offer>> GetAllAsync();
    Task<List<Offer>> GetByMediaUserIdAsync(Guid mediaUserId);
    Task<List<Offer>> GetPublishedAsync();
    Task<List<Offer>> GetByStatusAsync(OfferStatus status);
    Task<List<Offer>> GetByMediaTypeAsync(MediaType mediaType);
    Task<List<Offer>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<List<Offer>> GetFilteredAsync(
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
        string? searchQuery = null);
    Task<Offer> CreateAsync(Offer offer);
    Task<Offer> UpdateAsync(Offer offer);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> PublishAsync(Guid id);
    Task<bool> ArchiveAsync(Guid id);
    Task<int> ArchiveExpiredOffersAsync(); // Automatická archivácia offers s ValidTo < DateTime.UtcNow
}
