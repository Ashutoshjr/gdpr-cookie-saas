using CookieConsent.Domain.Entities;

namespace CookieConsent.Domain.Interfaces;

public interface ICookieCategoryRepository
{
    Task<IEnumerable<CookieCategory>> GetByWebsiteIdAsync(Guid websiteId);
    Task<CookieCategory> AddAsync(CookieCategory category);
    Task AddRangeAsync(IEnumerable<CookieCategory> categories);
}
