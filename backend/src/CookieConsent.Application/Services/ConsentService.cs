using System.Text;
using CookieConsent.Application.DTOs;
using CookieConsent.Application.Exceptions;
using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;

namespace CookieConsent.Application.Services;

public class ConsentService : IConsentService
{
    private readonly IConsentRepository _consentRepository;
    private readonly IWebsiteRepository _websiteRepository;
    private readonly IUserRepository _userRepository;

    public ConsentService(IConsentRepository consentRepository, IWebsiteRepository websiteRepository,
        IUserRepository userRepository)
    {
        _consentRepository = consentRepository;
        _websiteRepository = websiteRepository;
        _userRepository = userRepository;
    }

    public async Task<ConsentDto> RecordAsync(ConsentRequest request, string ipAddress, string userAgent)
    {
        // Validate website exists
        var website = await _websiteRepository.GetByIdAsync(request.WebsiteId)
            ?? throw new NotFoundException(nameof(Website), request.WebsiteId);

        // Enforce monthly consent limit for the website owner's plan
        var owner = await _userRepository.GetByIdAsync(website.UserId);
        if (owner != null)
        {
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthlyCount = await _consentRepository.CountThisMonthByUserAsync(owner.Id, monthStart);
            var limit = PlanLimits.MaxConsentsPerMonth(owner.Plan);
            if (monthlyCount >= limit)
                throw new InvalidOperationException(
                    $"Monthly consent limit of {limit:N0} reached for this account.");
        }

        var consent = new Consent
        {
            WebsiteId = request.WebsiteId,
            ConsentGiven = request.ConsentGiven,
            Categories = request.Categories,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            SessionId = request.SessionId
        };

        await _consentRepository.AddAsync(consent);
        return MapToDto(consent);
    }

    public async Task<PagedResult<ConsentDto>> GetPagedAsync(Guid websiteId, string userId, int page, int pageSize)
    {
        var website = await _websiteRepository.GetByIdAsync(websiteId)
            ?? throw new NotFoundException(nameof(Website), websiteId);

        if (website.UserId != userId)
            throw new ForbiddenException();

        var (items, totalCount) = await _consentRepository.GetPagedAsync(websiteId, page, pageSize);

        return new PagedResult<ConsentDto>
        {
            Items = items.Select(MapToDto),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<int> CountByWebsiteAsync(Guid websiteId)
        => await _consentRepository.CountByWebsiteAsync(websiteId);

    public async Task<string> ExportCsvAsync(Guid websiteId, string userId)
    {
        var website = await _websiteRepository.GetByIdAsync(websiteId)
            ?? throw new NotFoundException(nameof(Website), websiteId);

        if (website.UserId != userId)
            throw new ForbiddenException();

        var consents = await _consentRepository.GetAllByWebsiteAsync(websiteId);

        var csv = new StringBuilder();
        csv.AppendLine("Id,SessionId,ConsentGiven,Categories,Timestamp,IpAddress,UserAgent");

        foreach (var c in consents)
        {
            csv.AppendLine(string.Join(",",
                c.Id,
                EscapeCsvField(c.SessionId),
                c.ConsentGiven ? "Yes" : "No",
                EscapeCsvField(c.Categories),
                c.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                EscapeCsvField(c.IpAddress ?? ""),
                EscapeCsvField(c.UserAgent ?? "")
            ));
        }

        return csv.ToString();
    }

    private static string EscapeCsvField(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }

    private static ConsentDto MapToDto(Consent c) => new()
    {
        Id = c.Id,
        WebsiteId = c.WebsiteId,
        ConsentGiven = c.ConsentGiven,
        Categories = c.Categories,
        Timestamp = c.Timestamp,
        IpAddress = c.IpAddress,
        UserAgent = c.UserAgent,
        SessionId = c.SessionId
    };
}
