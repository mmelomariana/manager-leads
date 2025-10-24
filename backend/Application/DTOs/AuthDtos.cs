namespace Application.DTOs;

public record LoginDto(string Email, string Password);
public record RegisterDto(string Name, string Email, string Password);
public record AuthResponseDto(string Token, string Email, string Name);