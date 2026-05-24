using kawayan.API.Models.DTOs;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
public class HomeContentController(ContentService contentService) : ControllerBase
{
    [HttpGet("api/content/{page}")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PageSectionDto>>> GetPage(string page)
        => Ok(await contentService.GetByPageAsync(page));

    [HttpGet("api/admin/content")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<PageSectionDto>>> GetAll()
        => Ok(await contentService.GetAllAsync());

    [HttpPut("api/admin/content/{page}/{sectionKey}")]
    [Authorize]
    public async Task<ActionResult<PageSectionDto>> Upsert(string page, string sectionKey, [FromBody] UpsertPageSectionRequest request)
        => Ok(await contentService.UpsertAsync(page, sectionKey, request.ContentJson));
}
