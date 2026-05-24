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
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var result = await mediaService.UploadAsync(file);
        return result is null ? BadRequest() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await mediaService.DeleteAsync(id) ? NoContent() : NotFound();
}
