using kawayan.API.Models.DTOs;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        if (result is null) return Unauthorized();

        var refresh = await authService.IssueRefreshTokenAsync(result.User.Id);
        SetRefreshCookie(refresh);
        return Ok(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            return Unauthorized();

        var result = await authService.RefreshAsync(refreshToken);
        if (result is null) return Unauthorized();

        var (accessToken, user) = result.Value;
        return Ok(new LoginResponse(accessToken, user));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            await authService.RevokeRefreshTokenAsync(refreshToken);

        DeleteRefreshCookie();
        return NoContent();
    }

    private void SetRefreshCookie(string token)
    {
        Response.Cookies.Append("refreshToken", token, CreateRefreshCookieOptions(DateTimeOffset.UtcNow.AddDays(7)));
    }

    private void DeleteRefreshCookie()
    {
        Response.Cookies.Delete("refreshToken", CreateRefreshCookieOptions(DateTimeOffset.UnixEpoch));
    }

    private CookieOptions CreateRefreshCookieOptions(DateTimeOffset expires) => new()
    {
        HttpOnly = true,
        Secure = Request.IsHttps,
        SameSite = SameSiteMode.Lax,
        Expires = expires,
        Path = "/",
    };
}
