using System.ComponentModel.DataAnnotations;
using Domain.Enums;

namespace Domain.Entities;

public class Lead
{
    public int Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    public LeadStatus Status { get; set; } = LeadStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // SOFT DELETE PROPERTIES
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    // Relacionamento com User
    public int UserId { get; set; }
    public User? User { get; set; }

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}