using Application.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _leadRepository;

    public LeadService(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<IEnumerable<LeadDto>> GetAllLeadsAsync(string? search = null, LeadStatus? status = null)
    {
        var leads = await _leadRepository.GetAllAsync(search, status);

        return leads.Select(l => new LeadDto(
            l.Id,
            l.Name,
            l.Email,
            l.Status,
            l.CreatedAt,
            l.UpdatedAt,
            l.Tasks.Count
        ));
    }

    public async Task<PagedResultDto<LeadDto>> GetLeadsPagedAsync(string? search = null, LeadStatus? status = null,
        int page = 1, int pageSize = 10)
    {
        var pagedResult = await _leadRepository.GetPagedAsync(search, status, page, pageSize);

        var items = pagedResult.Items.Select(lead => MapToDto(lead)).ToList();

        return new PagedResultDto<LeadDto>(
            items,
            pagedResult.TotalCount,
            pagedResult.Page,
            pagedResult.PageSize,
            pagedResult.TotalPages
        );
    }

    private LeadDto MapToDto(Lead lead)
    {
        return new LeadDto(
            lead.Id,
            lead.Name,
            lead.Email,
            lead.Status,
            lead.CreatedAt,
            lead.UpdatedAt,
            lead.Tasks.Count(t => !t.IsDeleted)
        );
    }

    public async Task<LeadDetailDto?> GetLeadByIdAsync(int id)
    {
        var lead = await _leadRepository.GetByIdAsync(id);
        if (lead == null) return null;

        var tasks = lead.Tasks.Select(t => new TaskDto(
            t.Id,
            t.LeadId,
            t.Title,
            t.DueDate,
            t.Status,
            t.CreatedAt,
            t.UpdatedAt
        ));

        return new LeadDetailDto(
            lead.Id,
            lead.Name,
            lead.Email,
            lead.Status,
            lead.CreatedAt,
            lead.UpdatedAt,
            tasks
        );
    }

    public async Task<LeadDto> CreateLeadAsync(LeadCreateDto leadDto, int userId)
    {
        // Validação de email único
        var existingLead = await _leadRepository.GetByEmailAsync(leadDto.Email);

        // CORREÇÃO: Verificar se existingLead não é null E não está deletado
        if (existingLead != null && !existingLead.IsDeleted)
        {
            throw new InvalidOperationException("Já existe um lead com este email.");
        }

        var lead = new Lead
        {
            Name = leadDto.Name.Trim(),
            Email = leadDto.Email.Trim().ToLower(),
            Status = leadDto.Status ?? LeadStatus.New,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false,
            UserId = userId
        };

        var createdLead = await _leadRepository.AddAsync(lead);

        return new LeadDto(
            createdLead.Id,
            createdLead.Name,
            createdLead.Email,
            createdLead.Status,
            createdLead.CreatedAt,
            createdLead.UpdatedAt,
            0
        );
    }

    public async Task UpdateLeadAsync(int id, LeadUpdateDto leadDto)
    {
        var lead = await _leadRepository.GetByIdAsync(id);
        if (lead == null)
            throw new KeyNotFoundException("Lead não encontrado.");

        var existingLead = await _leadRepository.GetByEmailAsync(leadDto.Email);
        if (existingLead != null && existingLead.Id != id && !existingLead.IsDeleted)
        {
            throw new InvalidOperationException("Já existe outro lead com este email.");
        }

        lead.Name = leadDto.Name.Trim();
        lead.Email = leadDto.Email.Trim().ToLower();
        lead.Status = leadDto.Status;
        lead.UpdatedAt = DateTime.UtcNow;

        await _leadRepository.UpdateAsync(lead);
    }

    public async Task DeleteLeadAsync(int id)
    {
        var lead = await _leadRepository.GetByIdAsync(id);
        if (lead == null)
            throw new KeyNotFoundException("Lead não encontrado.");

        await _leadRepository.DeleteAsync(lead);
    }

    public async Task<bool> LeadExistsAsync(int id)
    {
        return await _leadRepository.ExistsAsync(id);
    }
}