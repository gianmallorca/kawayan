using System.Text.RegularExpressions;
using kawayan.API.Data;
using kawayan.API.Extensions;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using kawayan.API.Models.Pagination;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Services;

public class ArticlesService(AppDbContext db)
{
    public async Task<IReadOnlyList<ArticleListDto>> GetPublishedAsync(int? limit = null)
    {
        IQueryable<Article> query = db.Articles
            .AsNoTracking()
            .Where(a => a.IsPublished)
            .OrderByDescending(a => a.PublishedAt ?? a.UpdatedAt);

        if (limit is > 0)
            query = query.Take(limit.Value);

        var items = await query.ToListAsync();
        return items.Select(ToListDto).ToList();
    }

    public async Task<ArticleDetailDto?> GetPublishedBySlugAsync(string slug)
    {
        var article = await db.Articles.AsNoTracking()
            .FirstOrDefaultAsync(a => a.IsPublished && a.Slug == slug);
        return article is null ? null : ToDetailDto(article);
    }

    public async Task<PagedResult<ArticleAdminDto>> GetPagedAdminAsync(int page, int pageSize)
    {
        var paged = await db.Articles.AsNoTracking()
            .OrderByDescending(a => a.UpdatedAt)
            .ToPagedResultAsync(page, pageSize);

        return new PagedResult<ArticleAdminDto>
        {
            Items = paged.Items.Select(ToAdminDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
        };
    }

    public async Task<ArticleAdminDto?> GetByIdAsync(int id)
    {
        var article = await db.Articles.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        return article is null ? null : ToAdminDto(article);
    }

    public async Task<ArticleAdminDto> CreateAsync(CreateArticleRequest request)
    {
        var now = DateTime.UtcNow;
        var slug = await EnsureUniqueSlugAsync(NormalizeSlug(request.Slug, request.Title));
        var article = new Article
        {
            Title = request.Title.Trim(),
            Slug = slug,
            Description = request.Description.Trim(),
            Content = request.Content.Trim(),
            ImageUrl = request.ImageUrl,
            ImageDescription = request.ImageDescription?.Trim() ?? string.Empty,
            AuthorFullName = request.FullName?.Trim() ?? string.Empty,
            IsPublished = request.IsPublished,
            PublishedAt = request.IsPublished ? now : null,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Articles.Add(article);
        await db.SaveChangesAsync();
        return ToAdminDto(article);
    }

    public async Task<ArticleAdminDto?> UpdateAsync(int id, UpdateArticleRequest request)
    {
        var article = await db.Articles.FindAsync(id);
        if (article is null) return null;

        var now = DateTime.UtcNow;
        var slug = await EnsureUniqueSlugAsync(NormalizeSlug(request.Slug, request.Title), id);
        var wasPublished = article.IsPublished;

        article.Title = request.Title.Trim();
        article.Slug = slug;
        article.Description = request.Description.Trim();
        article.Content = request.Content.Trim();
        article.ImageUrl = request.ImageUrl;
        article.ImageDescription = request.ImageDescription?.Trim() ?? string.Empty;
        article.AuthorFullName = request.FullName?.Trim() ?? string.Empty;
        article.IsPublished = request.IsPublished;
        article.UpdatedAt = now;

        if (request.IsPublished && article.PublishedAt is null)
            article.PublishedAt = now;
        else if (!request.IsPublished)
            article.PublishedAt = null;

        _ = wasPublished;
        await db.SaveChangesAsync();
        return ToAdminDto(article);
    }

    public async Task<ArticleAdminDto?> SetImageAsync(int id, string imageUrl)
    {
        var article = await db.Articles.FindAsync(id);
        if (article is null) return null;
        article.ImageUrl = imageUrl;
        article.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToAdminDto(article);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var article = await db.Articles.FindAsync(id);
        if (article is null) return false;
        db.Articles.Remove(article);
        await db.SaveChangesAsync();
        return true;
    }

    private async Task<string> EnsureUniqueSlugAsync(string slug, int? excludeId = null)
    {
        var candidate = slug;
        var n = 1;
        while (await db.Articles.AnyAsync(a =>
                   a.Slug == candidate && (excludeId == null || a.Id != excludeId)))
        {
            candidate = $"{slug}-{n++}";
        }
        return candidate;
    }

    private static string NormalizeSlug(string? slug, string title)
    {
        var raw = (string.IsNullOrWhiteSpace(slug) ? title : slug).Trim().ToLowerInvariant();
        var cleaned = Regex.Replace(raw, @"[^a-z0-9\s-]", "");
        var normalized = Regex.Replace(cleaned, @"\s+", "-");
        normalized = Regex.Replace(normalized, @"-+", "-").Trim('-');
        return string.IsNullOrEmpty(normalized) ? "article" : normalized;
    }

    private static ArticleListDto ToListDto(Article a) =>
        new(a.Id, a.Title, a.Slug, a.Description, a.ImageUrl, a.AuthorFullName, a.PublishedAt);

    private static ArticleDetailDto ToDetailDto(Article a) =>
        new(a.Id, a.Title, a.Slug, a.Description, a.Content, a.ImageUrl, a.ImageDescription, a.AuthorFullName, a.PublishedAt);

    private static ArticleAdminDto ToAdminDto(Article a) =>
        new(a.Id, a.Title, a.Slug, a.Description, a.Content, a.ImageUrl, a.ImageDescription, a.AuthorFullName, a.IsPublished, a.PublishedAt, a.CreatedAt, a.UpdatedAt);
}
