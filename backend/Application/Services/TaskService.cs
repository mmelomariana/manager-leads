using Application.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ILeadRepository _leadRepository;

    public TaskService(ITaskRepository taskRepository, ILeadRepository leadRepository)
    {
        _taskRepository = taskRepository;
        _leadRepository = leadRepository;
    }

    public async Task<IEnumerable<TaskDto>> GetTasksByLeadIdAsync(int leadId)
    {
        var tasks = await _taskRepository.GetByLeadIdAsync(leadId);

        return tasks.Select(t => new TaskDto(
            t.Id,
            t.LeadId,
            t.Title,
            t.DueDate,
            t.Status,
            t.CreatedAt,
            t.UpdatedAt
        ));
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null) return null;

        return new TaskDto(
            task.Id,
            task.LeadId,
            task.Title,
            task.DueDate,
            task.Status,
            task.CreatedAt,
            task.UpdatedAt
        );
    }

    public async Task<TaskDto> CreateTaskAsync(int leadId, TaskCreateDto taskDto)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId);
        if (lead == null)
            throw new KeyNotFoundException("Lead não encontrado.");

        var task = new TaskItem
        {
            LeadId = leadId,
            Title = taskDto.Title.Trim(),
            DueDate = taskDto.DueDate,
            Status = taskDto.Status ?? TaskItemStatus.Todo,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdTask = await _taskRepository.AddAsync(task);

        return new TaskDto(
            createdTask.Id,
            createdTask.LeadId,
            createdTask.Title,
            createdTask.DueDate,
            createdTask.Status,
            createdTask.CreatedAt,
            createdTask.UpdatedAt
        );
    }

    public async Task UpdateTaskAsync(int leadId, int taskId, TaskUpdateDto taskDto)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null || task.LeadId != leadId)
            throw new KeyNotFoundException("Task não encontrada.");

        task.Title = taskDto.Title.Trim();
        task.DueDate = taskDto.DueDate;
        task.Status = taskDto.Status;
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(task);
    }

    public async Task DeleteTaskAsync(int leadId, int taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null || task.LeadId != leadId)
            throw new KeyNotFoundException("Task não encontrada.");

        await _taskRepository.DeleteAsync(task);
    }

    public async Task<bool> TaskExistsAsync(int id)
    {
        return await _taskRepository.ExistsAsync(id);
    }
}