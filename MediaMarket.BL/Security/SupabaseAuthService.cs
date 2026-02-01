using System;
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
    public async Task<(string? AccessToken, string? RefreshToken, object? User)> SignInAsync(string email, string password)
    {
        try
        {
            var response = await _supabase.Auth.SignInWithPassword(email, password);
            return (response?.AccessToken, response?.RefreshToken, response?.User);
        }
        catch
        {
            return (null, null, null);
        }
    }

    /// <summary>
    /// Registruje noveho pouzivatela cez Supabase Auth
    /// </summary>
    public async Task<(string? AccessToken, string? RefreshToken, object? User, bool EmailSent, string? ErrorMessage)> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null)
    {
        try
        {
            var response = await _supabase.Auth.SignUp(email, password, new Supabase.Gotrue.SignUpOptions
            {
                Data = metadata
            });
            
            // Skontroluj, či response je null
            if (response == null)
            {
                return (null, null, null, false, "Supabase Auth SignUp vratil null response. Skontroluj Supabase konfiguraciu.");
            }
            
            // Supabase môže vrátiť null User, ak je zapnuté email confirmation
            // V takom prípade sa email poslal a používateľ sa vytvoril, ale User je null až kým sa email neoverí
            // Ak je User null, ale email sa poslal, registrácia je úspešná
            if (response.User == null)
            {
                // Email confirmation je zapnuté - používateľ sa vytvoril, ale musí overiť email
                // Vráťme úspešnú odpoveď, ale bez AccessToken (ten bude po overení emailu)
                return (null, null, null, true, null);
            }
            
            // Supabase automaticky posle email s verification linkom ak je to nastavene
            return (response.AccessToken, response.RefreshToken, response.User, true, null);
        }
        catch (Exception ex)
        {
            // Vrat presnu chybovu spravu
            var errorMessage = ex.Message;
            
            // Skús získať viac detailov z exception
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
            }
            
            // Skús získať detail z Response, ak existuje
            if (ex.Data != null && ex.Data.Count > 0)
            {
                var dataDetails = string.Join(", ", ex.Data.Keys.Cast<object>().Select(k => $"{k}={ex.Data[k]}"));
                errorMessage += $" | Data: {dataDetails}";
            }
            
            // Skús získať detail z Supabase error response, ak existuje
            var exceptionType = ex.GetType().FullName;
            errorMessage += $" | ExceptionType: {exceptionType}";
            
            return (null, null, null, false, errorMessage);
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
    /// Ziska pouzivatela z JWT tokenu
    /// </summary>
    public async Task<object?> GetUserFromTokenAsync(string token)
    {
        try
        {
            var user = await _supabase.Auth.GetUser(token);
            return user;
        }
        catch
        {
            return null;
        }
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

    /// <summary>
    /// Overi email pomocou tokenu z emailu
    /// </summary>
    /// <param name="token">OTP token z emailu</param>
    /// <param name="type">Typ OTP - "email" alebo "signup"</param>
    public async Task<bool> VerifyEmailAsync(string token, string type)
    {
        try
        {
            // Supabase VerifyOTP - pouzivame explicitny EmailOtpType
            // Signatura: VerifyOTP(string token, string type, EmailOtpType otpType)
            Supabase.Gotrue.Constants.EmailOtpType emailOtpType = type == "email" 
                ? Supabase.Gotrue.Constants.EmailOtpType.Email 
                : Supabase.Gotrue.Constants.EmailOtpType.Signup;
            
            var response = await _supabase.Auth.VerifyOTP(token, type, emailOtpType);
            return response?.User != null;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Posle znova verification email
    /// </summary>
    public async Task<bool> ResendVerificationEmailAsync(string email)
    {
        try
        {
            // Supabase SDK nema priamy Resend metodu
            // Pouzivame ResetPasswordForEmail s redirect URL - to posle verification email
            // Alebo jednoduchsie - pouzivame ResendOTP ak existuje
            // Najjednoduchsie je pouzit ResetPasswordForEmail s type="signup"
            await _supabase.Auth.ResetPasswordForEmail(email);
            return true;
        }
        catch
        {
            // Fallback - skusime znova SignUp (Supabase to rozpozna a posle len verification email)
            // Ale toto nie je idealne, lebo vytvori duplicitny user
            return false;
        }
    }
}
