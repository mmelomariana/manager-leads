using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Domain.Enums;

namespace Api.Controllers;

[ApiController]
[Route("api/leads/{leadId}/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    // GET: api/leads/1/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks(int leadId)
    {
        try
        {
            var tasks = await _taskService.GetTasksByLeadIdAsync(leadId);
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    // POST: api/leads/1/tasks
    [HttpPost]
    public async Task<ActionResult<TaskDto>> PostTask(int leadId, TaskCreateDto taskDto)
    {
        try
        {
            var task = await _taskService.CreateTaskAsync(leadId, taskDto);
            return CreatedAtAction("GetTasks", new { leadId = task.LeadId }, task);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Erro ao criar task: {ex.Message}");
        }
    }

    // PUT: api/leads/1/tasks/5
    [HttpPut("{taskId}")]
    public async Task<IActionResult> PutTask(int leadId, int taskId, TaskUpdateDto taskDto)
    {
        try
        {
            await _taskService.UpdateTaskAsync(leadId, taskId, taskDto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Erro ao atualizar task: {ex.Message}");
        }
    }

    // DELETE: api/leads/1/tasks/5
    [HttpDelete("{taskId}")]
    public async Task<IActionResult> DeleteTask(int leadId, int taskId)
    {
        try
        {
            await _taskService.DeleteTaskAsync(leadId, taskId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Erro ao deletar task: {ex.Message}");
        }
    }
}