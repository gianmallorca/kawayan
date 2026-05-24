using System.ComponentModel.DataAnnotations.Schema;

namespace kawayan.API.Models.Entities;

public class CompanyDetails
{
    public int Id { get; set; } = 1;
    public string NameMain { get; set; } = string.Empty;
    public string NameBaybayin { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string PrimaryColor { get; set; } = "#2563eb";
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Barangay { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string Website { get; set; } = string.Empty;
    public string SocialLinksJson { get; set; } = "{}";
    public string? CoverImageUrl { get; set; }
    public string? AboutImageUrl { get; set; }
    public int? EstablishedYear { get; set; }
    public string ShortDescription { get; set; } = string.Empty;
    public string FullDescription { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public string FullAddress
    {
        get
        {
            var parts = new[] { Street, Barangay, City, Province, Region, Country }.Where(s => !string.IsNullOrWhiteSpace(s));
            var line = string.Join(", ", parts);
            if (!string.IsNullOrWhiteSpace(PostalCode))
                line = string.IsNullOrEmpty(line) ? PostalCode.Trim() : $"{line} {PostalCode.Trim()}";
            return line;
        }
    }
}
