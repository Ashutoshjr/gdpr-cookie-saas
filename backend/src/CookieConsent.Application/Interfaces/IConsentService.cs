using CookieConsent.Application.DTOs;

namespace CookieConsent.Application.Interfaces;

public interface IConsentService
{
    Task<ConsentDto> RecordAsync(ConsentRequest request, string ipAddress, string userAgent);
    Task<PagedResult<ConsentDto>> GetPagedAsync(Guid websiteId, string userId, int page, int pageSize);
    Task<int> CountByWebsiteAsync(Guid websiteId);
    Task<string> ExportCsvAsync(Guid websiteId, string userId);
}
