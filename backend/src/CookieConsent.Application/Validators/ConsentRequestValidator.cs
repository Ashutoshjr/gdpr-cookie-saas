using CookieConsent.Application.DTOs;
using FluentValidation;
using System.Text.Json;

namespace CookieConsent.Application.Validators;

public class ConsentRequestValidator : AbstractValidator<ConsentRequest>
{
    public ConsentRequestValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.SessionId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Categories)
            .NotEmpty()
            .Must(BeValidJson).WithMessage("Categories must be a valid JSON object.");
    }

    private static bool BeValidJson(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.ValueKind == JsonValueKind.Object;
        }
        catch
        {
            return false;
        }
    }
}
