using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using kawayan.API.Models.DTOs;

namespace kawayan.API.Services;

public class GeocodingService(IHttpClientFactory httpClientFactory)
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public async Task<(decimal Latitude, decimal Longitude)?> GeocodeAsync(
        string street,
        string barangay,
        string city,
        string province,
        string region,
        string country,
        string postalCode,
        CancellationToken cancellationToken = default)
    {
        var fullAddress = JoinParts(street, barangay, city, province, region, country, postalCode);
        if (!string.IsNullOrWhiteSpace(fullAddress))
        {
            var fromFull = await TryFreeTextAsync(fullAddress, null, cancellationToken);
            if (fromFull is not null)
                return fromFull;
        }

        var hasBarangay = !string.IsNullOrWhiteSpace(barangay);

        if (hasBarangay)
        {
            foreach (var freeText in BuildBarangayFirstFreeTextQueries(street, barangay, city, province, country))
            {
                var result = await TryFreeTextAsync(freeText, barangay, cancellationToken);
                if (result is not null)
                    return result;
            }

            foreach (var structured in BuildBarangayStructuredQueries(street, barangay, city, province, country, postalCode))
            {
                var result = await TryStructuredAsync(structured, barangay, cancellationToken);
                if (result is not null)
                    return result;
            }

        }

        if (!string.IsNullOrWhiteSpace(street))
        {
            var withStreet = await TryStructuredAsync(
                new(street, null, city, province, country, postalCode), null, cancellationToken);
            if (withStreet is not null)
                return withStreet;
        }

        return await TryCityFallbacksAsync(city, province, region, country, postalCode, cancellationToken);
    }

    private async Task<(decimal Latitude, decimal Longitude)?> TryCityFallbacksAsync(
        string city,
        string province,
        string region,
        string country,
        string postalCode,
        CancellationToken cancellationToken)
    {
        foreach (var freeText in new[]
                 {
                     JoinParts(city, province, region, country),
                     JoinParts(city, province, country),
                     JoinParts(city, region, country),
                     JoinParts(city, country),
                 })
        {
            if (string.IsNullOrWhiteSpace(freeText))
                continue;

            var fromText = await TryFreeTextAsync(freeText, null, cancellationToken);
            if (fromText is not null)
                return fromText;
        }

        foreach (var fallback in new[]
                 {
                     new GeocodeQuery(null, null, city, province, country, postalCode),
                     new GeocodeQuery(null, null, city, province, country, null),
                     new GeocodeQuery(null, null, city, null, country, null),
                 })
        {
            if (string.IsNullOrWhiteSpace(fallback.City) && string.IsNullOrWhiteSpace(fallback.Country))
                continue;

            var result = await TryStructuredAsync(fallback, null, cancellationToken);
            if (result is not null)
                return result;
        }

        return null;
    }

    private static IEnumerable<string> BuildBarangayFirstFreeTextQueries(
        string street, string barangay, string city, string province, string country)
    {
        if (!string.IsNullOrWhiteSpace(street))
            yield return JoinParts(street, barangay, city, province, country);

        yield return JoinParts(barangay, city, province, country);
        yield return JoinParts($"Barangay {barangay}", city, province, country);
    }

    private static IEnumerable<GeocodeQuery> BuildBarangayStructuredQueries(
        string street, string barangay, string city, string province, string country, string postalCode)
    {
        if (!string.IsNullOrWhiteSpace(street))
            yield return new(street, barangay, city, province, country, postalCode, BarangayAsNeighbourhood: false);

        yield return new(null, barangay, city, province, country, postalCode, BarangayAsNeighbourhood: false);
        yield return new(null, barangay, city, province, country, postalCode, BarangayAsNeighbourhood: true);
    }

    private static string JoinParts(params string?[] parts) =>
        string.Join(", ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));

    private async Task<(decimal Latitude, decimal Longitude)?> TryFreeTextAsync(
        string query,
        string? barangayFilter,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
            return null;

        var results = await SearchAsync($"q={Uri.EscapeDataString(query)}", cancellationToken);
        return PickResult(results, barangayFilter);
    }

    private async Task<(decimal Latitude, decimal Longitude)?> TryStructuredAsync(
        GeocodeQuery q,
        string? barangayFilter,
        CancellationToken cancellationToken)
    {
        var query = new List<string>();
        if (!string.IsNullOrWhiteSpace(q.Street)) query.Add($"street={Uri.EscapeDataString(q.Street)}");
        if (!string.IsNullOrWhiteSpace(q.Barangay))
        {
            var key = q.BarangayAsNeighbourhood ? "neighbourhood" : "suburb";
            query.Add($"{key}={Uri.EscapeDataString(q.Barangay)}");
        }
        if (!string.IsNullOrWhiteSpace(q.City)) query.Add($"city={Uri.EscapeDataString(q.City)}");
        if (!string.IsNullOrWhiteSpace(q.Province)) query.Add($"state={Uri.EscapeDataString(q.Province)}");
        if (!string.IsNullOrWhiteSpace(q.Country)) query.Add($"country={Uri.EscapeDataString(q.Country)}");
        if (!string.IsNullOrWhiteSpace(q.PostalCode)) query.Add($"postalcode={Uri.EscapeDataString(q.PostalCode)}");

        if (query.Count == 0)
            return null;

        var results = await SearchAsync(string.Join("&", query), cancellationToken);
        return PickResult(results, barangayFilter);
    }

    private async Task<List<NominatimResult>?> SearchAsync(string queryParams, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("Nominatim");
        var url = $"search?{queryParams}&format=json&limit=5&addressdetails=1";
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return null;

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonSerializer.DeserializeAsync<List<NominatimResult>>(stream, JsonOpts, cancellationToken);
    }

    private static (decimal Latitude, decimal Longitude)? PickResult(
        List<NominatimResult>? results,
        string? barangayFilter)
    {
        if (results is null or { Count: 0 })
            return null;

        NominatimResult? chosen;
        if (!string.IsNullOrWhiteSpace(barangayFilter))
        {
            chosen = results.FirstOrDefault(r => ResultMentionsBarangay(r, barangayFilter))
                ?? results[0];
        }
        else
        {
            chosen = results[0];
        }

        if (!decimal.TryParse(chosen.Lat, NumberStyles.Float, CultureInfo.InvariantCulture, out var lat))
            return null;
        if (!decimal.TryParse(chosen.Lon, NumberStyles.Float, CultureInfo.InvariantCulture, out var lon))
            return null;
        return (lat, lon);
    }

    private static bool ResultMentionsBarangay(NominatimResult r, string barangay)
    {
        var normalized = barangay.Trim();
        if (normalized.StartsWith("Barangay ", StringComparison.OrdinalIgnoreCase))
            normalized = normalized[9..].Trim();

        if (r.DisplayName.Contains(normalized, StringComparison.OrdinalIgnoreCase))
            return true;

        var addr = r.Address;
        if (addr is null)
            return false;

        return ContainsIgnoreCase(addr.Suburb, normalized)
            || ContainsIgnoreCase(addr.Neighbourhood, normalized)
            || ContainsIgnoreCase(addr.Village, normalized)
            || ContainsIgnoreCase(addr.CityDistrict, normalized)
            || ContainsIgnoreCase(addr.Quarter, normalized);
    }

    private static bool ContainsIgnoreCase(string? haystack, string needle) =>
        !string.IsNullOrWhiteSpace(haystack) &&
        haystack.Contains(needle, StringComparison.OrdinalIgnoreCase);

    private sealed record GeocodeQuery(
        string? Street,
        string? Barangay,
        string? City,
        string? Province,
        string? Country,
        string? PostalCode,
        bool BarangayAsNeighbourhood = false);

    private sealed class NominatimResult
    {
        public string Lat { get; set; } = "";
        public string Lon { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public NominatimAddress? Address { get; set; }
    }

    public async Task<ReverseGeocodeResult?> ReverseGeocodeAsync(
        decimal latitude,
        decimal longitude,
        CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("Nominatim");
        var lat = latitude.ToString(CultureInfo.InvariantCulture);
        var lon = longitude.ToString(CultureInfo.InvariantCulture);
        var url = $"reverse?lat={lat}&lon={lon}&format=json&addressdetails=1";
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return null;

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var result = await JsonSerializer.DeserializeAsync<NominatimReverseResult>(stream, JsonOpts, cancellationToken);
        if (result?.Address is null)
            return null;

        var a = result.Address;
        var street = JoinStreetLine(a.HouseNumber, a.Road);
        var barangay = FirstNonEmpty(a.Suburb, a.Neighbourhood, a.Village, a.CityDistrict, a.Quarter);
        var city = FirstNonEmpty(a.City, a.Town, a.Municipality);
        var province = FirstNonEmpty(a.State, a.StateDistrict, a.County);
        var region = FirstNonEmpty(a.Region, a.Island);
        var country = a.Country ?? "";

        return new ReverseGeocodeResult(
            street,
            barangay,
            city,
            province,
            region,
            country,
            a.Postcode ?? "",
            latitude,
            longitude,
            result.DisplayName ?? "");
    }

    private static string JoinStreetLine(params string?[] parts) =>
        string.Join(" ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));

    private static string FirstNonEmpty(params string?[] values) =>
        values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v)) ?? "";

    private sealed class NominatimReverseResult
    {
        public string? DisplayName { get; set; }
        public NominatimAddress? Address { get; set; }
    }

    private sealed class NominatimAddress
    {
        public string? HouseNumber { get; set; }
        public string? Road { get; set; }
        public string? Suburb { get; set; }
        public string? Neighbourhood { get; set; }
        public string? Village { get; set; }
        public string? CityDistrict { get; set; }
        public string? Quarter { get; set; }
        public string? City { get; set; }
        public string? Town { get; set; }
        public string? Municipality { get; set; }
        public string? State { get; set; }
        public string? StateDistrict { get; set; }
        public string? County { get; set; }
        public string? Region { get; set; }
        public string? Island { get; set; }
        public string? Country { get; set; }
        public string? Postcode { get; set; }
    }
}
