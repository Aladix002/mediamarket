namespace MediaMarket.BL.Interfaces;

public interface IARESService
{
    /// <summary>
    /// Získa názov firmy z ARES registra podľa IČO
    /// </summary>
    /// <param name="ico">IČO firmy (8 číslic)</param>
    /// <returns>Názov firmy z ARES alebo null ak sa nenašla</returns>
    Task<(string? CompanyName, string? ErrorMessage)> GetCompanyNameAsync(string ico);
    
    /// <summary>
    /// Overi firmu v ARES registri podla ICO a porovna emailovu domenu
    /// </summary>
    /// <param name="ico">IČO firmy (8 cislic)</param>
    /// <param name="companyName">Nazov firmy na porovnanie</param>
    /// <param name="email">Email na overenie domeny</param>
    /// <returns>True ak je firma validna a emailova domena zodpoveda, inak false</returns>
    Task<(bool IsValid, string? ErrorMessage)> ValidateCompanyAsync(string ico, string companyName, string email);
}
