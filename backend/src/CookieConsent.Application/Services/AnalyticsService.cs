using System.Text.Json;
using CookieConsent.Application.DTOs;
using CookieConsent.Application.Exceptions;
using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Interfaces;

namespace CookieConsent.Application.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IWebsiteRepository _websiteRepository;
    private readonly IConsentRepository _consentRepository;

    public AnalyticsService(IWebsiteRepository websiteRepository, IConsentRepository consentRepository)
    {
        _websiteRepository = websiteRepository;
        _consentRepository = consentRepository;
    }

    public async Task<ConsentSummaryDto> GetSummaryAsync(Guid websiteId, string userId)
    {
        await EnsureOwnershipAsync(websiteId, userId);

        var all = await _consentRepository.GetAllByWebsiteAsync(websiteId);
        var list = all.ToList();

        var total = list.Count;
        var thisMonth = list.Count(c => c.Timestamp >= new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1));

        // accepted = consentGiven true AND all optional categories true
        // rejected = consentGiven false
        // customized = consentGiven true but not all optional accepted
        var accepted = list.Count(c => c.ConsentGiven && IsAllAccepted(c.Categories));
        var rejected = list.Count(c => !c.ConsentGiven);
        var customized = total - accepted - rejected;

        return new ConsentSummaryDto
        {
            TotalConsents = total,
            AcceptedAll = accepted,
            RejectedAll = rejected,
            Customized = customized < 0 ? 0 : customized,
            ThisMonth = thisMonth,
            AcceptRate = total == 0 ? 0 : Math.Round((double)accepted / total * 100, 1),
            RejectRate = total == 0 ? 0 : Math.Round((double)rejected / total * 100, 1),
            CustomizeRate = total == 0 ? 0 : Math.Round((double)(customized < 0 ? 0 : customized) / total * 100, 1)
        };
    }

    public async Task<IEnumerable<DailyConsentDto>> GetTrendAsync(Guid websiteId, string userId, int days = 30)
    {
        await EnsureOwnershipAsync(websiteId, userId);

        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));
        var all = await _consentRepository.GetAllByWebsiteAsync(websiteId);

        var inRange = all.Where(c => c.Timestamp.Date >= since).ToList();

        // Build a result for every day in range, even days with 0 consents
        var result = new List<DailyConsentDto>();
        for (var d = 0; d < days; d++)
        {
            var date = since.AddDays(d);
            var dayConsents = inRange.Where(c => c.Timestamp.Date == date).ToList();

            result.Add(new DailyConsentDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                Total = dayConsents.Count,
                Accepted = dayConsents.Count(c => c.ConsentGiven),
                Rejected = dayConsents.Count(c => !c.ConsentGiven)
            });
        }

        return result;
    }

    public async Task<IEnumerable<CategoryRateDto>> GetCategoryRatesAsync(Guid websiteId, string userId)
    {
        await EnsureOwnershipAsync(websiteId, userId);

        var all = await _consentRepository.GetAllByWebsiteAsync(websiteId);
        var list = all.ToList();

        if (list.Count == 0) return Enumerable.Empty<CategoryRateDto>();

        // Parse category JSON and aggregate per category name
        var categoryTotals = new Dictionary<string, (int accepted, int total)>(StringComparer.OrdinalIgnoreCase);

        foreach (var consent in list)
        {
            try
            {
                var cats = JsonSerializer.Deserialize<Dictionary<string, bool>>(consent.Categories,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (cats == null) continue;

                foreach (var (name, accepted) in cats)
                {
                    if (!categoryTotals.ContainsKey(name))
                        categoryTotals[name] = (0, 0);

                    var (a, t) = categoryTotals[name];
                    categoryTotals[name] = (accepted ? a + 1 : a, t + 1);
                }
            }
            catch
            {
                // Malformed JSON — skip this record
            }
        }

        return categoryTotals.Select(kv => new CategoryRateDto
        {
            Category = kv.Key,
            AcceptedCount = kv.Value.accepted,
            TotalCount = kv.Value.total,
            AcceptRate = kv.Value.total == 0 ? 0 : Math.Round((double)kv.Value.accepted / kv.Value.total * 100, 1)
        }).OrderByDescending(r => r.TotalCount);
    }

    private async Task EnsureOwnershipAsync(Guid websiteId, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(websiteId)
            ?? throw new NotFoundException("Website", websiteId);

        if (website.UserId != userId)
            throw new ForbiddenException();
    }

    private static bool IsAllAccepted(string categoriesJson)
    {
        try
        {
            var cats = JsonSerializer.Deserialize<Dictionary<string, bool>>(categoriesJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (cats == null) return false;
            // All optional (non-necessary) categories must be true
            return cats.Where(kv => !kv.Key.Equals("necessary", StringComparison.OrdinalIgnoreCase))
                       .All(kv => kv.Value);
        }
        catch { return false; }
    }
}
