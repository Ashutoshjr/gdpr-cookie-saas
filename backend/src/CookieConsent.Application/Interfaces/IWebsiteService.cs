using CookieConsent.Application.DTOs;

namespace CookieConsent.Application.Interfaces;

public interface IWebsiteService
{
    Task<IEnumerable<WebsiteDto>> GetByUserAsync(string userId);
    Task<WebsiteDto> GetByIdAsync(Guid id, string userId);
    Task<WebsiteDto> CreateAsync(CreateWebsiteRequest request, string userId);
    Task DeleteAsync(Guid id, string userId);
}
