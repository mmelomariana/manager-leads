using Application.DTOs;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Moq;

namespace Tests.Unit.Application.Services;

public class LeadServiceTests : TestBase
{
    private LeadService _leadService = null!;

    public LeadServiceTests()
    {
        SetupMocks();
        _leadService = new LeadService(_mockLeadRepository.Object);
    }

    [Fact]
    public async Task GetAllLeadsAsync_ShouldReturnLeads_WhenLeadsExist()
    {
        // Arrange
        var leads = new List<Lead> { CreateSampleLead(1), CreateSampleLead(2) };
        _mockLeadRepository.Setup(x => x.GetAllAsync(null, null))
                          .ReturnsAsync(leads);

        // Act
        var result = await _leadService.GetAllLeadsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockLeadRepository.Verify(x => x.GetAllAsync(null, null), Times.Once);
    }

    [Fact]
    public async Task GetAllLeadsAsync_ShouldFilterBySearch_WhenSearchProvided()
    {
        // Arrange
        var search = "john";
        var leads = new List<Lead> { CreateSampleLead(1) };
        _mockLeadRepository.Setup(x => x.GetAllAsync(search, null))
                          .ReturnsAsync(leads);

        // Act
        var result = await _leadService.GetAllLeadsAsync(search);

        // Assert
        Assert.Single(result);
        _mockLeadRepository.Verify(x => x.GetAllAsync(search, null), Times.Once);
    }

    [Fact]
    public async Task GetLeadByIdAsync_ShouldReturnLead_WhenLeadExists()
    {
        // Arrange
        var leadId = 1;
        var lead = CreateSampleLead(leadId);
        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync(lead);

        // Act
        var result = await _leadService.GetLeadByIdAsync(leadId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(leadId, result.Id);
        Assert.Equal("John Doe", result.Name);
    }

    [Fact]
    public async Task GetLeadByIdAsync_ShouldReturnNull_WhenLeadNotExists()
    {
        // Arrange
        var leadId = 999;
        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync((Lead?)null);

        // Act
        var result = await _leadService.GetLeadByIdAsync(leadId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateLeadAsync_ShouldCreateLead_WithValidData()
    {
        // Arrange
        var leadDto = new LeadCreateDto("Jane Doe", "jane@email.com", LeadStatus.Qualified);
        var userId = 1;
        var createdLead = new Lead
        {
            Id = 1,
            Name = "Jane Doe",
            Email = "jane@email.com",
            Status = LeadStatus.Qualified,
            UserId = TestUserId
        };

        _mockLeadRepository.Setup(x => x.GetByEmailAsync(leadDto.Email))
                          .ReturnsAsync((Lead?)null);
        _mockLeadRepository.Setup(x => x.AddAsync(It.IsAny<Lead>()))
                          .ReturnsAsync(createdLead);

        // Act
        var result = await _leadService.CreateLeadAsync(leadDto, TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Jane Doe", result.Name);
        Assert.Equal(LeadStatus.Qualified, result.Status);
        _mockLeadRepository.Verify(x => x.AddAsync(It.IsAny<Lead>()), Times.Once);
    }

    [Fact]
    public async Task CreateLeadAsync_ShouldThrowException_WhenEmailAlreadyExists()
    {
        // Arrange
        var leadDto = new LeadCreateDto("John Doe", "john@email.com", null);
        var userId = 1;
        var existingLead = CreateSampleLead(1);

        _mockLeadRepository.Setup(x => x.GetByEmailAsync(leadDto.Email))
                          .ReturnsAsync(existingLead);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _leadService.CreateLeadAsync(leadDto, TestUserId));
    }

    [Fact]
    public async Task UpdateLeadAsync_ShouldUpdateLead_WhenLeadExists()
    {
        // Arrange
        var leadId = 1;
        var existingLead = CreateSampleLead(leadId);
        var updateDto = new LeadUpdateDto("Updated Name", "updated@email.com", LeadStatus.Won);

        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync(existingLead);
        _mockLeadRepository.Setup(x => x.GetByEmailAsync(updateDto.Email))
                          .ReturnsAsync((Lead?)null);
        _mockLeadRepository.Setup(x => x.UpdateAsync(It.IsAny<Lead>()));

        // Act
        await _leadService.UpdateLeadAsync(leadId, updateDto);

        // Assert
        _mockLeadRepository.Verify(x => x.UpdateAsync(It.Is<Lead>(l =>
            l.Name == "Updated Name" &&
            l.Email == "updated@email.com" &&
            l.Status == LeadStatus.Won)), Times.Once);
    }

    [Fact]
    public async Task DeleteLeadAsync_ShouldSoftDeleteLead_WhenLeadExists()
    {
        // Arrange
        var leadId = 1;
        var existingLead = CreateSampleLead(leadId);

        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync(existingLead);
        _mockLeadRepository.Setup(x => x.DeleteAsync(existingLead));

        // Act
        await _leadService.DeleteLeadAsync(leadId);

        // Assert
        _mockLeadRepository.Verify(x => x.DeleteAsync(existingLead), Times.Once);
    }

    [Fact]
    public async Task DeleteLeadAsync_ShouldThrowException_WhenLeadNotExists()
    {
        // Arrange
        var leadId = 999;
        _mockLeadRepository.Setup(x => x.GetByIdAsync(leadId))
                          .ReturnsAsync((Lead?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _leadService.DeleteLeadAsync(leadId));
    }
}