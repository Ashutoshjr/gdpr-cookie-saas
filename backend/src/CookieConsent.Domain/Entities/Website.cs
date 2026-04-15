namespace CookieConsent.Domain.Entities;

public class Website
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public Guid ApiKey { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<CookieCategory> Categories { get; set; } = new List<CookieCategory>();
    public ICollection<Consent> Consents { get; set; } = new List<Consent>();
}
