namespace kawayan.API.Models.DTOs;

public record ArticleListDto(
    int Id,
    string Title,
    string Slug,
    string Description,
    string? ImageUrl,
    string FullName,
    DateTime? PublishedAt);

public record ArticleDetailDto(
    int Id,
    string Title,
    string Slug,
    string Description,
    string Content,
    string? ImageUrl,
    string ImageDescription,
    string FullName,
    DateTime? PublishedAt);

public record ArticleAdminDto(
    int Id,
    string Title,
    string Slug,
    string Description,
    string Content,
    string? ImageUrl,
    string ImageDescription,
    string FullName,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateArticleRequest(
    string Title,
    string Slug,
    string Description,
    string Content,
    string? ImageUrl,
    string? ImageDescription,
    string? FullName,
    bool IsPublished);

public record UpdateArticleRequest(
    string Title,
    string Slug,
    string Description,
    string Content,
    string? ImageUrl,
    string? ImageDescription,
    string? FullName,
    bool IsPublished);

public record ArticleImageUploadResponse(int ArticleId, string ImageUrl);
