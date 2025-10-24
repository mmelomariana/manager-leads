using Domain.Entities;
using Domain.Enums;
using Application.DTOs;

namespace Application.Interfaces;

public interface ILeadRepository
{
    Task<IEnumerable<Lead>> GetAllAsync(string? search = null, LeadStatus? status = null);
    Task<PagedResultDto<Lead>> GetPagedAsync(string? search = null, LeadStatus? status = null,
       int page = 1, int pageSize = 10);
    Task<Lead?> GetByIdAsync(int id);
    Task<Lead?> GetByEmailAsync(string email);
    Task<Lead> AddAsync(Lead lead);
    Task UpdateAsync(Lead lead);
    Task DeleteAsync(Lead lead);
    Task<bool> ExistsAsync(int id);

    Task<IEnumerable<Lead>> GetAllWithDeletedAsync();
    Task<Lead?> GetByIdWithDeletedAsync(int id);
    Task RestoreAsync(Lead lead);
}