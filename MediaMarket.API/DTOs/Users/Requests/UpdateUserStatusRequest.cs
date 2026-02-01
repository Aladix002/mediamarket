using MediaMarket.DAL.Enums;

namespace MediaMarket.API.DTOs.Users.Requests;

public class UpdateUserStatusRequest
{
    public UserStatus Status { get; set; }
}
