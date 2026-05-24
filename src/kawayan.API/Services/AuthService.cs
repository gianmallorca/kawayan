using kawayan.API.Data;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Services;

public class AuthService(AppDbContext db, TokenService tokenService)
{
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var permissions = GetPermissions(user);
        var accessToken = tokenService.CreateAccessToken(user, permissions);
        return new LoginResponse(accessToken, ToUserDto(user, permissions));
    }

    public async Task<(string AccessToken, UserDto User)?> RefreshAsync(string refreshToken)
    {
        var stored = await db.RefreshTokens
            .Include(t => t.User)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .FirstOrDefaultAsync(t => t.Token == refreshToken && t.ExpiresAt > DateTime.UtcNow);

        if (stored?.User is null || !stored.User.IsActive) return null;

        var permissions = GetPermissions(stored.User);
        return (tokenService.CreateAccessToken(stored.User, permissions), ToUserDto(stored.User, permissions));
    }

    public async Task<string> IssueRefreshTokenAsync(int userId)
    {
        var token = tokenService.CreateRefreshToken();
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
        await db.SaveChangesAsync();
        return token;
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (stored is not null) db.RefreshTokens.Remove(stored);
        await db.SaveChangesAsync();
    }

    private static List<string> GetPermissions(User user) =>
        user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission)
            .Distinct()
            .ToList();

    public static UserDto ToUserDto(User user, IReadOnlyList<string> permissions) =>
        new(user.Id, user.Email, user.DisplayName, permissions);
}
