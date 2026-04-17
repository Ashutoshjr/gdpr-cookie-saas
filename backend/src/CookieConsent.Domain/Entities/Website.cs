namespace CookieConsent.Domain.Entities;

public class Website
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public Guid ApiKey { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Banner Customization
    public string PrimaryColor { get; set; } = "#1a73e8";
    public string BannerTitle { get; set; } = "We use cookies";
    public string BannerDescription { get; set; } = "We use cookies to improve your experience. You can choose which categories to allow.";
    public string BannerPosition { get; set; } = "bottom"; // bottom | top

    // Language & Geolocation
    public string Language { get; set; } = "en";
    public bool GeoRestrictionEnabled { get; set; } = false; // true = show banner only to EU/EEA visitors

    // Compliance
    public string PrivacyPolicyUrl { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<CookieCategory> Categories { get; set; } = new List<CookieCategory>();
    public ICollection<Consent> Consents { get; set; } = new List<Consent>();
}
