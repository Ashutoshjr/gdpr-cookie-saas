using CookieConsent.Application.DTOs;
using CookieConsent.Application.Exceptions;
using CookieConsent.Application.Interfaces;
using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;

namespace CookieConsent.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepository, IJwtService jwtService, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
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
}
