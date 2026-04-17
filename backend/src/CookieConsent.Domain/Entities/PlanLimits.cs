namespace CookieConsent.Domain.Entities;

public static class PlanLimits
{
    public const int FreeMaxWebsites = 1;
    public const int FreeMaxConsentsPerMonth = 1_000;

    // Pro plan has no enforced limits
    public const int ProMaxWebsites = int.MaxValue;
    public const int ProMaxConsentsPerMonth = int.MaxValue;

    public static int MaxWebsites(string plan) =>
        plan == "pro" ? ProMaxWebsites : FreeMaxWebsites;

    public static int MaxConsentsPerMonth(string plan) =>
        plan == "pro" ? ProMaxConsentsPerMonth : FreeMaxConsentsPerMonth;
}
