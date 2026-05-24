using kawayan.API.Models.DTOs;
using kawayan.API.Models.Pagination;
using kawayan.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kawayan.API.Controllers;

[ApiController]
public class ArticlesController(ArticlesService articlesService, MediaService mediaService) : ControllerBase
{
    [HttpGet("api/articles")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ArticleListDto>>> GetPublished([FromQuery] int? limit)
        => Ok(await articlesService.GetPublishedAsync(limit));

    [HttpGet("api/articles/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ArticleDetailDto>> GetPublishedBySlug(string slug)
    {
        var article = await articlesService.GetPublishedBySlugAsync(slug);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpGet("api/admin/articles")]
    [Authorize]
    public async Task<ActionResult<PagedResult<ArticleAdminDto>>> GetAll([FromQuery] PagedRequest request)
        => Ok(await articlesService.GetPagedAdminAsync(request.Page, request.PageSize));

    [HttpGet("api/admin/articles/{id:int}")]
    [Authorize]
    public async Task<ActionResult<ArticleAdminDto>> GetById(int id)
    {
        var article = await articlesService.GetByIdAsync(id);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpPost("api/admin/articles")]
    [Authorize]
    public async Task<ActionResult<ArticleAdminDto>> Create([FromBody] CreateArticleRequest request)
        => Ok(await articlesService.CreateAsync(request));

    [HttpPut("api/admin/articles/{id:int}")]
    [Authorize]
    public async Task<ActionResult<ArticleAdminDto>> Update(int id, [FromBody] UpdateArticleRequest request)
    {
        var article = await articlesService.UpdateAsync(id, request);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpDelete("api/admin/articles/{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
        => await articlesService.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("api/admin/articles/{id:int}/image")]
    [Authorize]
    public async Task<ActionResult<ArticleImageUploadResponse>> UploadImage(int id, [FromForm] IFormFile? image, [FromForm] IFormFile? file)
    {
        var upload = image ?? file;
        if (upload is null) return BadRequest(new { error = "No file was uploaded." });

        var article = await articlesService.GetByIdAsync(id);
        if (article is null) return NotFound();

        try
        {
            var result = await mediaService.UploadImageAsync(upload, $"article-{id}", UploadLimits.MaxImageBytes, trackInMediaLibrary: true);
            if (result is null) return BadRequest(new { error = "Upload failed." });

            var updated = await articlesService.SetImageAsync(id, result.Url);
            await mediaService.TryDeleteFileIfUnusedAsync(article.ImageUrl);
            return Ok(new ArticleImageUploadResponse(id, updated!.ImageUrl!));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
