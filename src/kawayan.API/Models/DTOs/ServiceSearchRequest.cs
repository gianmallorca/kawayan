using kawayan.API.Models.Pagination;

namespace kawayan.API.Models.DTOs;

public class ServiceSearchRequest : PagedRequest
{
    public string? Search { get; set; }
}
