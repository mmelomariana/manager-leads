using Application.DTOs;

namespace Application.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetTasksByLeadIdAsync(int leadId);
    Task<TaskDto?> GetTaskByIdAsync(int id);
    Task<TaskDto> CreateTaskAsync(int leadId, TaskCreateDto taskDto);
    Task UpdateTaskAsync(int leadId, int taskId, TaskUpdateDto taskDto);
    Task DeleteTaskAsync(int leadId, int taskId);
    Task<bool> TaskExistsAsync(int id);
}