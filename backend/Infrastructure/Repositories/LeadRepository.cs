using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Application.DTOs;

namespace Infrastructure.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly ApplicationDbContext _context;

    public LeadRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Lead>> GetAllAsync(string? search = null, LeadStatus? status = null)
    {
        var query = _context.Leads.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(l => l.Name.Contains(search) || l.Email.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        return await query.
            Include(l => l.Tasks.Where(t => !t.IsDeleted)).ToListAsync();
    }

    public async Task<PagedResultDto<Lead>> GetPagedAsync(string? search = null, LeadStatus? status = null,
        int page = 1, int pageSize = 10)
    {
        var query = BuildQuery(search, status);

        // Contar total antes da paginação
        var totalCount = await query.CountAsync();

        // Aplicar paginação
        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(l => l.Tasks.Where(t => !t.IsDeleted))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResultDto<Lead>(
            items,
            totalCount,
            page,
            pageSize,
            totalPages
        );
    }

    private IQueryable<Lead> BuildQuery(string? search, LeadStatus? status)
    {
        var query = _context.Leads.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(l => l.Name.Contains(search) || l.Email.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        return query;
    }

    public async Task<Lead?> GetByIdAsync(int id)
    {
        return await _context.Leads
            .Include(l => l.Tasks)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<Lead?> GetByEmailAsync(string email)
    {
        return await _context.Leads
            .FirstOrDefaultAsync(l => l.Email == email);
    }

    public async Task<Lead> AddAsync(Lead lead)
    {
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();
        return lead;
    }

    public async Task UpdateAsync(Lead lead)
    {
        lead.UpdatedAt = DateTime.UtcNow;
        _context.Entry(lead).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Lead lead)
    {
        lead.IsDeleted = true;
        lead.DeletedAt = DateTime.UtcNow;
        await UpdateAsync(lead);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Leads.AnyAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Lead>> GetAllWithDeletedAsync()
    {
        return await _context.Leads
            .IgnoreQueryFilters()
            .Include(l => l.Tasks)
            .ToListAsync();
    }

    public async Task<Lead?> GetByIdWithDeletedAsync(int id)
    {
        return await _context.Leads
            .IgnoreQueryFilters()
            .Include(l => l.Tasks)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task RestoreAsync(Lead lead)
    {
        lead.IsDeleted = false;
        lead.DeletedAt = null;
        await UpdateAsync(lead);
    }
}