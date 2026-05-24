namespace kawayan.API.Models.Entities;

public class LegalPage
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateOnly? LastRevised { get; set; }
    public bool IsPublished { get; set; } = true;
    public DateTime UpdatedAt { get; set; }
}
