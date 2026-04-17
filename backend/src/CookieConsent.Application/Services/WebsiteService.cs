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
    private readonly IUserRepository _userRepository;
    private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;

    public WebsiteService(IWebsiteRepository websiteRepository, ICookieCategoryRepository categoryRepository,
        IUserRepository userRepository, Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
    {
        _websiteRepository = websiteRepository;
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _cache = cache;
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
        // Enforce plan website limit
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        var existingCount = (await _websiteRepository.GetByUserIdAsync(userId)).Count();
        var maxWebsites = PlanLimits.MaxWebsites(user.Plan);

        if (existingCount >= maxWebsites)
            throw new InvalidOperationException(
                $"Your {user.Plan} plan allows a maximum of {maxWebsites} website(s). " +
                $"Upgrade to Pro for unlimited websites.");

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

    public async Task<WebsiteDto> UpdateAppearanceAsync(Guid id, string userId, UpdateBannerAppearanceRequest request)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        website.PrimaryColor = request.PrimaryColor;
        website.BannerTitle = request.BannerTitle;
        website.BannerDescription = request.BannerDescription;
        website.BannerPosition = request.BannerPosition;
        website.Language = request.Language;
        website.GeoRestrictionEnabled = request.GeoRestrictionEnabled;
        website.PrivacyPolicyUrl = request.PrivacyPolicyUrl;

        await _websiteRepository.UpdateAsync(website);
        return MapToDto(website);
    }

    public async Task<WebsiteDto> UpdateInfoAsync(Guid id, string userId, UpdateWebsiteInfoRequest request)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        website.Name = request.Name;
        website.Domain = request.Domain.ToLowerInvariant().TrimEnd('/');

        await _websiteRepository.UpdateAsync(website);
        return MapToDto(website);
    }

    public async Task<WebsiteDto> RegenerateApiKeyAsync(Guid id, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        var oldApiKey = website.ApiKey;
        website.ApiKey = Guid.NewGuid();
        await _websiteRepository.UpdateAsync(website);
        // Bust the config cache for the old key so it can no longer serve stale data
        _cache.Remove($"config_{oldApiKey}");
        return MapToDto(website);
    }

    public async Task<string> GenerateCookiePolicyAsync(Guid id, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        var today = DateTime.UtcNow.ToString("MMMM d, yyyy");
        var privacyLink = !string.IsNullOrWhiteSpace(website.PrivacyPolicyUrl)
            ? $"For more information, please read our <a href=\"{website.PrivacyPolicyUrl}\">Privacy Policy</a>."
            : string.Empty;

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"<h1>Cookie Policy for {website.Name}</h1>");
        sb.AppendLine($"<p><strong>Last updated:</strong> {today}</p>");
        sb.AppendLine($"<p>This Cookie Policy explains how <strong>{website.Name}</strong> (<a href=\"{website.Domain}\">{website.Domain}</a>) uses cookies and similar technologies to recognise you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>");
        if (!string.IsNullOrEmpty(privacyLink))
            sb.AppendLine($"<p>{privacyLink}</p>");

        sb.AppendLine("<h2>What are cookies?</h2>");
        sb.AppendLine("<p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>");

        sb.AppendLine("<h2>How we use cookies</h2>");
        sb.AppendLine("<p>We use the following categories of cookies on this website:</p>");

        foreach (var cat in website.Categories)
        {
            var badge = cat.IsRequired ? " <em>(Required — cannot be disabled)</em>" : " <em>(Optional)</em>";
            sb.AppendLine($"<h3>{Capitalize(cat.Name)}{badge}</h3>");
            sb.AppendLine($"<p>{cat.Description}</p>");
        }

        sb.AppendLine("<h2>Your cookie choices</h2>");
        sb.AppendLine("<p>You can manage your cookie preferences at any time by clicking the <strong>\"Manage Cookies\"</strong> button on our website. Required cookies cannot be disabled as they are necessary for the website to function properly.</p>");
        sb.AppendLine("<p>You can also control cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of this website.</p>");

        sb.AppendLine("<h2>Contact us</h2>");
        sb.AppendLine($"<p>If you have any questions about our use of cookies, please contact us via our website at <a href=\"{website.Domain}\">{website.Domain}</a>.</p>");

        return sb.ToString();
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Website), id);

        if (website.UserId != userId)
            throw new ForbiddenException();

        await _websiteRepository.DeleteAsync(website);
    }

    private static string Capitalize(string s) =>
        string.IsNullOrEmpty(s) ? s : char.ToUpper(s[0]) + s[1..];

    private static WebsiteDto MapToDto(Website w) => new()
    {
        Id = w.Id,
        Name = w.Name,
        Domain = w.Domain,
        ApiKey = w.ApiKey,
        CreatedAt = w.CreatedAt,
        PrimaryColor = w.PrimaryColor,
        BannerTitle = w.BannerTitle,
        BannerDescription = w.BannerDescription,
        BannerPosition = w.BannerPosition,
        Language = w.Language,
        GeoRestrictionEnabled = w.GeoRestrictionEnabled,
        PrivacyPolicyUrl = w.PrivacyPolicyUrl,
        Categories = w.Categories.Select(c => new CookieCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            IsRequired = c.IsRequired
        }).ToList()
    };
}
