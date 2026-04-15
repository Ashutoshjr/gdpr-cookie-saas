using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;
using CookieConsent.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CookieConsent.Infrastructure.Repositories;

public class ConsentRepository : IConsentRepository
{
    private readonly AppDbContext _db;

    public ConsentRepository(AppDbContext db) => _db = db;

    public async Task<Consent> AddAsync(Consent consent)
    {
        _db.Consents.Add(consent);
        await _db.SaveChangesAsync();
        return consent;
    }

    public async Task<(IEnumerable<Consent> Items, int TotalCount)> GetPagedAsync(Guid websiteId, int page, int pageSize)
    {
        var query = _db.Consents
            .AsNoTracking()
            .Where(c => c.WebsiteId == websiteId)
            .OrderByDescending(c => c.Timestamp);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<int> CountByWebsiteAsync(Guid websiteId)
        => await _db.Consents.CountAsync(c => c.WebsiteId == websiteId);
}
