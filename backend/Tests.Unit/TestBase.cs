using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Moq;

namespace Tests.Unit;

public abstract class TestBase
{
    protected Mock<ILeadRepository> _mockLeadRepository = null!;
    protected Mock<ITaskRepository> _mockTaskRepository = null!;
    protected Mock<IUserRepository> _mockUserRepository = null!;

    protected const int TestUserId = 1;

    protected void SetupMocks()
    {
        _mockLeadRepository = new Mock<ILeadRepository>();
        _mockTaskRepository = new Mock<ITaskRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
    }

    protected Lead CreateSampleLead(int id = 1)
    {
        return new Lead
        {
            Id = id,
            Name = "John Doe",
            Email = $"john{id}@email.com",
            Status = LeadStatus.New,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow,
            UserId = TestUserId,
            IsDeleted = false,
        };
    }

    protected TaskItem CreateSampleTask(int id = 1, int leadId = 1)
    {
        return new TaskItem
        {
            Id = id,
            LeadId = leadId,
            Title = "Sample Task",
            DueDate = DateTime.UtcNow.AddDays(7),
            Status = TaskItemStatus.Todo,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }
}