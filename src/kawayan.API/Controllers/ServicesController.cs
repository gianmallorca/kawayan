using kawayan.API.Models.DTOs;
using kawayan.API.Models.Pagination;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
public class ServicesController(SiteServicesService servicesService, MediaService mediaService) : ControllerBase
{
    [HttpGet("api/services")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ServiceItemDto>>> GetPublic()
        => Ok(await servicesService.GetAllAsync());

    [HttpGet("api/admin/services")]
    [Authorize]
    public async Task<ActionResult<PagedResult<ServiceItemDto>>> GetAll([FromQuery] ServiceSearchRequest request)
        => Ok(await servicesService.SearchAsync(request));

    [HttpGet("api/admin/services/{id:int}")]
    [Authorize]
    public async Task<ActionResult<ServiceItemDto>> GetById(int id)
    {
        var item = await servicesService.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("api/admin/services")]
    [Authorize]
    public async Task<ActionResult<ServiceItemDto>> Create([FromBody] CreateServiceRequest request)
        => Ok(await servicesService.CreateAsync(request));

    [HttpPut("api/admin/services/{id:int}")]
    [Authorize]
    public async Task<ActionResult<ServiceItemDto>> Update(int id, [FromBody] UpdateServiceRequest request)
    {
        var item = await servicesService.UpdateAsync(id, request);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("api/admin/services/{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
        => await servicesService.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("api/admin/services/{id:int}/image")]
    [Authorize]
    public async Task<ActionResult<ServiceImageUploadResponse>> UploadImage(int id, [FromForm] IFormFile? image, [FromForm] IFormFile? file)
    {
        var upload = image ?? file;
        if (upload is null) return BadRequest(new { error = "No file was uploaded." });

        var service = await servicesService.GetByIdAsync(id);
        if (service is null) return NotFound();

        try
        {
            var result = await mediaService.UploadImageAsync(upload, $"service-{id}", UploadLimits.MaxImageBytes, trackInMediaLibrary: true);
            if (result is null) return BadRequest(new { error = "Upload failed." });

            var updated = await servicesService.SetImageAsync(id, result.Url);
            await mediaService.TryDeleteFileIfUnusedAsync(service.ImageUrl);
            return Ok(new ServiceImageUploadResponse(id, updated!.ImageUrl!));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
