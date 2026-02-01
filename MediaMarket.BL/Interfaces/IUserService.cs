using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Interfaces;

public interface IUserService
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> VerifyPasswordAsync(string email, string password);
    Task<List<User>> GetByRoleAsync(UserRole role);
    Task<List<User>> GetByStatusAsync(UserStatus status);
}
