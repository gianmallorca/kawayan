using System.Text.Json;
using kawayan.API.Data;
using kawayan.API.Extensions;
using kawayan.API.Models.DTOs;
using kawayan.API.Models.Entities;
using kawayan.API.Models.Pagination;
using Microsoft.EntityFrameworkCore;

using kawayan.API;

namespace kawayan.API.Services;

public class MediaService(AppDbContext db, IWebHostEnvironment env, R2StorageService r2)
{
    private static readonly HashSet<string> ImageMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"
    };

    public async Task<IReadOnlyList<MediaFileDto>> GetAllAsync()
        => (await db.MediaFiles.OrderByDescending(m => m.UploadedAt).ToListAsync())
            .Select(m => new MediaFileDto(m.Id, m.FileName, m.Url, m.UploadedAt)).ToList();

    public async Task<PagedResult<MediaFileDto>> GetPagedAsync(int page, int pageSize)
    {
        var paged = await db.MediaFiles.AsNoTracking()
            .OrderByDescending(m => m.UploadedAt)
            .ToPagedResultAsync(page, pageSize);

        return new PagedResult<MediaFileDto>
        {
            Items = paged.Items.Select(m => new MediaFileDto(m.Id, m.FileName, m.Url, m.UploadedAt)).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
        };
    }

    public async Task<MediaFileDto?> UploadAsync(IFormFile file)
    {
        var result = await UploadImageAsync(file, "media", UploadLimits.MaxImageBytes, allowSvg: false, trackInMediaLibrary: true);
        if (result is null) return null;
        var media = await db.MediaFiles.FirstOrDefaultAsync(m => m.Url == result.Url);
        return media is null ? null : new MediaFileDto(media.Id, media.FileName, media.Url, media.UploadedAt);
    }

    public async Task<UploadImageResult?> UploadImageAsync(
        IFormFile file,
        string typePrefix,
        long maxBytes,
        bool allowSvg = false,
        bool trackInMediaLibrary = false)
    {
        if (!ValidateImageFile(file, maxBytes, allowSvg, out var error))
            throw new InvalidOperationException(error);

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext)) ext = ".jpg";
        var storedName = $"{SanitizePrefix(typePrefix)}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{ext.ToLowerInvariant()}";

        string url;
        if (r2.IsConfigured)
        {
            url = await r2.UploadFileAsync(file, storedName);
        }
        else
        {
            var uploadsDir = GetUploadsDir();
            Directory.CreateDirectory(uploadsDir);
            var path = Path.Combine(uploadsDir, storedName);
            await using (var stream = File.Create(path))
                await file.CopyToAsync(stream);
            url = $"/uploads/{storedName}";
        }

        if (trackInMediaLibrary)
        {
            var media = new MediaFile { FileName = file.FileName, Url = url };
            db.MediaFiles.Add(media);
            await db.SaveChangesAsync();
        }

        return new UploadImageResult(url, storedName);
    }

    public static bool ValidateImageFile(IFormFile file, long maxBytes, bool allowSvg, out string error)
    {
        error = string.Empty;
        if (file.Length == 0)
        {
            error = "No file was uploaded.";
            return false;
        }
        if (file.Length > maxBytes)
        {
            error = $"File is too large. Maximum size is {maxBytes / (1024 * 1024)}MB.";
            return false;
        }
        var contentType = file.ContentType ?? string.Empty;
        if (!ImageMimeTypes.Contains(contentType))
        {
            error = "Only image files are allowed (JPG, PNG, WebP, GIF" + (allowSvg ? ", SVG" : "") + ").";
            return false;
        }
        if (!allowSvg && contentType.Equals("image/svg+xml", StringComparison.OrdinalIgnoreCase))
        {
            error = "SVG is only allowed for the company logo.";
            return false;
        }
        return true;
    }

    public async Task TryDeleteFileIfUnusedAsync(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return;
        if (!url.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase) && !r2.IsR2Url(url))
            return;

        if (await IsUrlReferencedAsync(url)) return;

        if (r2.IsR2Url(url))
            await r2.DeleteFileAsync(r2.GetKeyFromUrl(url));
        else
        {
            var physicalPath = GetPhysicalPath(url);
            if (File.Exists(physicalPath)) File.Delete(physicalPath);
        }

        var media = await db.MediaFiles.FirstOrDefaultAsync(m => m.Url == url);
        if (media is not null)
        {
            db.MediaFiles.Remove(media);
            await db.SaveChangesAsync();
        }
    }

    private async Task<bool> IsUrlReferencedAsync(string url)
    {
        var company = await db.CompanyDetails.FindAsync(1);
        if (company is not null && (company.LogoUrl == url || company.CoverImageUrl == url || company.AboutImageUrl == url))
            return true;

        if (await db.Services.AnyAsync(s => s.ImageUrl == url)) return true;

        var sections = await db.PageSections.AsNoTracking().Select(s => s.ContentJson).ToListAsync();
        if (sections.Any(j => j.Contains(url, StringComparison.Ordinal))) return true;

        return await db.MediaFiles.AnyAsync(m => m.Url == url);
    }

    private static string SanitizePrefix(string prefix) =>
        new string(prefix.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray()).ToLowerInvariant();

    private string GetUploadsDir() => Path.Combine(env.WebRootPath ?? "wwwroot", "uploads");

    private string GetPhysicalPath(string url) =>
        Path.Combine(env.WebRootPath ?? "wwwroot", url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

    public async Task<bool> DeleteAsync(int id)
    {
        var media = await db.MediaFiles.FindAsync(id);
        if (media is null) return false;

        await TryDeleteFileIfUnusedAsync(media.Url);
        if (await db.MediaFiles.FindAsync(id) is { } stillThere)
        {
            db.MediaFiles.Remove(stillThere);
            await db.SaveChangesAsync();
        }
        return true;
    }
}

public record UploadImageResult(string Url, string StoredFileName);
