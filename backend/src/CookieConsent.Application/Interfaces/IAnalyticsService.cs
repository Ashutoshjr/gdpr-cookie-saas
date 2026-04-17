using CookieConsent.Application.DTOs;

namespace CookieConsent.Application.Interfaces;

public interface IAnalyticsService
{
    Task<ConsentSummaryDto> GetSummaryAsync(Guid websiteId, string userId);
    Task<IEnumerable<DailyConsentDto>> GetTrendAsync(Guid websiteId, string userId, int days = 30);
    Task<IEnumerable<CategoryRateDto>> GetCategoryRatesAsync(Guid websiteId, string userId);
}
