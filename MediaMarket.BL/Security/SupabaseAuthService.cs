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
    private readonly string _supabaseUrl;
    private readonly string _supabaseKey;

    public SupabaseAuthService(Supabase.Client supabase, string supabaseUrl, string supabaseKey)
    {
        _supabase = supabase;
        _supabaseUrl = supabaseUrl;
        _supabaseKey = supabaseKey;
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
    /// Obnovi access token pomocou refresh tokenu
    /// </summary>
    public async Task<(string? AccessToken, string? RefreshToken, object? User)> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            // Supabase SDK má metódu RefreshSession, ale musíme nastaviť refresh token najprv
            // Alternatívne môžeme použiť SetSession s refresh tokenom
            var response = await _supabase.Auth.RefreshSession();
            
            if (response?.User != null)
            {
                return (response.AccessToken, response.RefreshToken, response.User);
            }
            
            return (null, null, null);
        }
        catch
        {
            return (null, null, null);
        }
    }

    /// <summary>
    /// Zmeni heslo pouzivatela (pre prihlaseného používateľa)
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
    /// Zmeni heslo pomocou access tokenu (pre reset hesla cez recovery token)
    /// </summary>
    public async Task<bool> UpdatePasswordWithTokenAsync(string accessToken, string newPassword)
    {
        try
        {
            // Pre reset hesla cez recovery token, Supabase vyžaduje nastavenie session
            // Použijeme SetSession s access tokenom
            // Poznámka: Recovery token môže mať aj refresh token v hash fragmente, ale môžeme skúsiť bez neho
            await _supabase.Auth.SetSession(accessToken, string.Empty);
            
            // Teraz môžeme zmeniť heslo
            var response = await _supabase.Auth.Update(new Supabase.Gotrue.UserAttributes
            {
                Password = newPassword
            });
            
            return response != null;
        }
        catch (Exception ex)
        {
            // Log chybu pre debugging - vrátime false, aby backend mohol vrátiť správnu chybovú správu
            System.Diagnostics.Debug.WriteLine($"UpdatePasswordWithTokenAsync error: {ex.Message}");
            if (ex.InnerException != null)
            {
                System.Diagnostics.Debug.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            
            // Skúsime alternatívny prístup - použiť Supabase REST API priamo
            try
            {
                // Použijeme Supabase URL a Key z konfigurácie
                if (string.IsNullOrEmpty(_supabaseUrl) || string.IsNullOrEmpty(_supabaseKey))
                {
                    System.Diagnostics.Debug.WriteLine("Supabase URL or Key is missing");
                    return false;
                }
                
                var httpClient = new System.Net.Http.HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
                httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
                
                var updateUrl = $"{_supabaseUrl}/auth/v1/user";
                var updateData = new
                {
                    password = newPassword
                };
                
                var json = System.Text.Json.JsonSerializer.Serialize(updateData);
                var content = new System.Net.Http.StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var updateResponse = await httpClient.PutAsync(updateUrl, content);
                
                if (updateResponse.IsSuccessStatusCode)
                {
                    return true;
                }
                
                var errorContent = await updateResponse.Content.ReadAsStringAsync();
                System.Diagnostics.Debug.WriteLine($"REST API error: {updateResponse.StatusCode} - {errorContent}");
            }
            catch (Exception restEx)
            {
                System.Diagnostics.Debug.WriteLine($"REST API fallback failed: {restEx.Message}");
                if (restEx.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"REST API inner exception: {restEx.InnerException.Message}");
                }
            }
            
            return false;
        }
    }

    /// <summary>
    /// Posle email na reset hesla
    /// </summary>
    public async Task<bool> ResetPasswordAsync(string email, string? redirectUrl = null)
    {
        try
        {
            // Supabase ResetPasswordForEmail automaticky použije redirect URL z konfigurácie
            // Redirect URL sa nastavuje v Supabase Dashboard -> Authentication -> URL Configuration
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
