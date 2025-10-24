using Domain.Enums;

namespace Application.DTOs;

public record LeadDetailDto(
    int Id,
    string Name,
    string Email,
    LeadStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IEnumerable<TaskDto> Tasks
);