using kawayan.API.Models.Pagination;

namespace kawayan.API.Models.DTOs;

public class InquirySearchRequest : PagedRequest
{
    public string? Search { get; set; }
    public string? Subject { get; set; }
}
