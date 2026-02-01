namespace MediaMarket.BL.Interfaces;

public interface IAuthService
{
    Task<string?> SignInAsync(string email, string password);
    Task<string?> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null);
    Task SignOutAsync();
    object? GetCurrentUser();
    Task<bool> ValidateTokenAsync(string token);
    Task<bool> UpdatePasswordAsync(string newPassword);
    Task<bool> ResetPasswordAsync(string email);
}
