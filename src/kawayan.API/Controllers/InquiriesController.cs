using kawayan.API.Models.DTOs;
using kawayan.API.Models.Pagination;
using kawayan.API.Security;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
public class InquiriesController(InquiriesService inquiriesService) : ControllerBase
{
    [HttpPost("api/inquiries")]
    [AllowAnonymous]
    public async Task<ActionResult<InquiryDto>> Submit([FromBody] CreateInquiryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SenderName))
            return BadRequest(new { error = "Name is required." });
        if (string.IsNullOrWhiteSpace(request.SenderEmail))
            return BadRequest(new { error = "Email is required." });
        if (string.IsNullOrWhiteSpace(request.Subject))
            return BadRequest(new { error = "Subject is required." });
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message is required." });

        var created = await inquiriesService.CreateAsync(request);
        return Ok(created);
    }

    [HttpGet("api/admin/inquiries")]
    [Authorize(Policy = Permissions.ContentManage)]
    public async Task<ActionResult<PagedResult<InquiryDto>>> GetAll([FromQuery] InquirySearchRequest request)
        => Ok(await inquiriesService.SearchAsync(request));

    [HttpPost("api/admin/inquiries/{id:int}/read")]
    [Authorize(Policy = Permissions.ContentManage)]
    public async Task<ActionResult<InquiryDto>> MarkRead(int id)
    {
        var item = await inquiriesService.MarkReadAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("api/admin/inquiries/{id:int}")]
    [Authorize(Policy = Permissions.ContentManage)]
    public async Task<IActionResult> Delete(int id)
        => await inquiriesService.DeleteAsync(id) ? NoContent() : NotFound();
}
