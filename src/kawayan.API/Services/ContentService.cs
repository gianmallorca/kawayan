using kawayan.API.Data;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Services;

public class ContentService(AppDbContext db)
{
    public async Task<IReadOnlyList<PageSectionDto>> GetByPageAsync(string page)
    {
        var sections = await db.PageSections
            .Where(s => s.Page == page)
            .OrderBy(s => s.SectionKey)
            .ToListAsync();
        return sections.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<PageSectionDto>> GetAllAsync()
        => (await db.PageSections.OrderBy(s => s.Page).ThenBy(s => s.SectionKey).ToListAsync())
            .Select(ToDto).ToList();

    public async Task<string?> GetSectionJsonAsync(string page, string sectionKey)
    {
        var section = await db.PageSections
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Page == page && s.SectionKey == sectionKey);
        return section?.ContentJson;
    }

    public async Task<PageSectionDto> UpsertAsync(string page, string sectionKey, string contentJson)
    {
        var section = await db.PageSections
            .FirstOrDefaultAsync(s => s.Page == page && s.SectionKey == sectionKey);

        if (section is null)
        {
            section = new PageSection { Page = page, SectionKey = sectionKey };
            db.PageSections.Add(section);
        }

        section.ContentJson = contentJson;
        section.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToDto(section);
    }

    private static PageSectionDto ToDto(PageSection s) =>
        new(s.Page, s.SectionKey, s.ContentJson, s.UpdatedAt);
}
