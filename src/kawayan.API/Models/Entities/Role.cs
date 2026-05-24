namespace kawayan.API.Models.Entities;

public class Role
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public ICollection<RolePermission> RolePermissions { get; set; } = [];
    public ICollection<UserRole> UserRoles { get; set; } = [];
}
