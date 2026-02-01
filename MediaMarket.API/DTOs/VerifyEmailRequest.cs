namespace MediaMarket.API.DTOs;

public class VerifyEmailRequest
{
    public string Token { get; set; } = string.Empty;
    public string Type { get; set; } = "email"; // email alebo signup
}
