using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Tests.Unit.Application.Services
{
    public class AuthServiceTests
    {
        private Mock<IUserRepository> _mockUserRepository;
        private IConfiguration _configuration;
        private AuthService _authService;

        public AuthServiceTests()
        {
            _mockUserRepository = new Mock<IUserRepository>();

            var inMemorySettings = new Dictionary<string, string?> {
                {"JwtSettings:SecretKey", "YourSuperSecretKeyForTesting12345678901234567890!!"},
                {"JwtSettings:Issuer", "LeadManagerTest"},
                {"JwtSettings:Audience", "LeadManagerUsersTest"},
                {"JwtSettings:ExpiryInMinutes", "60"}
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            // CORREÇÃO: Ordem dos parâmetros conforme o construtor real
            _authService = new AuthService(_configuration, _mockUserRepository.Object);
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ReturnsAuthResponse()
        {
            // Arrange
            var loginDto = new LoginDto("test@example.com", "123456");
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword("123456");

            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                Name = "Test User",
                PasswordHash = hashedPassword
            };

            _mockUserRepository.Setup(x => x.GetByEmailAsync(loginDto.Email))
                .ReturnsAsync(user);

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(result);
            Assert.False(string.IsNullOrEmpty(result.Token));
            Assert.Equal(user.Email, result.Email);
            Assert.Equal(user.Name, result.Name);

            // Verifica se o token é um JWT válido
            var tokenHandler = new JwtSecurityTokenHandler();
            Assert.True(tokenHandler.CanReadToken(result.Token));
        }

        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var loginDto = new LoginDto("test@example.com", "wrongpassword");
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword")
            };

            _mockUserRepository.Setup(x => x.GetByEmailAsync(loginDto.Email))
                .ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _authService.LoginAsync(loginDto));
        }

        [Fact]
        public async Task LoginAsync_WithNonExistentUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var loginDto = new LoginDto("nonexistent@example.com", "password");

            _mockUserRepository.Setup(x => x.GetByEmailAsync(loginDto.Email))
                .ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _authService.LoginAsync(loginDto));
        }

        [Fact]
        public async Task RegisterAsync_WithNewUser_ReturnsAuthResponse()
        {
            // Arrange
            var registerDto = new RegisterDto("New User", "new@example.com", "123456");

            _mockUserRepository.Setup(x => x.GetByEmailAsync(registerDto.Email))
                .ReturnsAsync((User?)null);

            _mockUserRepository.Setup(x => x.AddAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) => user);

            // Act
            var result = await _authService.RegisterAsync(registerDto);

            // Assert
            Assert.NotNull(result);
            Assert.False(string.IsNullOrEmpty(result.Token));
            Assert.Equal(registerDto.Email, result.Email);
            Assert.Equal(registerDto.Name, result.Name);
        }

        [Fact]
        public async Task RegisterAsync_WithExistingEmail_ThrowsInvalidOperationException()
        {
            // Arrange
            var registerDto = new RegisterDto("New User", "existing@example.com", "123456");
            var existingUser = new User { Id = 1, Email = "existing@example.com" };

            _mockUserRepository.Setup(x => x.GetByEmailAsync(registerDto.Email))
                .ReturnsAsync(existingUser);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _authService.RegisterAsync(registerDto));
        }

        [Fact]
        public void GenerateJwtToken_ShouldContainCorrectClaims()
        {
            // Arrange
            var email = "test@example.com";
            var userId = "1";

            // Act
            var token = _authService.GenerateJwtToken(email, userId);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var emailClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Email);
            var idClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier);
            var roleClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Role);

            Assert.Equal(email, emailClaim.Value);
            Assert.Equal(userId, idClaim.Value);
            Assert.Equal("User", roleClaim.Value);
        }

        [Fact]
        public void GenerateJwtToken_ShouldContainCorrectIssuerAndAudience()
        {
            // Arrange
            var email = "test@example.com";
            var userId = "1";

            // Act
            var token = _authService.GenerateJwtToken(email, userId);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            Assert.Equal("LeadManagerTest", jwtToken.Issuer);
            Assert.Contains("LeadManagerUsersTest", jwtToken.Audiences);
        }

        [Fact]
        public void GenerateJwtToken_ShouldHaveExpiration()
        {
            // Arrange
            var email = "test@example.com";
            var userId = "1";

            // Act
            var token = _authService.GenerateJwtToken(email, userId);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            Assert.True(jwtToken.ValidTo > DateTime.UtcNow);
            Assert.True(jwtToken.ValidTo <= DateTime.UtcNow.AddHours(1));
        }
    }
}