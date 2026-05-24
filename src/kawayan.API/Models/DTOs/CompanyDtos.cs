namespace kawayan.API.Models.DTOs;

public record CompanyDetailsDto(
    string NameMain,
    string NameBaybayin,
    string Tagline,
    string? LogoUrl,
    string PrimaryColor,
    string Email,
    string Phone,
    string Street,
    string Barangay,
    string City,
    string Province,
    string Region,
    string Country,
    string PostalCode,
    string FullAddress,
    decimal? Latitude,
    decimal? Longitude,
    string Website,
    Dictionary<string, string> SocialLinks,
    string? CoverImageUrl,
    string? AboutImageUrl,
    int? EstablishedYear,
    string ShortDescription,
    string FullDescription,
    DateTime UpdatedAt);

public record UpdateCompanyDetailsRequest(
    string NameMain,
    string NameBaybayin,
    string Tagline,
    string? LogoUrl,
    string PrimaryColor,
    string Email,
    string Phone,
    string Street,
    string Barangay,
    string City,
    string Province,
    string Region,
    string Country,
    string PostalCode,
    decimal? Latitude,
    decimal? Longitude,
    bool MapLocationPinned,
    string Website,
    Dictionary<string, string>? SocialLinks,
    string? CoverImageUrl,
    string? AboutImageUrl,
    int? EstablishedYear,
    string ShortDescription,
    string FullDescription);

public record GeocodePreviewDto(decimal Latitude, decimal Longitude);

public record ReverseGeocodeResult(
    string Street,
    string Barangay,
    string City,
    string Province,
    string Region,
    string Country,
    string PostalCode,
    decimal Latitude,
    decimal Longitude,
    string DisplayName);

public record UpdateCompanyDetailsResponse(CompanyDetailsDto Company, string? GeocodeWarning);
