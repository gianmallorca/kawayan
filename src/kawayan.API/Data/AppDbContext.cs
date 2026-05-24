using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<CompanyDetails> CompanyDetails => Set<CompanyDetails>();
    public DbSet<PageSection> PageSections => Set<PageSection>();
    public DbSet<ServiceItem> Services => Set<ServiceItem>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<LegalPage> LegalPages => Set<LegalPage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e => e.HasIndex(x => x.Email).IsUnique());

        modelBuilder.Entity<UserRole>(e =>
        {
            e.HasKey(x => new { x.UserId, x.RoleId });
            e.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.HasKey(x => new { x.RoleId, x.Permission });
            e.HasOne(x => x.Role).WithMany(x => x.RolePermissions).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(x => x.Token).IsUnique();
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<CompanyDetails>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Latitude).HasPrecision(9, 6);
            e.Property(x => x.Longitude).HasPrecision(9, 6);
            e.Ignore(x => x.FullAddress);
        });

        modelBuilder.Entity<PageSection>(e =>
        {
            e.HasIndex(x => new { x.Page, x.SectionKey }).IsUnique();
        });

        modelBuilder.Entity<Article>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<LegalPage>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
        });
    }
}
