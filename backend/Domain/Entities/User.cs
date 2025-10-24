using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class User
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relacionamento: Um User pode ter múltiplos Leads
    public ICollection<Lead> Leads { get; set; } = new List<Lead>();
}