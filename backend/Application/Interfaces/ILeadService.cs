using Application.DTOs;
using Domain.Enums;

namespace Application.Interfaces;

public interface ILeadService
{
    Task<IEnumerable<LeadDto>> GetAllLeadsAsync(string? search = null, LeadStatus? status = null);
    Task<PagedResultDto<LeadDto>> GetLeadsPagedAsync(string? search = null, LeadStatus? status = null,
        int page = 1, int pageSize = 10);
    Task<LeadDetailDto?> GetLeadByIdAsync(int id);
    Task<LeadDto> CreateLeadAsync(LeadCreateDto leadDto, int userId);
    Task UpdateLeadAsync(int id, LeadUpdateDto leadDto);
    Task DeleteLeadAsync(int id);
    Task<bool> LeadExistsAsync(int id);
}