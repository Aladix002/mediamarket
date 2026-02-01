namespace MediaMarket.API.DTOs.Users.Requests;

public class UpdateUserRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
