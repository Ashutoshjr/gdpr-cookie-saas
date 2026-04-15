using CookieConsent.Application.DTOs;
using CookieConsent.Application.Exceptions;
using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;

namespace CookieConsent.Application.Services;

public class WebsiteService : IWebsiteService
{
    private readonly IWebsiteRepository _websiteRepository;
    private readonly ICookieCategoryRepository _categoryRepository;

    public WebsiteService(IWebsiteRepository websiteRepository, ICookieCategoryRepository categoryRepository)
    {
        _websiteRepository = websiteRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<WebsiteDto>> GetByUserAsync(string userId)
    {
        var websites = await _websiteRepository.GetByUserIdAsync(userId);
        return websites.Select(MapToDto);
    }

    public async Task<WebsiteDto> GetByIdAsync(Guid id, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        return MapToDto(website);
    }

    public async Task<WebsiteDto> CreateAsync(CreateWebsiteRequest request, string userId)
    {
        var website = new Website
        {
            Name = request.Name,
            Domain = request.Domain.ToLowerInvariant().TrimEnd('/'),
            UserId = userId
        };

        await _websiteRepository.AddAsync(website);

        // Seed 3 default cookie categories
        var defaultCategories = new List<CookieCategory>
        {
            new() { WebsiteId = website.Id, Name = "necessary", Description = "Essential cookies required for the website to function.", IsRequired = true },
            new() { WebsiteId = website.Id, Name = "analytics", Description = "Cookies that help us understand how visitors interact with the website.", IsRequired = false },
            new() { WebsiteId = website.Id, Name = "marketing", Description = "Cookies used to deliver relevant advertisements.", IsRequired = false }
        };

        await _categoryRepository.AddRangeAsync(defaultCategories);
        website.Categories = defaultCategories;

        return MapToDto(website);
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        await _websiteRepository.DeleteAsync(website);
    }

    private static WebsiteDto MapToDto(Website w) => new()
    {
        Id = w.Id,
        Name = w.Name,
        Domain = w.Domain,
        ApiKey = w.ApiKey,
        CreatedAt = w.CreatedAt,
        Categories = w.Categories.Select(c => new CookieCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            IsRequired = c.IsRequired
        }).ToList()
    };
}
