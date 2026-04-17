using CookieConsent.Domain.Entities;

namespace CookieConsent.Domain.Interfaces;

public interface IConsentRepository
{
    Task<Consent> AddAsync(Consent consent);
    Task<(IEnumerable<Consent> Items, int TotalCount)> GetPagedAsync(Guid websiteId, int page, int pageSize);
    Task<IEnumerable<Consent>> GetAllByWebsiteAsync(Guid websiteId);
    Task<int> CountByWebsiteAsync(Guid websiteId);
    Task<int> CountThisMonthByUserAsync(string userId, DateTime monthStart);
}
