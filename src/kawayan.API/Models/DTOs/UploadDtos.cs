namespace kawayan.API.Models.DTOs;

public record LogoUploadResponse(string LogoUrl);
public record PageHeaderUploadResponse(string PageKey, string ImageUrl);
public record ServiceImageUploadResponse(int ServiceId, string ImageUrl);
