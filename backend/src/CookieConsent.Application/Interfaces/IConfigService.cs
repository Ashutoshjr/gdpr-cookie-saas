using CookieConsent.Application.DTOs;

namespace CookieConsent.Application.Interfaces;

public interface IConfigService
{
    Task<ConfigResponse> GetConfigAsync(Guid apiKey);
}
