using kawayan.API.Data;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Services;

public class LegalPagesService(AppDbContext db, CompanyDetailsService companyDetailsService)
{
    public async Task<LegalPagePublicDto?> GetPublishedBySlugAsync(string slug)
    {
        var page = await db.LegalPages.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);
        if (page is null) return null;

        var company = await companyDetailsService.GetAsync();
        var companyName = company.NameMain.Trim();
        if (string.IsNullOrEmpty(companyName)) companyName = "Our Company";
        return ToPublicDto(page, companyName);
    }

    public async Task<IReadOnlyList<LegalPageAdminDto>> GetAllAdminAsync()
    {
        var items = await db.LegalPages.AsNoTracking()
            .OrderBy(p => p.Id)
            .ToListAsync();
        return items.Select(ToAdminDto).ToList();
    }

    public async Task<LegalPageAdminDto?> GetByIdAsync(int id)
    {
        var page = await db.LegalPages.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return page is null ? null : ToAdminDto(page);
    }

    public async Task<LegalPageAdminDto?> UpdateAsync(int id, UpdateLegalPageRequest request)
    {
        var page = await db.LegalPages.FindAsync(id);
        if (page is null) return null;

        page.Title = request.Title.Trim();
        page.Body = request.Body.Trim();
        page.LastRevised = request.LastRevised ?? DateOnly.FromDateTime(DateTime.UtcNow);
        page.IsPublished = request.IsPublished;
        page.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToAdminDto(page);
    }

    private static LegalPagePublicDto ToPublicDto(LegalPage page, string companyName) =>
        new(
            page.Slug,
            page.Title,
            ReplaceCompanyToken(page.Body, companyName),
            page.LastRevised);

    private static LegalPageAdminDto ToAdminDto(LegalPage page) =>
        new(page.Id, page.Slug, page.Title, page.Body, page.LastRevised, page.IsPublished, page.UpdatedAt);

    private static string ReplaceCompanyToken(string body, string companyName) =>
        body.Replace("{{company_name}}", companyName, StringComparison.OrdinalIgnoreCase);
}
