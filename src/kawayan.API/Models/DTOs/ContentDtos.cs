namespace kawayan.API.Models.DTOs;

public record PageSectionDto(string Page, string SectionKey, string ContentJson, DateTime UpdatedAt);
public record UpsertPageSectionRequest(string ContentJson);
