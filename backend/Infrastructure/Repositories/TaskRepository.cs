using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaskItem>> GetByLeadIdAsync(int leadId)
    {
        return await _context.Tasks
            .Where(t => t.LeadId == leadId)
            .ToListAsync();
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<TaskItem> AddAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task UpdateAsync(TaskItem task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        _context.Entry(task).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(TaskItem task)
    {
        task.IsDeleted = true;
        task.DeletedAt = DateTime.UtcNow;
        await UpdateAsync(task);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Tasks.AnyAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<TaskItem>> GetAllWithDeletedAsync()
    {
        return await _context.Tasks
            .IgnoreQueryFilters()
            .ToListAsync();
    }

    public async Task<TaskItem?> GetByIdWithDeletedAsync(int id)
    {
        return await _context.Tasks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task RestoreAsync(TaskItem task)
    {
        task.IsDeleted = false;
        task.DeletedAt = null;
        await UpdateAsync(task);
    }
}