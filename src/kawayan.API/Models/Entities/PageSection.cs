namespace kawayan.API.Models.Entities;

public class PageSection
{
    public int Id { get; set; }
    public required string Page { get; set; }
    public required string SectionKey { get; set; }
    public string ContentJson { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
