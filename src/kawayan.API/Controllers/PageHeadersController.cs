using System.Text.Json;
using kawayan.API.Models.DTOs;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
[Authorize]
public class PageHeadersController(
    ContentService contentService,
    CompanyDetailsService companyService,
    MediaService mediaService) : ControllerBase
{
    private static readonly HashSet<string> ValidPages = ["home", "about", "services", "contact"];

    [HttpPost("api/admin/pages/{pageKey}/header-image")]
    public async Task<ActionResult<PageHeaderUploadResponse>> UploadHeader(string pageKey, [FromForm] IFormFile? image, [FromForm] IFormFile? file)
    {
        if (!ValidPages.Contains(pageKey))
            return BadRequest(new { error = "Unknown page." });

        var upload = image ?? file;
        if (upload is null) return BadRequest(new { error = "No file was uploaded." });

        try
        {
            var existing = await contentService.GetSectionJsonAsync(pageKey, "hero_bg");
            string? oldUrl = null;
            if (!string.IsNullOrEmpty(existing))
            {
                try
                {
                    var doc = JsonDocument.Parse(existing);
                    if (doc.RootElement.TryGetProperty("imageUrl", out var prop))
                        oldUrl = prop.GetString();
                }
                catch { /* ignore */ }
            }

            var result = await mediaService.UploadImageAsync(upload, $"{pageKey}-header", UploadLimits.MaxImageBytes, trackInMediaLibrary: true);
            if (result is null) return BadRequest(new { error = "Upload failed." });

            var json = JsonSerializer.Serialize(new { imageUrl = result.Url });
            await contentService.UpsertAsync(pageKey, "hero_bg", json);

            if (pageKey == "home") await companyService.SetImageAsync("cover", result.Url);
            if (pageKey == "about") await companyService.SetImageAsync("about", result.Url);

            await mediaService.TryDeleteFileIfUnusedAsync(oldUrl);
            return Ok(new PageHeaderUploadResponse(pageKey, result.Url));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
