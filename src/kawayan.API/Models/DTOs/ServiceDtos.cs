namespace kawayan.API.Models.DTOs;



public record ServiceItemDto(int Id, string Title, string Description, decimal? Price, string? IconUrl, string? ImageUrl);

public record CreateServiceRequest(string Title, string Description, decimal? Price, string? IconUrl, string? ImageUrl);

public record UpdateServiceRequest(string Title, string Description, decimal? Price, string? IconUrl, string? ImageUrl);

