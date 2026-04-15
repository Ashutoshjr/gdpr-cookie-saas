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

    public ConsentService(IConsentRepository consentRepository, IWebsiteRepository websiteRepository)
    {
        _consentRepository = consentRepository;
        _websiteRepository = websiteRepository;
    }

    public async Task<ConsentDto> RecordAsync(ConsentRequest request, string ipAddress, string userAgent)
    {
        // Validate website exists
        var website = await _websiteRepository.GetByIdAsync(request.WebsiteId)
            ?? throw new NotFoundException(nameof(Website), request.WebsiteId);

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
