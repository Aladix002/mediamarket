using MediaMarket.BL.Interfaces;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace MediaMarket.BL.Services.ARES;

public class ARESService : IARESService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ARESService> _logger;
    private const string ARES_API_BASE_URL = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";

    public ARESService(HttpClient httpClient, ILogger<ARESService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task<(string? CompanyName, string? ErrorMessage)> GetCompanyNameAsync(string ico)
    {
        _logger.LogInformation("=== ARES získavanie názvu firmy ===");
        _logger.LogInformation("IČO: {Ico}", ico);
        
        try
        {
            // Validacia ICO formatu (8 cislic)
            if (string.IsNullOrWhiteSpace(ico) || !Regex.IsMatch(ico, @"^\d{8}$"))
            {
                _logger.LogWarning("Neplatné IČO formát: {Ico}", ico);
                return (null, "IČO musí obsahovať presne 8 číslic");
            }

            // Volanie ARES API
            var url = $"{ARES_API_BASE_URL}/ekonomicke-subjekty/{ico}";
            _logger.LogInformation("Volám ARES API: {Url}", url);
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("ARES API vrátilo chybu: {StatusCode}", response.StatusCode);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return (null, "Firma s týmto IČO sa nenašla v ARES registri");
                }
                return (null, $"Chyba pri komunikácii s ARES API: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var jsonRoot = JsonSerializer.Deserialize<JsonElement>(content);

            // Skús nájsť ekonomický subjekt v odpovedi
            JsonElement? subjektElement = null;
            if (jsonRoot.TryGetProperty("ekonomickySubjekt", out var ekonomickySubjekt))
            {
                subjektElement = ekonomickySubjekt;
            }
            else if (jsonRoot.TryGetProperty("EkonomickySubjekt", out var EkonomickySubjekt))
            {
                subjektElement = EkonomickySubjekt;
            }
            else if (jsonRoot.ValueKind == JsonValueKind.Object)
            {
                subjektElement = jsonRoot;
            }

            if (!subjektElement.HasValue)
            {
                return (null, "Nepodarilo sa nájsť údaje o firme v ARES odpovedi");
            }

            var subjekt = subjektElement.Value;

            // Získaj názov firmy
            string? companyName = null;
            if (subjekt.TryGetProperty("obchodniJmeno", out var obchodniJmeno))
                companyName = obchodniJmeno.GetString();
            else if (subjekt.TryGetProperty("ObchodniJmeno", out var ObchodniJmeno))
                companyName = ObchodniJmeno.GetString();
            else if (subjekt.TryGetProperty("nazev", out var nazev))
                companyName = nazev.GetString();
            else if (subjekt.TryGetProperty("Nazev", out var Nazev))
                companyName = Nazev.GetString();

            if (string.IsNullOrWhiteSpace(companyName))
            {
                return (null, "Nepodarilo sa nájsť názov firmy v ARES odpovedi");
            }

            _logger.LogInformation("✓ Názov firmy získaný z ARES: {CompanyName}", companyName);
            return (companyName, null);
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout pri získavaní údajov z ARES pre IČO {Ico}", ico);
            return (null, "Timeout pri komunikácii s ARES. Skúste to prosím znova.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Chyba pri komunikácii s ARES API pre IČO {Ico}", ico);
            return (null, $"Chyba pri komunikácii s ARES API: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Neočakávaná chyba pri získavaní údajov z ARES pre IČO {Ico}", ico);
            return (null, $"Neočakávaná chyba: {ex.Message}");
        }
    }

    public async Task<(bool IsValid, string? ErrorMessage)> ValidateCompanyAsync(string ico, string companyName, string email)
    {
        _logger.LogInformation("=== ARES Validácia začína ===");
        _logger.LogInformation("IČO: {Ico}, Názov firmy: {CompanyName}, Email: {Email}", ico, companyName, email);
        
        try
        {
            // Validacia ICO formatu (8 cislic)
            if (string.IsNullOrWhiteSpace(ico) || !Regex.IsMatch(ico, @"^\d{8}$"))
            {
                _logger.LogWarning("Neplatné IČO formát: {Ico}", ico);
                return (false, "IČO musí obsahovať presne 8 číslic");
            }

            // Extrahuj emailovu domenu
            var emailDomain = ExtractDomainFromEmail(email);
            if (string.IsNullOrEmpty(emailDomain))
            {
                _logger.LogWarning("Neplatná emailová adresa: {Email}", email);
                return (false, "Neplatná emailová adresa");
            }

            _logger.LogInformation("Emailová doména: {EmailDomain}", emailDomain);

            // Volanie ARES API - základný endpoint pre názov firmy a IČO
            var url = $"{ARES_API_BASE_URL}/ekonomicke-subjekty/{ico}";
            _logger.LogInformation("Volám ARES API (základný): {Url}", url);
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("ARES API vrátilo chybu: {StatusCode}", response.StatusCode);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Firma s IČO {Ico} sa nenašla v ARES registri", ico);
                    return (false, "Firma s týmto IČO sa nenašla v ARES registri");
                }
                return (false, $"Chyba pri overovaní v ARES: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("ARES API odpoveď prijatá, dĺžka: {Length} znakov", content.Length);
            
            // Loguj prvých 500 znakov JSON odpovede pre debugging
            var previewLength = Math.Min(500, content.Length);
            _logger.LogInformation("ARES JSON preview (prvých {PreviewLength} znakov): {Preview}", previewLength, content.Substring(0, previewLength));
            
            // Skús parsovať JSON odpoveď - ARES API môže mať rôzne štruktúry
            JsonElement jsonRoot;
            try
            {
                jsonRoot = JsonSerializer.Deserialize<JsonElement>(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chyba pri parsovaní JSON odpovede z ARES");
                return (false, "Neplatná JSON odpoveď z ARES API");
            }

            // Skús nájsť ekonomický subjekt v odpovedi (môže byť priamo alebo vnorený)
            JsonElement? subjektElement = null;
            string? aresCompanyName = null;
            string? aresEmail = null;
            string? aresWeb = null;

            // Skús rôzne možné cesty k dátam
            if (jsonRoot.TryGetProperty("ekonomickySubjekt", out var ekonomickySubjekt))
            {
                subjektElement = ekonomickySubjekt;
            }
            else if (jsonRoot.TryGetProperty("EkonomickySubjekt", out var EkonomickySubjekt))
            {
                subjektElement = EkonomickySubjekt;
            }
            else if (jsonRoot.ValueKind == JsonValueKind.Object)
            {
                // Možno je subjekt priamo v root objekte
                subjektElement = jsonRoot;
            }

            if (!subjektElement.HasValue)
            {
                return (false, "Nepodarilo sa nájsť údaje o firme v ARES odpovedi");
            }

            var subjekt = subjektElement.Value;

            // Loguj všetky dostupné properties v subjekte pre debugging
            _logger.LogInformation("Dostupné properties v ARES subjekte:");
            foreach (var prop in subjekt.EnumerateObject())
            {
                var value = prop.Value.ValueKind == JsonValueKind.String 
                    ? prop.Value.GetString() 
                    : prop.Value.ToString();
                _logger.LogInformation("  {PropertyName}: {Value}", prop.Name, value?.Substring(0, Math.Min(100, value?.Length ?? 0)) ?? "null");
            }

            // Získaj názov firmy (skús rôzne možné property names)
            if (subjekt.TryGetProperty("obchodniJmeno", out var obchodniJmeno))
                aresCompanyName = obchodniJmeno.GetString();
            else if (subjekt.TryGetProperty("ObchodniJmeno", out var ObchodniJmeno))
                aresCompanyName = ObchodniJmeno.GetString();
            else if (subjekt.TryGetProperty("nazev", out var nazev))
                aresCompanyName = nazev.GetString();
            else if (subjekt.TryGetProperty("Nazev", out var Nazev))
                aresCompanyName = Nazev.GetString();
            else if (subjekt.TryGetProperty("nazevObchodniFirma", out var nazevObchodniFirma))
                aresCompanyName = nazevObchodniFirma.GetString();
            else if (subjekt.TryGetProperty("obchodniFirma", out var obchodniFirma))
                aresCompanyName = obchodniFirma.GetString();

            // Získaj email a web z špecifických zdrojov ARES
            // Základný endpoint nevracia kontaktné údaje, musíme skúsiť ROS (Registr osob)
            _logger.LogInformation("Základný ARES endpoint nevracia kontaktné údaje, skúšam ROS endpoint...");
            var (rosEmail, rosWeb) = await TryGetContactFromRosAsync(ico);
            if (!string.IsNullOrEmpty(rosEmail))
                aresEmail = rosEmail;
            if (!string.IsNullOrEmpty(rosWeb))
                aresWeb = rosWeb;

            // Ak sa nenašlo v ROS, skús RŠ (Registr škol)
            if (string.IsNullOrEmpty(aresEmail) && string.IsNullOrEmpty(aresWeb))
            {
                _logger.LogInformation("ROS nevracia kontaktné údaje, skúšam RŠ endpoint...");
                var (rsEmail, rsWeb) = await TryGetContactFromRsAsync(ico);
                if (!string.IsNullOrEmpty(rsEmail))
                    aresEmail = rsEmail;
                if (!string.IsNullOrEmpty(rsWeb))
                    aresWeb = rsWeb;
            }

            // Ak sa stále nenašlo, skús NRPZS (zdravotnícke zariadenia)
            if (string.IsNullOrEmpty(aresEmail) && string.IsNullOrEmpty(aresWeb))
            {
                _logger.LogInformation("RŠ nevracia kontaktné údaje, skúšam NRPZS endpoint...");
                var (nrpzsEmail, nrpzsWeb) = await TryGetContactFromNrpzsAsync(ico);
                if (!string.IsNullOrEmpty(nrpzsEmail))
                    aresEmail = nrpzsEmail;
                if (!string.IsNullOrEmpty(nrpzsWeb))
                    aresWeb = nrpzsWeb;
            }

            // Loguj čo sa našlo v ARES
            _logger.LogInformation("=== ARES údaje nájdené ===");
            _logger.LogInformation("Názov firmy v ARES: {AresCompanyName}", aresCompanyName ?? "NENÁJDENÉ");
            _logger.LogInformation("Email v ARES: {AresEmail}", aresEmail ?? "NENÁJDENÉ");
            _logger.LogInformation("Web v ARES: {AresWeb}", aresWeb ?? "NENÁJDENÉ");

            // Porovnaj nazov firmy (case-insensitive, bez diakritiky)
            if (string.IsNullOrWhiteSpace(aresCompanyName))
            {
                return (false, "Nepodarilo sa nájsť názov firmy v ARES odpovedi");
            }

            var normalizedCompanyName = NormalizeString(companyName);
            var normalizedAresName = NormalizeString(aresCompanyName);

            _logger.LogInformation("Porovnávam názvy firiem:");
            _logger.LogInformation("  Zadaný (normalizovaný): {NormalizedCompanyName}", normalizedCompanyName);
            _logger.LogInformation("  ARES (normalizovaný): {NormalizedAresName}", normalizedAresName);

            if (!normalizedAresName.Contains(normalizedCompanyName, StringComparison.OrdinalIgnoreCase) &&
                !normalizedCompanyName.Contains(normalizedAresName, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Názov firmy sa nezhoduje! Zadaný: {CompanyName}, ARES: {AresCompanyName}", companyName, aresCompanyName);
                return (false, $"Názov firmy sa nezhoduje s ARES registrom. V ARES: {aresCompanyName}");
            }

            _logger.LogInformation("✓ Názov firmy sa zhoduje");

            // Over emailovu domenu - skus najst v kontaktnych udajoch
            _logger.LogInformation("Porovnávam emailové domény:");
            _logger.LogInformation("  Zadaná doména: {EmailDomain}", emailDomain);
            
            // Ak ARES má email alebo web, skús ich porovnať
            if (!string.IsNullOrEmpty(aresEmail) || !string.IsNullOrEmpty(aresWeb))
            {
                // Skus najst email v ARES datach
                if (!string.IsNullOrEmpty(aresEmail))
                {
                    var aresEmailDomain = ExtractDomainFromEmail(aresEmail);
                    _logger.LogInformation("  ARES email doména: {AresEmailDomain}", aresEmailDomain);
                    if (!string.IsNullOrEmpty(aresEmailDomain) && 
                        aresEmailDomain.Equals(emailDomain, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogInformation("✓ Emailová doména sa zhoduje s ARES emailom");
                        _logger.LogInformation("=== ARES Validácia úspešná ===");
                        return (true, null);
                    }
                }

                // Skus najst domenu v web adrese
                if (!string.IsNullOrEmpty(aresWeb))
                {
                    var aresWebDomain = ExtractDomainFromUrl(aresWeb);
                    _logger.LogInformation("  ARES web doména: {AresWebDomain}", aresWebDomain);
                    if (!string.IsNullOrEmpty(aresWebDomain) && 
                        aresWebDomain.Equals(emailDomain, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogInformation("✓ Emailová doména sa zhoduje s ARES web doménou");
                        _logger.LogInformation("=== ARES Validácia úspešná ===");
                        return (true, null);
                    }
                }

                // Ak sa nenasla zhoda a ARES má tieto údaje, vrat chybu
                var foundDomains = new List<string>();
                if (!string.IsNullOrEmpty(aresEmail))
                {
                    var domain = ExtractDomainFromEmail(aresEmail);
                    if (!string.IsNullOrEmpty(domain))
                        foundDomains.Add($"email: {domain}");
                }
                if (!string.IsNullOrEmpty(aresWeb))
                {
                    var domain = ExtractDomainFromUrl(aresWeb);
                    if (!string.IsNullOrEmpty(domain))
                        foundDomains.Add($"web: {domain}");
                }

                _logger.LogWarning("✗ Emailová doména sa nezhoduje!");
                _logger.LogWarning("  Zadaná doména: {EmailDomain}", emailDomain);
                _logger.LogWarning("  Nájdené domény v ARES: {FoundDomains}", string.Join(", ", foundDomains));
                _logger.LogWarning("=== ARES Validácia zlyhala ===");

                var domainsInfo = $" Nájdené domény v ARES: {string.Join(", ", foundDomains)}";
                return (false, $"Emailová doména '{emailDomain}' sa nezhoduje s kontaktnými údajmi firmy v ARES registri.{domainsInfo} Prosím použite email s doménou firmy.");
            }
            else
            {
                // ARES API nevracia email ani web - musíme odvodiť doménu z názvu firmy
                _logger.LogWarning("⚠ ARES API nevracia email ani web - odvodzujem doménu z názvu firmy");
                _logger.LogWarning("  Zadaná emailová doména: {EmailDomain}", emailDomain);
                _logger.LogWarning("  Skúšam odvodiť doménu z názvu firmy...");
                
                // Skús odvodiť doménu z názvu firmy (napr. "AMBERG Engineering Brno, a.s." -> "amberg.cz")
                var normalizedCompany = NormalizeString(aresCompanyName);
                var possibleDomain = ExtractPossibleDomainFromCompanyName(normalizedCompany, aresCompanyName);
                
                if (!string.IsNullOrEmpty(possibleDomain))
                {
                    _logger.LogInformation("  Odvodená doména z názvu firmy: {PossibleDomain}", possibleDomain);
                    if (emailDomain.Equals(possibleDomain, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogInformation("✓ Emailová doména sa zhoduje s odvodenou doménou z názvu firmy");
                        _logger.LogInformation("=== ARES Validácia úspešná ===");
                        return (true, null);
                    }
                    else
                    {
                        _logger.LogWarning("✗ Emailová doména sa nezhoduje s odvodenou doménou z názvu firmy");
                        _logger.LogWarning("  Zadaná: {EmailDomain}, Očakávaná (odvodená): {PossibleDomain}", emailDomain, possibleDomain);
                        _logger.LogWarning("=== ARES Validácia zlyhala ===");
                        return (false, $"Emailová doména '{emailDomain}' sa nezhoduje s očakávanou doménou '{possibleDomain}' odvodenou z názvu firmy '{aresCompanyName}'. Prosím použite email s doménou firmy.");
                    }
                }
                else
                {
                    // Ak sa nepodarilo odvodiť doménu, validácia zlyhá
                    _logger.LogWarning("  Nepodarilo sa odvodiť doménu z názvu firmy: {CompanyName}", aresCompanyName);
                    _logger.LogWarning("  Emailová doména sa nemôže overiť - registrácia zlyhá");
                    _logger.LogWarning("=== ARES Validácia zlyhala ===");
                    return (false, $"Nepodarilo sa overiť emailovú doménu pre firmu '{aresCompanyName}'. ARES API nevracia kontaktné údaje a doménu sa nepodarilo odvodiť z názvu firmy. Prosím kontaktujte podporu pre manuálne overenie.");
                }
            }
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout pri overovaní v ARES pre IČO {Ico}", ico);
            return (false, "Timeout pri overovaní v ARES. Skúste to prosím znova.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Chyba pri komunikácii s ARES API pre IČO {Ico}", ico);
            return (false, $"Chyba pri komunikácii s ARES API: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Neočakávaná chyba pri ARES validácii pre IČO {Ico}", ico);
            return (false, $"Neočakávaná chyba pri overovaní: {ex.Message}");
        }
    }

    private static string ExtractDomainFromEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return string.Empty;

        var atIndex = email.LastIndexOf('@');
        if (atIndex < 0 || atIndex >= email.Length - 1)
            return string.Empty;

        return email.Substring(atIndex + 1).ToLowerInvariant();
    }

    private static string? ExtractDomainFromUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;

        try
        {
            // Odstran http:// alebo https://
            url = url.Replace("http://", "").Replace("https://", "");
            
            // Odstran www.
            url = url.Replace("www.", "");

            // Vezmi len domenu (pred prvym /)
            var slashIndex = url.IndexOf('/');
            if (slashIndex > 0)
            {
                url = url.Substring(0, slashIndex);
            }

            return url.ToLowerInvariant();
        }
        catch
        {
            return null;
        }
    }

    private static string? ExtractPossibleDomainFromCompanyName(string normalizedCompanyName, string originalCompanyName)
    {
        if (string.IsNullOrWhiteSpace(normalizedCompanyName))
            return null;

        // Skús nájsť prvý významný výraz v názve firmy (pred "engineering", "sro", "as", atď.)
        // Napr. "AMBERG Engineering Brno, a.s." -> "amberg"
        
        // Najprv skús nájsť prvý výraz v originálnom názve (pred čiarkou, medzerou alebo právnou formou)
        var originalParts = originalCompanyName.Split(new[] { ',', ' ', '-' }, StringSplitOptions.RemoveEmptyEntries);
        if (originalParts.Length > 0)
        {
            var firstPart = originalParts[0].Trim();
            
            // Odstráň právne formy a bežné slová
            var legalForms = new[] { "s.r.o.", "sro", "a.s.", "as", "spol.", "spol", "v.o.s.", "vos", "k.s.", "ks" };
            var commonWords = new[] { "engineering", "brno", "praha", "cz", "sro", "as", "spol", "a", "s", "v", "o" };
            
            var firstPartLower = firstPart.ToLowerInvariant();
            foreach (var legalForm in legalForms)
            {
                if (firstPartLower.Contains(legalForm))
                {
                    firstPart = firstPart.Substring(0, firstPartLower.IndexOf(legalForm)).Trim();
                    break;
                }
            }
            
            if (!string.IsNullOrWhiteSpace(firstPart) && firstPart.Length >= 3)
            {
                // Normalizuj a vytvor doménu
                var normalized = NormalizeString(firstPart);
                if (normalized.Length >= 3 && !commonWords.Contains(normalized))
                {
                    return $"{normalized}.cz";
                }
            }
        }
        
        // Ak sa nepodarilo, skús z normalizovaného názvu
        var words = normalizedCompanyName.Split(new[] { ' ', ',', '.', '-' }, StringSplitOptions.RemoveEmptyEntries);
        var commonWordsList = new[] { "engineering", "sro", "as", "spol", "brno", "praha", "cz", "a", "s", "v", "o" };
        var significantWords = words.Where(w => !commonWordsList.Contains(w.ToLowerInvariant()) && w.Length >= 3).ToList();
        
        if (significantWords.Any())
        {
            var firstWord = significantWords.First();
            return $"{firstWord}.cz";
        }
        
        return null;
    }

    private static string NormalizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Odstran diakritiku a normalizuj
        var normalized = input.ToLowerInvariant()
            .Replace("á", "a").Replace("č", "c").Replace("ď", "d")
            .Replace("é", "e").Replace("ě", "e").Replace("í", "i")
            .Replace("ň", "n").Replace("ó", "o").Replace("ř", "r")
            .Replace("š", "s").Replace("ť", "t").Replace("ú", "u")
            .Replace("ů", "u").Replace("ý", "y").Replace("ž", "z");

        // Odstran medzery a specialne znaky
        return Regex.Replace(normalized, @"[^a-z0-9]", "");
    }

    private async Task<(string? Email, string? Web)> TryGetContactFromRosAsync(string ico)
    {
        try
        {
            var url = $"{ARES_API_BASE_URL}/ekonomicke-subjekty-ros/{ico}";
            _logger.LogInformation("Volám ROS endpoint: {Url}", url);
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("ROS endpoint vrátil: {StatusCode}", response.StatusCode);
                return (null, null);
            }

            var content = await response.Content.ReadAsStringAsync();
            var jsonRoot = JsonSerializer.Deserialize<JsonElement>(content);

            // ROS má štruktúru: { "icoId": "...", "zaznamy": [{ "kontaktniUdaje": { "email": "...", ... } }] }
            if (jsonRoot.TryGetProperty("zaznamy", out var zaznamy) && zaznamy.ValueKind == JsonValueKind.Array)
            {
                foreach (var zaznam in zaznamy.EnumerateArray())
                {
                    if (zaznam.TryGetProperty("kontaktniUdaje", out var kontaktniUdaje))
                    {
                        if (kontaktniUdaje.TryGetProperty("email", out var emailProp))
                        {
                            var email = emailProp.GetString();
                            if (!string.IsNullOrEmpty(email))
                            {
                                _logger.LogInformation("✓ Našiel som email v ROS: {Email}", email);
                                return (email, null);
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chyba pri získavaní kontaktov z ROS pre IČO {Ico}", ico);
        }

        return (null, null);
    }

    private async Task<(string? Email, string? Web)> TryGetContactFromRsAsync(string ico)
    {
        try
        {
            var url = $"{ARES_API_BASE_URL}/ekonomicke-subjekty-rs/{ico}";
            _logger.LogInformation("Volám RŠ endpoint: {Url}", url);
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("RŠ endpoint vrátil: {StatusCode}", response.StatusCode);
                return (null, null);
            }

            var content = await response.Content.ReadAsStringAsync();
            var jsonRoot = JsonSerializer.Deserialize<JsonElement>(content);

            // RŠ má štruktúru: { "icoId": "...", "zaznamy": [{ "kontakty": { "email": [...], "www": "..." } }] }
            if (jsonRoot.TryGetProperty("zaznamy", out var zaznamy) && zaznamy.ValueKind == JsonValueKind.Array)
            {
                foreach (var zaznam in zaznamy.EnumerateArray())
                {
                    if (zaznam.TryGetProperty("kontakty", out var kontakty))
                    {
                        string? email = null;
                        string? web = null;

                        // Email je pole v RŠ
                        if (kontakty.TryGetProperty("email", out var emailProp) && emailProp.ValueKind == JsonValueKind.Array)
                        {
                            var firstEmail = emailProp.EnumerateArray().FirstOrDefault();
                            if (firstEmail.ValueKind == JsonValueKind.String)
                                email = firstEmail.GetString();
                        }
                        
                        if (kontakty.TryGetProperty("www", out var wwwProp))
                            web = wwwProp.GetString();

                        if (!string.IsNullOrEmpty(email) || !string.IsNullOrEmpty(web))
                        {
                            _logger.LogInformation("✓ Našiel som kontakty v RŠ: email={Email}, web={Web}", email, web);
                            return (email, web);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chyba pri získavaní kontaktov z RŠ pre IČO {Ico}", ico);
        }

        return (null, null);
    }

    private async Task<(string? Email, string? Web)> TryGetContactFromNrpzsAsync(string ico)
    {
        try
        {
            var url = $"{ARES_API_BASE_URL}/ekonomicke-subjekty-nrpzs/{ico}";
            _logger.LogInformation("Volám NRPZS endpoint: {Url}", url);
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("NRPZS endpoint vrátil: {StatusCode}", response.StatusCode);
                return (null, null);
            }

            var content = await response.Content.ReadAsStringAsync();
            var jsonRoot = JsonSerializer.Deserialize<JsonElement>(content);

            // NRPZS má štruktúru: { "icoId": "...", "zaznamy": [{ "kontakty": { "email": "...", "www": "..." } }] }
            if (jsonRoot.TryGetProperty("zaznamy", out var zaznamy) && zaznamy.ValueKind == JsonValueKind.Array)
            {
                foreach (var zaznam in zaznamy.EnumerateArray())
                {
                    if (zaznam.TryGetProperty("kontakty", out var kontakty))
                    {
                        string? email = null;
                        string? web = null;

                        if (kontakty.TryGetProperty("email", out var emailProp))
                            email = emailProp.GetString();
                        
                        if (kontakty.TryGetProperty("www", out var wwwProp))
                            web = wwwProp.GetString();

                        if (!string.IsNullOrEmpty(email) || !string.IsNullOrEmpty(web))
                        {
                            _logger.LogInformation("✓ Našiel som kontakty v NRPZS: email={Email}, web={Web}", email, web);
                            return (email, web);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chyba pri získavaní kontaktov z NRPZS pre IČO {Ico}", ico);
        }

        return (null, null);
    }

}
