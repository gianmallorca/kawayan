using kawayan.API.Data;
using kawayan.API.Extensions;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using kawayan.API.Models.Pagination;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Services;

public class InquiriesService(AppDbContext db)
{
    public async Task<IReadOnlyList<InquiryDto>> GetAllAsync()
        => (await db.Inquiries.OrderByDescending(i => i.CreatedAt).ToListAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<InquiryDto>> SearchAsync(InquirySearchRequest request)
    {
        var query = db.Inquiries.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Subject))
        {
            var subject = request.Subject.Trim();
            query = query.Where(i => i.Subject == subject);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(i =>
                i.SenderName.ToLower().Contains(term) ||
                i.SenderEmail.ToLower().Contains(term) ||
                i.Phone.ToLower().Contains(term) ||
                i.Subject.ToLower().Contains(term) ||
                i.Message.ToLower().Contains(term));
        }

        var paged = await query
            .OrderByDescending(i => i.CreatedAt)
            .ToPagedResultAsync(request.Page, request.PageSize);

        return new PagedResult<InquiryDto>
        {
            Items = paged.Items.Select(ToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
        };
    }

    public async Task<InquiryDto?> GetByIdAsync(int id)
    {
        var item = await db.Inquiries.FindAsync(id);
        return item is null ? null : ToDto(item);
    }

    public async Task<InquiryDto> CreateAsync(CreateInquiryRequest request)
    {
        var item = new Inquiry
        {
            SenderName = request.SenderName.Trim(),
            SenderEmail = request.SenderEmail.Trim(),
            Phone = request.Phone?.Trim() ?? string.Empty,
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.Inquiries.Add(item);
        await db.SaveChangesAsync();
        return ToDto(item);
    }

    public async Task<InquiryDto?> MarkReadAsync(int id)
    {
        var item = await db.Inquiries.FindAsync(id);
        if (item is null) return null;
        if (!item.IsRead)
        {
            item.IsRead = true;
            await db.SaveChangesAsync();
        }
        return ToDto(item);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await db.Inquiries.FindAsync(id);
        if (item is null) return false;
        db.Inquiries.Remove(item);
        await db.SaveChangesAsync();
        return true;
    }

    private static InquiryDto ToDto(Inquiry i) =>
        new(i.Id, i.SenderName, i.SenderEmail, i.Phone, i.Subject, i.Message, i.IsRead, i.CreatedAt);
}
