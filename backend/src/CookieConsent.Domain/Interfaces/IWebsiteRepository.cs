using CookieConsent.Domain.Entities;

namespace CookieConsent.Domain.Interfaces;

public interface IWebsiteRepository
{
    Task<Website?> GetByIdAsync(Guid id);
    Task<Website?> GetByApiKeyAsync(Guid apiKey);
    Task<IEnumerable<Website>> GetByUserIdAsync(string userId);
    Task<Website> AddAsync(Website website);
    Task DeleteAsync(Website website);
}
