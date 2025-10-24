using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Application.Services;

public class AuthService : IAuthService
{
	private readonly IConfiguration _configuration;
	private readonly IUserRepository _userRepository;

	public AuthService(IConfiguration configuration, IUserRepository userRepository)
	{
		_configuration = configuration;
		_userRepository = userRepository;
	}

	public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
	{
		// Verificar se usuário já existe
		var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
		if (existingUser != null)
		{
			throw new InvalidOperationException("Usuário já existe com este email.");
		}

		// Criar usuário
		var user = new User
		{
			Name = registerDto.Name,
			Email = registerDto.Email,
			PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
			CreatedAt = DateTime.UtcNow,
			UpdatedAt = DateTime.UtcNow
		};

		var createdUser = await _userRepository.AddAsync(user);

		// Gerar token
		var token = GenerateJwtToken(createdUser.Email, createdUser.Id.ToString());

		return new AuthResponseDto(token, createdUser.Email, createdUser.Name);
	}

	public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
	{
		// Buscar usuário
		var user = await _userRepository.GetByEmailAsync(loginDto.Email);
		if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
		{
			throw new UnauthorizedAccessException("Email ou senha inválidos.");
		}

		// Gerar token
		var token = GenerateJwtToken(user.Email, user.Id.ToString());

		return new AuthResponseDto(token, user.Email, user.Name);
	}

	public string GenerateJwtToken(string email, string userId)
	{
		var jwtSettings = _configuration.GetSection("JwtSettings");
		var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
		var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

		var claims = new[]
		{
			new Claim(ClaimTypes.Email, email),
			new Claim(ClaimTypes.NameIdentifier, userId),
			new Claim(ClaimTypes.Role, "User")
		};

		var tokenOptions = new JwtSecurityToken(
			issuer: jwtSettings["Issuer"],
			audience: jwtSettings["Audience"],
			claims: claims,
			expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryInMinutes"])),
			signingCredentials: signinCredentials
		);

		return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
	}
}