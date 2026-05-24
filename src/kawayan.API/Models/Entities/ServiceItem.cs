namespace kawayan.API.Models.Entities;

public class ServiceItem
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string? IconUrl { get; set; }
    public string? ImageUrl { get; set; }
}
