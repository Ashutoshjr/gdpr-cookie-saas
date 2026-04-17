using CookieConsent.Domain.Entities;

namespace CookieConsent.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByResetTokenAsync(string token);
    Task<User> AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(User user);
}
