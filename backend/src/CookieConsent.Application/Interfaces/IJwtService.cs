using CookieConsent.Domain.Entities;

namespace CookieConsent.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    DateTime GetExpiry();
}
