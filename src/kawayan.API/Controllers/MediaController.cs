using kawayan.API.Models.Pagination;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
[Route("api/admin/media")]
[Authorize]
public class MediaController(MediaService mediaService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
        => Ok(await mediaService.GetPagedAsync(request.Page, request.PageSize));

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file was uploaded." });

        try
        {
            var result = await mediaService.UploadAsync(file);
            return result is null
                ? BadRequest(new { error = "Upload failed." })
                : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await mediaService.DeleteAsync(id) ? NoContent() : NotFound();
}
