using kawayan.API.Models.DTOs;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
public class LegalPagesController(LegalPagesService legalPagesService) : ControllerBase
{
    [HttpGet("api/legal/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<LegalPagePublicDto>> GetPublished(string slug)
    {
        var page = await legalPagesService.GetPublishedBySlugAsync(slug);
        return page is null ? NotFound() : Ok(page);
    }

    [HttpGet("api/admin/legal")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<LegalPageAdminDto>>> GetAll()
        => Ok(await legalPagesService.GetAllAdminAsync());

    [HttpGet("api/admin/legal/{id:int}")]
    [Authorize]
    public async Task<ActionResult<LegalPageAdminDto>> GetById(int id)
    {
        var page = await legalPagesService.GetByIdAsync(id);
        return page is null ? NotFound() : Ok(page);
    }

    [HttpPut("api/admin/legal/{id:int}")]
    [Authorize]
    public async Task<ActionResult<LegalPageAdminDto>> Update(int id, [FromBody] UpdateLegalPageRequest request)
    {
        var page = await legalPagesService.UpdateAsync(id, request);
        return page is null ? NotFound() : Ok(page);
    }
}
