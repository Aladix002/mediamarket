using MediaMarket.DAL.Enums;

namespace MediaMarket.DAL.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime? EmailVerifiedAt { get; set; }
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Polia z CompanyProfile (integrovane do User)
    public string CompanyName { get; set; } = string.Empty; // Povinne
    public string ContactName { get; set; } = string.Empty; // Povinne
    public string Phone { get; set; } = string.Empty; // Povinne

    // Navigacne vlastnosti
    public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    public ICollection<Order> OrdersAsAgency { get; set; } = new List<Order>();
    public ICollection<Order> OrdersAsMedia { get; set; } = new List<Order>();
}
