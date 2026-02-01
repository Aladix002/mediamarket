using Supabase;
using MediaMarket.BL.Interfaces;

namespace MediaMarket.BL.Security;

/// <summary>
/// Service pre autentifikaciu cez Supabase Auth
/// </summary>
public class SupabaseAuthService : IAuthService
{
    private readonly Supabase.Client _supabase;

    public SupabaseAuthService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    /// <summary>
    /// Prihlasi pouzivatela cez Supabase Auth
    /// </summary>
    public async Task<string?> SignInAsync(string email, string password)
    {
        try
        {
            var response = await _supabase.Auth.SignInWithPassword(email, password);
            return response?.AccessToken;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Registruje noveho pouzivatela cez Supabase Auth
    /// </summary>
    public async Task<string?> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null)
    {
        try
        {
            var response = await _supabase.Auth.SignUp(email, password, new Supabase.Gotrue.SignUpOptions
            {
                Data = metadata
            });
            return response?.AccessToken;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Odhlasi pouzivatela
    /// </summary>
    public async Task SignOutAsync()
    {
        await _supabase.Auth.SignOut();
    }

    /// <summary>
    /// Ziska aktualneho pouzivatela
    /// </summary>
    public object? GetCurrentUser()
    {
        return _supabase.Auth.CurrentUser;
    }

    /// <summary>
    /// Validuje JWT token
    /// </summary>
    public async Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var user = await _supabase.Auth.GetUser(token);
            return user != null;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Zmeni heslo pouzivatela
    /// </summary>
    public async Task<bool> UpdatePasswordAsync(string newPassword)
    {
        try
        {
            var response = await _supabase.Auth.Update(new Supabase.Gotrue.UserAttributes
            {
                Password = newPassword
            });
            return response != null;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Posle email na reset hesla
    /// </summary>
    public async Task<bool> ResetPasswordAsync(string email)
    {
        try
        {
            await _supabase.Auth.ResetPasswordForEmail(email);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
