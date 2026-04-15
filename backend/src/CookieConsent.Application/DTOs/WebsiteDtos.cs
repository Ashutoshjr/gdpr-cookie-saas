namespace CookieConsent.Application.DTOs;

public class CreateWebsiteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
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
    public List<CookieCategoryDto> Categories { get; set; } = new();
}
