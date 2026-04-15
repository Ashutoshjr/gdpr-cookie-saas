using CookieConsent.Application.Interfaces;
using CookieConsent.Application.Services;
using CookieConsent.Application.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CookieConsent.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IWebsiteService, WebsiteService>();
        services.AddScoped<IConsentService, ConsentService>();
        services.AddScoped<IConfigService, ConfigService>();

        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

        return services;
    }
}
