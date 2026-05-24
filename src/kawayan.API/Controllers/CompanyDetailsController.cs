using kawayan.API.Models.DTOs;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
public class CompanyDetailsController(
    CompanyDetailsService companyService,
    GeocodingService geocodingService,
    MediaService mediaService) : ControllerBase
{
    [HttpGet("api/company")]
    [AllowAnonymous]
    public async Task<ActionResult<CompanyDetailsDto>> GetPublic()
        => Ok(await companyService.GetAsync());

    [HttpGet("api/admin/company")]
    [Authorize]
    public async Task<ActionResult<CompanyDetailsDto>> GetAdmin()
        => Ok(await companyService.GetAsync());

    [HttpPut("api/admin/company")]
    [Authorize]
    public async Task<ActionResult<UpdateCompanyDetailsResponse>> Update([FromBody] UpdateCompanyDetailsRequest request)
        => Ok(await companyService.UpdateAsync(request));

    [HttpGet("api/admin/company/reverse-geocode")]
    [Authorize]
    public async Task<ActionResult<ReverseGeocodeResult>> ReverseGeocode(
        [FromQuery] decimal latitude,
        [FromQuery] decimal longitude)
    {
        var result = await geocodingService.ReverseGeocodeAsync(latitude, longitude);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("api/admin/company/geocode-preview")]
    [Authorize]
    public async Task<ActionResult<GeocodePreviewDto>> GeocodePreview(
        [FromQuery] string? street,
        [FromQuery] string? barangay,
        [FromQuery] string? city,
        [FromQuery] string? province,
        [FromQuery] string? region,
        [FromQuery] string? country,
        [FromQuery] string? postalCode)
    {
        var coords = await geocodingService.GeocodeAsync(
            street ?? "", barangay ?? "", city ?? "", province ?? "", region ?? "", country ?? "", postalCode ?? "");
        return coords is { } c
            ? Ok(new GeocodePreviewDto(c.Latitude, c.Longitude))
            : NotFound();
    }

    [HttpPost("api/admin/company/logo")]
    [Authorize]
    public async Task<ActionResult<LogoUploadResponse>> UploadLogo([FromForm] IFormFile? logo, [FromForm] IFormFile? file)
    {
        var upload = logo ?? file;
        if (upload is null) return BadRequest(new { error = "No file was uploaded." });

        try
        {
            var before = await companyService.GetAsync();
            var result = await mediaService.UploadImageAsync(upload, "logo", UploadLimits.MaxImageBytes, allowSvg: true, trackInMediaLibrary: true);
            if (result is null) return BadRequest(new { error = "Upload failed." });

            await companyService.SetImageAsync("logo", result.Url);
            await mediaService.TryDeleteFileIfUnusedAsync(before.LogoUrl);
            return Ok(new LogoUploadResponse(result.Url));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("api/admin/company/cover")]
    [Authorize]
    public async Task<ActionResult<CompanyDetailsDto>> UploadCover(IFormFile file)
        => await UploadLegacyImage(file, "cover", UploadLimits.MaxImageBytes);

    [HttpPost("api/admin/company/about-image")]
    [Authorize]
    public async Task<ActionResult<CompanyDetailsDto>> UploadAboutImage(IFormFile file)
        => await UploadLegacyImage(file, "about", UploadLimits.MaxImageBytes);

    private async Task<ActionResult<CompanyDetailsDto>> UploadLegacyImage(IFormFile file, string field, long maxBytes)
    {
        try
        {
            var before = await companyService.GetAsync();
            var oldUrl = field switch
            {
                "cover" => before.CoverImageUrl,
                "about" => before.AboutImageUrl,
                _ => null
            };
            var result = await mediaService.UploadImageAsync(file, field, maxBytes, trackInMediaLibrary: true);
            if (result is null) return BadRequest();
            var updated = await companyService.SetImageAsync(field, result.Url);
            await mediaService.TryDeleteFileIfUnusedAsync(oldUrl);
            return updated is null ? BadRequest() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
