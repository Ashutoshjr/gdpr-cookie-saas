using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;
using CookieConsent.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CookieConsent.Infrastructure.Repositories;

public class CookieCategoryRepository : ICookieCategoryRepository
{
    private readonly AppDbContext _db;

    public CookieCategoryRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<CookieCategory>> GetByWebsiteIdAsync(Guid websiteId)
        => await _db.CookieCategories
            .AsNoTracking()
            .Where(c => c.WebsiteId == websiteId)
            .OrderBy(c => c.IsRequired ? 0 : 1)
            .ThenBy(c => c.Name)
            .ToListAsync();

    public async Task<CookieCategory> AddAsync(CookieCategory category)
    {
        _db.CookieCategories.Add(category);
        await _db.SaveChangesAsync();
        return category;
    }

    public async Task AddRangeAsync(IEnumerable<CookieCategory> categories)
    {
        _db.CookieCategories.AddRange(categories);
        await _db.SaveChangesAsync();
    }
}
