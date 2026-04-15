using CookieConsent.Application.DTOs;
using FluentValidation;

namespace CookieConsent.Application.Validators;

public class CreateWebsiteValidator : AbstractValidator<CreateWebsiteRequest>
{
    public CreateWebsiteValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Domain)
            .NotEmpty()
            .MaximumLength(200)
            .Must(BeAValidDomain).WithMessage("Domain must be a valid URL (e.g. https://example.com)");
    }

    private static bool BeAValidDomain(string domain)
    {
        return Uri.TryCreate(domain, UriKind.Absolute, out var uri)
               && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
