namespace kawayan.API.Models.DTOs;

public record LegalPagePublicDto(string Slug, string Title, string Body, DateOnly? LastRevised);

public record LegalPageAdminDto(
    int Id,
    string Slug,
    string Title,
    string Body,
    DateOnly? LastRevised,
    bool IsPublished,
    DateTime UpdatedAt);

public record UpdateLegalPageRequest(
    string Title,
    string Body,
    DateOnly? LastRevised,
    bool IsPublished);
