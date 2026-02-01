using BCrypt.Net;

namespace MediaMarket.BL.Security;

public static class PasswordHasher
{
    /// <summary>
    /// Hashuje heslo pomocou BCrypt
    /// </summary>
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt());
    }

    /// <summary>
    /// Overi, ci heslo zodpoveda hash
    /// </summary>
    public static bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Overi, ci je string uz hash (obsahuje BCrypt marker)
    /// </summary>
    public static bool IsHashed(string value)
    {
        return value.StartsWith("$2") && value.Length > 20;
    }
}
