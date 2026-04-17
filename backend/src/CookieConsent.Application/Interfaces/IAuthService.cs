using CookieConsent.Application.DTOs;

namespace CookieConsent.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<string> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
    Task<UserProfileDto> GetProfileAsync(string userId);
    Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task<UsageSummaryDto> GetUsageSummaryAsync(string userId);
    Task<UserProfileDto> UpgradePlanAsync(string userId, UpgradePlanRequest request);
    Task DeleteAccountAsync(string userId);
}
