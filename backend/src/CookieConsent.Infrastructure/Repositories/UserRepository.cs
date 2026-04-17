using CookieConsent.Domain.Entities;
using CookieConsent.Domain.Interfaces;
using CookieConsent.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CookieConsent.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public async Task<User?> GetByIdAsync(string id)
        => await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User?> GetByEmailAsync(string email)
        => await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetByResetTokenAsync(string token)
        => await _db.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == token);

    public async Task<User> AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(User user)
    {
        var tracked = await _db.Users.FindAsync(user.Id);
        if (tracked != null)
        {
            _db.Users.Remove(tracked);
            await _db.SaveChangesAsync();
        }
    }
}
