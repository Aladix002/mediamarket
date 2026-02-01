namespace MediaMarket.BL.Interfaces;

public interface IAuthService
{
    Task<(string? AccessToken, string? RefreshToken, object? User)> SignInAsync(string email, string password);
    Task<(string? AccessToken, string? RefreshToken, object? User, bool EmailSent, string? ErrorMessage)> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null);
    Task SignOutAsync();
    object? GetCurrentUser();
    Task<object?> GetUserFromTokenAsync(string token);
    Task<bool> ValidateTokenAsync(string token);
    Task<bool> UpdatePasswordAsync(string newPassword);
    Task<bool> ResetPasswordAsync(string email);
    Task<bool> VerifyEmailAsync(string token, string type);
    Task<bool> ResendVerificationEmailAsync(string email);
}
