using Domain.Enums;

namespace Application.DTOs;

public record LeadCreateDto(string Name, string Email, LeadStatus? Status);
public record LeadUpdateDto(string Name, string Email, LeadStatus Status);
public record LeadDto(int Id, string Name, string Email, LeadStatus Status, DateTime CreatedAt, DateTime UpdatedAt, int TasksCount);

public record LeadListDto(
    int Id,
    string Name,
    string Email,
    LeadStatus Status,
    DateTime CreatedAt,
    int TasksCount
);

public record TaskCreateDto(string Title, DateTime? DueDate, TaskItemStatus? Status);
public record TaskUpdateDto(string Title, DateTime? DueDate, TaskItemStatus Status);
public record TaskDto(int Id, int LeadId, string Title, DateTime? DueDate, TaskItemStatus Status, DateTime CreatedAt, DateTime UpdatedAt);