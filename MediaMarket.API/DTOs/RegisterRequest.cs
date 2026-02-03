using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? CompanyName { get; set; } // Voliteľné - ak nie je zadané, získa sa z ARES
    public string ContactName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Ico { get; set; } = string.Empty; // IČO firmy (8 cislic) - povinne pre validaciu cez ARES
    public UserRole Role { get; set; } = UserRole.Agency; // Default rola
}
