using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;

namespace kawayan.API.Services;

public static class CompanyAddressHelper
{
    public static string BuildFullAddress(CompanyDetails e)
    {
        var parts = new[] { e.Street, e.Barangay, e.City, e.Province, e.Region, e.Country }
            .Where(s => !string.IsNullOrWhiteSpace(s));
        var line = string.Join(", ", parts);
        if (!string.IsNullOrWhiteSpace(e.PostalCode))
            line = string.IsNullOrEmpty(line) ? e.PostalCode.Trim() : $"{line} {e.PostalCode.Trim()}";
        return line;
    }

    public static bool AddressFieldsEqual(CompanyDetails a, UpdateCompanyDetailsRequest b) =>
        a.Street == b.Street &&
        a.Barangay == b.Barangay &&
        a.City == b.City &&
        a.Province == b.Province &&
        a.Region == b.Region &&
        a.Country == b.Country &&
        a.PostalCode == b.PostalCode;
}
