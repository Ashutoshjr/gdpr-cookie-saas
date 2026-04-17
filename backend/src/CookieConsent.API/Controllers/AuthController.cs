using System.Security.Claims;
using CookieConsent.Application.DTOs;
using CookieConsent.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace CookieConsent.API.Controllers;

[ApiController]
[Route("api/auth")]
[EnableCors("PublicPolicy")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthController(
        IAuthService authService,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var validation = await _registerValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { status = 400, message = "Validation failed.", errors = validation.ToDictionary() });

        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var validation = await _loginValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { status = 400, message = "Validation failed.", errors = validation.ToDictionary() });

        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });

        var token = await _authService.ForgotPasswordAsync(request);
        // In production: token would be emailed. For dev we return it directly.
        return Ok(new { message = "If that email exists, a reset link has been sent.", resetToken = token });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Token and new password are required." });

        if (request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        await _authService.ResetPasswordAsync(request);
        return Ok(new { message = "Password has been reset successfully. You can now log in." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Current and new passwords are required." });

        if (request.NewPassword.Length < 6)
            return BadRequest(new { message = "New password must be at least 6 characters." });

        await _authService.ChangePasswordAsync(UserId, request);
        return Ok(new { message = "Password changed successfully." });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var profile = await _authService.GetProfileAsync(UserId);
        return Ok(profile);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Full name and email are required." });

        var profile = await _authService.UpdateProfileAsync(UserId, request);
        return Ok(profile);
    }

    [Authorize]
    [HttpGet("usage")]
    public async Task<ActionResult<UsageSummaryDto>> GetUsage()
    {
        var summary = await _authService.GetUsageSummaryAsync(UserId);
        return Ok(summary);
    }

    [Authorize]
    [HttpPost("upgrade")]
    public async Task<ActionResult<UserProfileDto>> UpgradePlan([FromBody] UpgradePlanRequest request)
    {
        var profile = await _authService.UpgradePlanAsync(UserId, request);
        return Ok(profile);
    }

    [Authorize]
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount()
    {
        await _authService.DeleteAccountAsync(UserId);
        return NoContent();
    }
}
