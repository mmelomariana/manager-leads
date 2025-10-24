using Application.DTOs;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Moq;

namespace Tests.Unit.Application.Services;

public class TaskServiceTests : TestBase
{
    private TaskService _taskService = null!;

    public TaskServiceTests()
    {
        SetupMocks();
        _taskService = new TaskService(_mockTaskRepository.Object, _mockLeadRepository.Object);
    }

    [Fact]
    public async Task GetTasksByLeadIdAsync_ShouldReturnTasks_WhenTasksExist()
    {
        // Arrange
        var leadId = 1;
        var tasks = new List<TaskItem>
        {
            CreateSampleTask(1, leadId),
            CreateSampleTask(2, leadId)
        };

        _mockTaskRepository.Setup(x => x.GetByLeadIdAsync(leadId))
                          .ReturnsAsync(tasks);

        // Act
        var result = await _taskService.GetTasksByLeadIdAsync(leadId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockTaskRepository.Verify(x => x.GetByLeadIdAsync(leadId), Times.Once);
    }

    [Fact]
    public async Task GetTasksByLeadIdAsync_ShouldReturnEmpty_WhenNoTasksExist()
    {
        // Arrange
        var leadId = 999;
        var tasks = new List<TaskItem>();

        _mockTaskRepository.Setup(x => x.GetByLeadIdAsync(leadId))
                          .ReturnsAsync(tasks);

        // Act
        var result = await _taskService.GetTasksByLeadIdAsync(leadId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetTaskByIdAsync_ShouldReturnTask_WhenTaskExists()
    {
        // Arrange
        var taskId = 1;
        var task = CreateSampleTask(taskId);

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync(task);

        // Act
        var result = await _taskService.GetTaskByIdAsync(taskId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result.Id);
        Assert.Equal("Sample Task", result.Title);
    }

    [Fact]
    public async Task GetTaskByIdAsync_ShouldReturnNull_WhenTaskNotExists()
    {
        // Arrange
        var taskId = 999;

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync((TaskItem?)null);

        // Act
        var result = await _taskService.GetTaskByIdAsync(taskId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateTaskAsync_ShouldCreateTask_WhenLeadExists()
    {
        // Arrange
        var leadId = 1;
        var taskDto = new TaskCreateDto("New Task", DateTime.UtcNow.AddDays(7), TaskItemStatus.Todo);
        var lead = CreateSampleLead(leadId);
        var createdTask = new TaskItem
        {
            Id = 1,
            LeadId = leadId,
            Title = "New Task",
            DueDate = DateTime.UtcNow.AddDays(7),
            Status = TaskItemStatus.Todo
        };

        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync(lead);
        _mockTaskRepository.Setup(x => x.AddAsync(It.IsAny<TaskItem>()))
                          .ReturnsAsync(createdTask);

        // Act
        var result = await _taskService.CreateTaskAsync(leadId, taskDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Task", result.Title);
        Assert.Equal(leadId, result.LeadId);
        Assert.Equal(TaskItemStatus.Todo, result.Status);
        _mockTaskRepository.Verify(x => x.AddAsync(It.IsAny<TaskItem>()), Times.Once);
    }

    [Fact]
    public async Task CreateTaskAsync_ShouldThrowException_WhenLeadNotExists()
    {
        // Arrange
        var leadId = 999;
        var taskDto = new TaskCreateDto("New Task", null, null);

        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync((Lead?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _taskService.CreateTaskAsync(leadId, taskDto));
    }

    [Fact]
    public async Task CreateTaskAsync_ShouldUseDefaultStatus_WhenStatusNotProvided()
    {
        // Arrange
        var leadId = 1;
        var taskDto = new TaskCreateDto("New Task", null, null); // Status null
        var lead = CreateSampleLead(leadId);
        var createdTask = new TaskItem
        {
            Id = 1,
            LeadId = leadId,
            Title = "New Task",
            Status = TaskItemStatus.Todo // Deve usar default
        };

        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync(lead);
        _mockTaskRepository.Setup(x => x.AddAsync(It.IsAny<TaskItem>()))
                          .ReturnsAsync(createdTask);

        // Act
        var result = await _taskService.CreateTaskAsync(leadId, taskDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(TaskItemStatus.Todo, result.Status);
    }

    [Fact]
    public async Task UpdateTaskAsync_ShouldUpdateTask_WhenTaskExists()
    {
        // Arrange
        var leadId = 1;
        var taskId = 1;
        var existingTask = CreateSampleTask(taskId, leadId);
        var updateDto = new TaskUpdateDto("Updated Task", DateTime.UtcNow.AddDays(14), TaskItemStatus.Doing);

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync(existingTask);
        _mockTaskRepository.Setup(x => x.UpdateAsync(It.IsAny<TaskItem>()));

        // Act
        await _taskService.UpdateTaskAsync(leadId, taskId, updateDto);

        // Assert
        _mockTaskRepository.Verify(x => x.UpdateAsync(It.Is<TaskItem>(t =>
            t.Title == "Updated Task" &&
            t.Status == TaskItemStatus.Doing &&
            t.LeadId == leadId)), Times.Once);
    }

    [Fact]
    public async Task UpdateTaskAsync_ShouldThrowException_WhenTaskNotExists()
    {
        // Arrange
        var leadId = 1;
        var taskId = 999;
        var updateDto = new TaskUpdateDto("Updated Task", null, TaskItemStatus.Doing);

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync((TaskItem?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _taskService.UpdateTaskAsync(leadId, taskId, updateDto));
    }

    [Fact]
    public async Task UpdateTaskAsync_ShouldThrowException_WhenTaskBelongsToDifferentLead()
    {
        // Arrange
        var leadId = 1;
        var taskId = 1;
        var existingTask = CreateSampleTask(taskId, leadId: 2); // Task pertence ao lead 2
        var updateDto = new TaskUpdateDto("Updated Task", null, TaskItemStatus.Doing);

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync(existingTask);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _taskService.UpdateTaskAsync(leadId, taskId, updateDto));
    }

    [Fact]
    public async Task DeleteTaskAsync_ShouldSoftDeleteTask_WhenTaskExists()
    {
        // Arrange
        var leadId = 1;
        var taskId = 1;
        var existingTask = CreateSampleTask(taskId, leadId);

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync(existingTask);
        _mockTaskRepository.Setup(x => x.DeleteAsync(existingTask));

        // Act
        await _taskService.DeleteTaskAsync(leadId, taskId);

        // Assert
        _mockTaskRepository.Verify(x => x.DeleteAsync(existingTask), Times.Once);
    }

    [Fact]
    public async Task DeleteTaskAsync_ShouldThrowException_WhenTaskNotExists()
    {
        // Arrange
        var leadId = 1;
        var taskId = 999;

        _mockTaskRepository.Setup(x => x.GetByIdAsync(taskId))
                          .ReturnsAsync((TaskItem?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _taskService.DeleteTaskAsync(leadId, taskId));
    }

    [Fact]
    public async Task TaskExistsAsync_ShouldReturnTrue_WhenTaskExists()
    {
        // Arrange
        var taskId = 1;
        _mockTaskRepository.Setup(x => x.ExistsAsync(taskId))
                          .ReturnsAsync(true);

        // Act
        var result = await _taskService.TaskExistsAsync(taskId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task TaskExistsAsync_ShouldReturnFalse_WhenTaskNotExists()
    {
        // Arrange
        var taskId = 999;
        _mockTaskRepository.Setup(x => x.ExistsAsync(taskId))
                          .ReturnsAsync(false);

        // Act
        var result = await _taskService.TaskExistsAsync(taskId);

        // Assert
        Assert.False(result);
    }
}