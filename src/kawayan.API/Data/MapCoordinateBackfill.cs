using kawayan.API.Services;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Data;

public static class MapCoordinateBackfill
{
    public static async Task TryBackfillAsync(AppDbContext db, GeocodingService geocoding)
    {
        var company = await db.CompanyDetails.FindAsync(1);
        if (company is null)
            return;

        var hasCoords = company.Latitude is { } lat && company.Longitude is { } lng &&
                        (lat != 0 || lng != 0);
        if (hasCoords)
            return;

        if (string.IsNullOrWhiteSpace(company.City) && string.IsNullOrWhiteSpace(company.Barangay) &&
            string.IsNullOrWhiteSpace(company.Street))
            return;

        var coords = await geocoding.GeocodeAsync(
            company.Street, company.Barangay, company.City, company.Province, company.Region, company.Country, company.PostalCode);
        if (coords is not { } c) return;

        company.Latitude = c.Latitude;
        company.Longitude = c.Longitude;
        company.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}
