using CookieConsent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CookieConsent.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Website> Websites => Set<Website>();
    public DbSet<CookieCategory> CookieCategories => Set<CookieCategory>();
    public DbSet<Consent> Consents => Set<Consent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).HasMaxLength(200).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.FullName).HasMaxLength(100).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Plan).HasColumnName("UserPlan").HasMaxLength(20).HasDefaultValue("free");
        });

        // Website
        modelBuilder.Entity<Website>(e =>
        {
            e.HasKey(w => w.Id);
            e.Property(w => w.Name).HasMaxLength(100).IsRequired();
            e.Property(w => w.Domain).HasMaxLength(200).IsRequired();
            e.HasIndex(w => w.ApiKey).IsUnique();
            e.HasOne(w => w.User)
             .WithMany(u => u.Websites)
             .HasForeignKey(w => w.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // CookieCategory
        modelBuilder.Entity<CookieCategory>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
            e.Property(c => c.Description).HasMaxLength(500);
            e.HasOne(c => c.Website)
             .WithMany(w => w.Categories)
             .HasForeignKey(c => c.WebsiteId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Consent
        modelBuilder.Entity<Consent>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Categories).HasColumnType("nvarchar(max)").IsRequired();
            e.Property(c => c.IpAddress).HasMaxLength(50);
            e.Property(c => c.UserAgent).HasMaxLength(500);
            e.Property(c => c.SessionId).HasMaxLength(100);
            e.HasOne(c => c.Website)
             .WithMany(w => w.Consents)
             .HasForeignKey(c => c.WebsiteId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
