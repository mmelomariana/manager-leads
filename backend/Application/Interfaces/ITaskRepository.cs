using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces;

public interface ITaskRepository
{
    Task<IEnumerable<TaskItem>> GetByLeadIdAsync(int leadId);
    Task<TaskItem?> GetByIdAsync(int id);
    Task<TaskItem> AddAsync(TaskItem task);
    Task UpdateAsync(TaskItem task);
    Task DeleteAsync(TaskItem task);
    Task<bool> ExistsAsync(int id);

    Task<IEnumerable<TaskItem>> GetAllWithDeletedAsync();
    Task<TaskItem?> GetByIdWithDeletedAsync(int id);
    Task RestoreAsync(TaskItem task);
}