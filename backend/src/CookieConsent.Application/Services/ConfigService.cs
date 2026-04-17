using CookieConsent.Application.DTOs;
using CookieConsent.Application.Exceptions;
using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace CookieConsent.Application.Services;

public class ConfigService : IConfigService
{
    private readonly IWebsiteRepository _websiteRepository;
    private readonly ICookieCategoryRepository _categoryRepository;
    private readonly IMemoryCache _cache;

    public ConfigService(IWebsiteRepository websiteRepository, ICookieCategoryRepository categoryRepository, IMemoryCache cache)
    {
        _websiteRepository = websiteRepository;
        _categoryRepository = categoryRepository;
        _cache = cache;
    }

    public async Task<ConfigResponse> GetConfigAsync(Guid apiKey)
    {
        var cacheKey = $"config_{apiKey}";

        if (_cache.TryGetValue(cacheKey, out ConfigResponse? cached) && cached != null)
            return cached;

        var website = await _websiteRepository.GetByApiKeyAsync(apiKey)
            ?? throw new NotFoundException("Website", apiKey);

        var categories = await _categoryRepository.GetByWebsiteIdAsync(website.Id);

        var config = new ConfigResponse
        {
            WebsiteId = website.Id,
            WebsiteName = website.Name,
            Domain = website.Domain,
            Version = 1,
            PrimaryColor = website.PrimaryColor,
            Position = website.BannerPosition,
            BannerTitle = website.BannerTitle,
            BannerDescription = website.BannerDescription,
            Language = website.Language,
            GeoRestrictionEnabled = website.GeoRestrictionEnabled,
            PrivacyPolicyUrl = website.PrivacyPolicyUrl,
            Categories = categories.Select(c => new ConfigCategoryDto
            {
                Name = c.Name,
                Description = c.Description,
                IsRequired = c.IsRequired
            }).ToList()
        };

        _cache.Set(cacheKey, config, TimeSpan.FromMinutes(5));
        return config;
    }
}
