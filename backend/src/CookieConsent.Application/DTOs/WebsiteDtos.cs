namespace CookieConsent.Application.DTOs;

public class CreateWebsiteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
}

public class UpdateWebsiteInfoRequest
{
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
}

public class UpdateBannerAppearanceRequest
{
    public string PrimaryColor { get; set; } = "#1a73e8";
    public string BannerTitle { get; set; } = "We use cookies";
    public string BannerDescription { get; set; } = "We use cookies to improve your experience.";
    public string BannerPosition { get; set; } = "bottom";
    public string Language { get; set; } = "en";
    public bool GeoRestrictionEnabled { get; set; } = false;
    public string PrivacyPolicyUrl { get; set; } = string.Empty;
}

public class CookieCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
}

public class WebsiteDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public Guid ApiKey { get; set; }
    public DateTime CreatedAt { get; set; }
    public string PrimaryColor { get; set; } = "#1a73e8";
    public string BannerTitle { get; set; } = "We use cookies";
    public string BannerDescription { get; set; } = "We use cookies to improve your experience.";
    public string BannerPosition { get; set; } = "bottom";
    public string Language { get; set; } = "en";
    public bool GeoRestrictionEnabled { get; set; } = false;
    public string PrivacyPolicyUrl { get; set; } = string.Empty;
    public List<CookieCategoryDto> Categories { get; set; } = new();
}
