namespace kawayan.API.Models.DTOs;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string AccessToken, UserDto User);
public record UserDto(int Id, string Email, string DisplayName, IReadOnlyList<string> Permissions);
