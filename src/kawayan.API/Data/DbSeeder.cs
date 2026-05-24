using kawayan.API.Models.Entities;
using kawayan.API.Security;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await KawayanSeedData.SeedAsync(db);
        await LegalPagesSeedData.SeedAsync(db);

        if (await db.Users.AnyAsync()) return;

        var adminRole = new Role { Name = "Administrator" };
        foreach (var permission in Permissions.All)
            adminRole.RolePermissions.Add(new RolePermission { Permission = permission });

        var admin = new User
        {
            Email = "admin@kawayan.test",
            DisplayName = "Administrator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
        };
        admin.UserRoles.Add(new UserRole { Role = adminRole });

        db.Roles.Add(adminRole);
        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}
