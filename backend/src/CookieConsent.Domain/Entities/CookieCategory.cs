namespace CookieConsent.Domain.Entities;

public class CookieCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WebsiteId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Website Website { get; set; } = null!;
}
