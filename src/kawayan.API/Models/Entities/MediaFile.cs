namespace kawayan.API.Models.Entities;

public class MediaFile
{
    public int Id { get; set; }
    public required string FileName { get; set; }
    public required string Url { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
