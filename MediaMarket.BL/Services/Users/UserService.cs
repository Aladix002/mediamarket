using Microsoft.EntityFrameworkCore;
using MediaMarket.DAL;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using MediaMarket.BL.Interfaces;
using MediaMarket.BL.Security;

namespace MediaMarket.BL.Services.Users;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        // Ak PasswordHash nie je prazdny a nie je uz hashovany, hashni ho
        // Pre Supabase Auth moze byt PasswordHash prazdny (heslo je v Supabase)
        if (!string.IsNullOrEmpty(user.PasswordHash) && !PasswordHasher.IsHashed(user.PasswordHash))
        {
            user.PasswordHash = PasswordHasher.HashPassword(user.PasswordHash);
        }

        user.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await GetByIdAsync(id);
        if (user == null)
        {
            return false;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VerifyPasswordAsync(string email, string password)
    {
        var user = await GetByEmailAsync(email);
        if (user == null)
        {
            return false;
        }

        return PasswordHasher.VerifyPassword(password, user.PasswordHash);
    }

    public async Task<List<User>> GetByRoleAsync(UserRole role)
    {
        return await _context.Users
            .Where(u => u.Role == role)
            .ToListAsync();
    }

    public async Task<List<User>> GetByStatusAsync(UserStatus status)
    {
        return await _context.Users
            .Where(u => u.Status == status)
            .ToListAsync();
    }
}
