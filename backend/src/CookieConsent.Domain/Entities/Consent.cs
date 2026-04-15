namespace CookieConsent.Domain.Entities;

public class Consent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WebsiteId { get; set; }
    public bool ConsentGiven { get; set; }
    public string Categories { get; set; } = "{}"; // JSON: {"analytics": true, "marketing": false}
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;

    public Website Website { get; set; } = null!;
}
