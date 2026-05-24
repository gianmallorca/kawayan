using System.Text.Json;
using kawayan.API.Data;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Services;

public class CompanyDetailsService(AppDbContext db, GeocodingService geocoding)
{
    private const string GeocodeWarning =
        "Address saved but could not be resolved to a map location. Please verify the address or enter coordinates manually.";

    public async Task<CompanyDetailsDto> GetAsync()
    {
        var entity = await GetOrCreateAsync();
        return ToDto(entity);
    }

    public async Task<UpdateCompanyDetailsResponse> UpdateAsync(UpdateCompanyDetailsRequest request)
    {
        var entity = await GetOrCreateAsync();
        var addressChanged = !CompanyAddressHelper.AddressFieldsEqual(entity, request);

        entity.NameMain = request.NameMain?.Trim() ?? "";
        entity.NameBaybayin = request.NameBaybayin?.Trim() ?? "";
        entity.Tagline = request.Tagline;
        entity.LogoUrl = request.LogoUrl;
        entity.PrimaryColor = NormalizeColor(request.PrimaryColor);
        entity.Email = request.Email;
        entity.Phone = request.Phone;
        entity.Street = request.Street ?? "";
        entity.Barangay = request.Barangay ?? "";
        entity.City = request.City ?? "";
        entity.Province = request.Province ?? "";
        entity.Region = request.Region ?? "";
        entity.Country = request.Country ?? "";
        entity.PostalCode = request.PostalCode ?? "";
        entity.Website = request.Website;
        entity.SocialLinksJson = JsonSerializer.Serialize(request.SocialLinks ?? new Dictionary<string, string>());
        entity.CoverImageUrl = request.CoverImageUrl;
        entity.AboutImageUrl = request.AboutImageUrl;
        entity.EstablishedYear = request.EstablishedYear;
        entity.ShortDescription = request.ShortDescription;
        entity.FullDescription = request.FullDescription;

        string? warning = null;

        if (request.MapLocationPinned && request.Latitude.HasValue && request.Longitude.HasValue)
        {
            entity.Latitude = request.Latitude;
            entity.Longitude = request.Longitude;
        }
        else if (addressChanged)
        {
            var coords = await geocoding.GeocodeAsync(
                entity.Street, entity.Barangay, entity.City, entity.Province, entity.Region, entity.Country, entity.PostalCode);
            if (coords is { } c)
            {
                entity.Latitude = c.Latitude;
                entity.Longitude = c.Longitude;
            }
            else
            {
                entity.Latitude = null;
                entity.Longitude = null;
                warning = GeocodeWarning;
            }
        }

        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return new UpdateCompanyDetailsResponse(ToDto(entity), warning);
    }

    public async Task<CompanyDetailsDto?> SetImageAsync(string field, string url)
    {
        var entity = await GetOrCreateAsync();
        switch (field)
        {
            case "logo": entity.LogoUrl = url; break;
            case "cover": entity.CoverImageUrl = url; break;
            case "about": entity.AboutImageUrl = url; break;
            default: return null;
        }
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToDto(entity);
    }

    private async Task<CompanyDetails> GetOrCreateAsync()
    {
        var entity = await db.CompanyDetails.FindAsync(1);
        if (entity is not null) return entity;

        entity = new CompanyDetails { Id = 1 };
        db.CompanyDetails.Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public static CompanyDetailsDto ToDto(CompanyDetails e) => new(
        e.NameMain,
        e.NameBaybayin,
        e.Tagline,
        e.LogoUrl,
        e.PrimaryColor,
        e.Email,
        e.Phone,
        e.Street,
        e.Barangay,
        e.City,
        e.Province,
        e.Region,
        e.Country,
        e.PostalCode,
        e.FullAddress,
        e.Latitude,
        e.Longitude,
        e.Website,
        ParseSocialLinks(e.SocialLinksJson),
        e.CoverImageUrl,
        e.AboutImageUrl,
        e.EstablishedYear,
        e.ShortDescription,
        e.FullDescription,
        e.UpdatedAt);

    private static Dictionary<string, string> ParseSocialLinks(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new();
        }
        catch
        {
            return new();
        }
    }

    private static string NormalizeColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color)) return "#2563eb";
        return color.StartsWith('#') ? color : $"#{color}";
    }
}
