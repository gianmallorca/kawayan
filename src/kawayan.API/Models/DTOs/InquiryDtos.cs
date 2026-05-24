namespace kawayan.API.Models.DTOs;

public record InquiryDto(
    int Id,
    string SenderName,
    string SenderEmail,
    string Phone,
    string Subject,
    string Message,
    bool IsRead,
    DateTime CreatedAt);

public record CreateInquiryRequest(
    string SenderName,
    string SenderEmail,
    string? Phone,
    string Subject,
    string Message);
