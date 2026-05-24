using Microsoft.AspNetCore.Authorization;

namespace kawayan.API.Security;

public class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}
