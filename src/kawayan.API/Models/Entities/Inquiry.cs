namespace kawayan.API.Models.Entities;

public class Inquiry
{
    public int Id { get; set; }
    public required string SenderName { get; set; }
    public required string SenderEmail { get; set; }
    public string Phone { get; set; } = string.Empty;
    public required string Subject { get; set; }
    public required string Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
