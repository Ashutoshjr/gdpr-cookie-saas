using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;
using CookieConsent.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CookieConsent.Infrastructure.Repositories;

public class WebsiteRepository : IWebsiteRepository
{
    private readonly AppDbContext _db;

    public WebsiteRepository(AppDbContext db) => _db = db;

    public async Task<Website?> GetByIdAsync(Guid id)
        => await _db.Websites
            .Include(w => w.Categories)
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id);

    public async Task<Website?> GetByApiKeyAsync(Guid apiKey)
        => await _db.Websites
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.ApiKey == apiKey);

    public async Task<IEnumerable<Website>> GetByUserIdAsync(string userId)
        => await _db.Websites
            .Include(w => w.Categories)
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();

    public async Task<Website> AddAsync(Website website)
    {
        _db.Websites.Add(website);
        await _db.SaveChangesAsync();
        return website;
    }

    public async Task UpdateAsync(Website website)
    {
        var tracked = await _db.Websites.FindAsync(website.Id);
        if (tracked != null)
        {
            tracked.PrimaryColor = website.PrimaryColor;
            tracked.BannerTitle = website.BannerTitle;
            tracked.BannerDescription = website.BannerDescription;
            tracked.BannerPosition = website.BannerPosition;
            tracked.Language = website.Language;
            tracked.GeoRestrictionEnabled = website.GeoRestrictionEnabled;
            tracked.PrivacyPolicyUrl = website.PrivacyPolicyUrl;
            tracked.Name = website.Name;
            tracked.Domain = website.Domain;
            tracked.ApiKey = website.ApiKey;
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeleteAsync(Website website)
    {
        var tracked = await _db.Websites.FindAsync(website.Id);
        if (tracked != null)
        {
            _db.Websites.Remove(tracked);
            await _db.SaveChangesAsync();
        }
    }
}
