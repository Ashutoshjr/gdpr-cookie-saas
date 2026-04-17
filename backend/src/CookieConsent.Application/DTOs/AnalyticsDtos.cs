namespace CookieConsent.Application.DTOs;

public class ConsentSummaryDto
{
    public int TotalConsents { get; set; }
    public int AcceptedAll { get; set; }
    public int RejectedAll { get; set; }
    public int Customized { get; set; }
    public int ThisMonth { get; set; }
    public double AcceptRate { get; set; }
    public double RejectRate { get; set; }
    public double CustomizeRate { get; set; }
}

public class DailyConsentDto
{
    public string Date { get; set; } = string.Empty;   // "YYYY-MM-DD"
    public int Total { get; set; }
    public int Accepted { get; set; }
    public int Rejected { get; set; }
}

public class CategoryRateDto
{
    public string Category { get; set; } = string.Empty;
    public int AcceptedCount { get; set; }
    public int TotalCount { get; set; }
    public double AcceptRate { get; set; }
}
