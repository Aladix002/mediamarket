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
    Task<Offer> CreateAsync(Offer offer);
    Task<Offer> UpdateAsync(Offer offer);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> PublishAsync(Guid id);
    Task<bool> ArchiveAsync(Guid id);
}
