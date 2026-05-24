namespace kawayan.API.Models.Entities;

public class RolePermission
{
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public required string Permission { get; set; }
}
