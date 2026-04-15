using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Interfaces;
using CookieConsent.Infrastructure.Services;
using CookieConsent.Infrastructure.Data;
using CookieConsent.Infrastructure.Repositories;
using CookieConsent.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CookieConsent.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        services.AddMemoryCache();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWebsiteRepository, WebsiteRepository>();
        services.AddScoped<ICookieCategoryRepository, CookieCategoryRepository>();
        services.AddScoped<IConsentRepository, ConsentRepository>();

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();

        return services;
    }
}
