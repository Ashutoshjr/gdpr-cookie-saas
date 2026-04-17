namespace CookieConsent.Application.DTOs;

public class ConsentRequest
{
    public Guid WebsiteId { get; set; }
    public bool ConsentGiven { get; set; }
    public string Categories { get; set; } = "{}"; // JSON string
    public string SessionId { get; set; } = string.Empty;
}

public class ConsentDto
{
    public Guid Id { get; set; }
    public Guid WebsiteId { get; set; }
    public bool ConsentGiven { get; set; }
    public string Categories { get; set; } = "{}";
    public DateTime Timestamp { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}

public class ConfigResponse
{
    public Guid WebsiteId { get; set; }
    public string WebsiteName { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public string PrimaryColor { get; set; } = "#1a73e8";
    public string Position { get; set; } = "bottom"; // bottom | top
    public string BannerTitle { get; set; } = "We use cookies";
    public string BannerDescription { get; set; } = "We use cookies to improve your experience.";
    public string Language { get; set; } = "en";
    public bool GeoRestrictionEnabled { get; set; } = false;
    public string PrivacyPolicyUrl { get; set; } = string.Empty;
    public List<ConfigCategoryDto> Categories { get; set; } = new();
}

public class ConfigCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
}
