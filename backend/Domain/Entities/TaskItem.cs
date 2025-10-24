using System.ComponentModel.DataAnnotations;
using Domain.Enums;

namespace Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }
    
    public int LeadId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;
    
    public DateTime? DueDate { get; set; }

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    public Lead? Lead { get; set; }
}