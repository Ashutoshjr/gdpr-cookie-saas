using CookieConsent.Application.DTOs;

namespace CookieConsent.Application.Interfaces;

public interface IWebsiteService
{
    Task<IEnumerable<WebsiteDto>> GetByUserAsync(string userId);
    Task<WebsiteDto> GetByIdAsync(Guid id, string userId);
    Task<WebsiteDto> CreateAsync(CreateWebsiteRequest request, string userId);
    Task<WebsiteDto> UpdateAppearanceAsync(Guid id, string userId, UpdateBannerAppearanceRequest request);
    Task<WebsiteDto> UpdateInfoAsync(Guid id, string userId, UpdateWebsiteInfoRequest request);
    Task<WebsiteDto> RegenerateApiKeyAsync(Guid id, string userId);
    Task<string> GenerateCookiePolicyAsync(Guid id, string userId);
    Task DeleteAsync(Guid id, string userId);
}
