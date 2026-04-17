using CookieConsent.Application.DTOs;
using CookieConsent.Application.Exceptions;
using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace CookieConsent.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IWebsiteRepository _websiteRepository;
    private readonly IConsentRepository _consentRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepository, IWebsiteRepository websiteRepository,
        IConsentRepository consentRepository, IJwtService jwtService, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _websiteRepository = websiteRepository;
        _consentRepository = consentRepository;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            FullName = request.FullName,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        await _userRepository.AddAsync(user);

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            ExpiresAt = _jwtService.GetExpiry(),
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant());
        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            ExpiresAt = _jwtService.GetExpiry(),
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName
        };
    }

    public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant());
        // Always return success to prevent user enumeration attacks
        if (user == null) return "If that email exists, a reset link has been sent.";

        user.PasswordResetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.UpdateAsync(user);

        // In production: send email with reset link
        // For dev: token is returned so it can be used directly
        return user.PasswordResetToken;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var user = await _userRepository.GetByResetTokenAsync(request.Token)
            ?? throw new UnauthorizedException("Invalid or expired reset token.");

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Reset token has expired. Please request a new one.");

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _userRepository.UpdateAsync(user);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedException("Current password is incorrect.");

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        await _userRepository.UpdateAsync(user);
    }

    public async Task<UserProfileDto> GetProfileAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        return MapToDto(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        // Check email uniqueness if changed
        if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant());
            if (existing != null)
                throw new InvalidOperationException("That email is already in use.");
        }

        user.FullName = request.FullName;
        user.Email = request.Email.ToLowerInvariant();
        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task<UsageSummaryDto> GetUsageSummaryAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        var websites = await _websiteRepository.GetByUserIdAsync(userId);
        var websiteCount = websites.Count();

        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var consentsThisMonth = await _consentRepository.CountThisMonthByUserAsync(userId, monthStart);

        var maxWebsites = PlanLimits.MaxWebsites(user.Plan);
        var maxConsents = PlanLimits.MaxConsentsPerMonth(user.Plan);

        return new UsageSummaryDto
        {
            Plan = user.Plan,
            WebsitesUsed = websiteCount,
            WebsitesLimit = maxWebsites == int.MaxValue ? -1 : maxWebsites,
            ConsentsThisMonth = consentsThisMonth,
            ConsentsLimit = maxConsents == int.MaxValue ? -1 : maxConsents,
            WebsiteLimitReached = websiteCount >= maxWebsites,
            ConsentLimitReached = consentsThisMonth >= maxConsents
        };
    }

    public async Task<UserProfileDto> UpgradePlanAsync(string userId, UpgradePlanRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        if (request.Plan != "free" && request.Plan != "pro")
            throw new InvalidOperationException("Invalid plan. Must be 'free' or 'pro'.");

        user.Plan = request.Plan;
        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task DeleteAccountAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        // Cascade deletes (Websites → Categories + Consents) are handled by EF/DB
        await _userRepository.DeleteAsync(user);
    }

    private static UserProfileDto MapToDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        CreatedAt = user.CreatedAt,
        Plan = user.Plan
    };
}
