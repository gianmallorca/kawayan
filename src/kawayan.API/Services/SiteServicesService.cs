using kawayan.API.Data;
using kawayan.API.Extensions;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using kawayan.API.Models.Pagination;
using Microsoft.EntityFrameworkCore;



namespace kawayan.API.Services;



public class SiteServicesService(AppDbContext db)

{

    public async Task<IReadOnlyList<ServiceItemDto>> GetAllAsync()
        => (await db.Services.OrderBy(s => s.Id).ToListAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<ServiceItemDto>> SearchAsync(ServiceSearchRequest request)
    {
        var query = db.Services.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(s =>
                s.Title.ToLower().Contains(term) ||
                s.Description.ToLower().Contains(term));
        }

        var paged = await query
            .OrderBy(s => s.Title)
            .ToPagedResultAsync(request.Page, request.PageSize);

        return new PagedResult<ServiceItemDto>
        {
            Items = paged.Items.Select(ToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
        };
    }



    public async Task<ServiceItemDto?> GetByIdAsync(int id)

    {

        var item = await db.Services.FindAsync(id);

        return item is null ? null : ToDto(item);

    }



    public async Task<ServiceItemDto> CreateAsync(CreateServiceRequest request)

    {

        var item = new ServiceItem

        {

            Title = request.Title,

            Description = request.Description,
            Price = request.Price,

            IconUrl = request.IconUrl,

            ImageUrl = request.ImageUrl,

        };

        db.Services.Add(item);

        await db.SaveChangesAsync();

        return ToDto(item);

    }



    public async Task<ServiceItemDto?> UpdateAsync(int id, UpdateServiceRequest request)

    {

        var item = await db.Services.FindAsync(id);

        if (item is null) return null;



        item.Title = request.Title;

        item.Description = request.Description;
        item.Price = request.Price;

        item.IconUrl = request.IconUrl;

        item.ImageUrl = request.ImageUrl;

        await db.SaveChangesAsync();

        return ToDto(item);

    }



    public async Task<ServiceItemDto?> SetImageAsync(int id, string imageUrl)

    {

        var item = await db.Services.FindAsync(id);

        if (item is null) return null;

        item.ImageUrl = imageUrl;

        await db.SaveChangesAsync();

        return ToDto(item);

    }



    public async Task<bool> DeleteAsync(int id)

    {

        var item = await db.Services.FindAsync(id);

        if (item is null) return false;

        db.Services.Remove(item);

        await db.SaveChangesAsync();

        return true;

    }



    private static ServiceItemDto ToDto(ServiceItem s) =>

        new(s.Id, s.Title, s.Description, s.Price, s.IconUrl, s.ImageUrl);

}

