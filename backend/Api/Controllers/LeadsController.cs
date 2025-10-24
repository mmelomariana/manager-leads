using Application.Interfaces;
using Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Domain.Enums;
using System.Security.Claims;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeadDto>>> GetLeads(
        [FromQuery] string? search, [FromQuery] LeadStatus? status)
    {
        var leads = await _leadService.GetAllLeadsAsync(search, status);
        return Ok(leads);
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResultDto<LeadDto>>> GetLeadsPaged(
       [FromQuery] string? search,
       [FromQuery] LeadStatus? status,
       [FromQuery] int page = 1,
       [FromQuery] int pageSize = 10)
    {
        // Validação dos parâmetros
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var result = await _leadService.GetLeadsPagedAsync(search, status, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LeadDto>> GetLead(int id)
    {
        var lead = await _leadService.GetLeadByIdAsync(id);
        if (lead == null) return NotFound();
        return Ok(lead);
    }

    [HttpPost]
    public async Task<ActionResult<LeadDto>> PostLead(LeadCreateDto leadDto)
    {
        var userId = GetUserIdFromToken();

        var lead = await _leadService.CreateLeadAsync(leadDto, userId);
        return CreatedAtAction("GetLead", new { id = lead.Id }, lead);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutLead(int id, LeadUpdateDto leadDto)
    {
        await _leadService.UpdateLeadAsync(id, leadDto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLead(int id)
    {
        await _leadService.DeleteLeadAsync(id);
        return NoContent();
    }

    private int GetUserIdFromToken()
    {
        // Debug: ver todas as claims disponíveis
        Console.WriteLine("=== Claims no Token ===");
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"{claim.Type}: {claim.Value}");
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"UserIdClaim encontrada: {userIdClaim}");

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        Console.WriteLine($"UserId parseado: {userId}");
        return userId;
    }
}