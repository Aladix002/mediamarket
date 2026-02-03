using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MediaMarket.DAL.Entities;

namespace MediaMarket.DAL.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Table name
        builder.ToTable("Users");

        // Primary key
        builder.HasKey(u => u.Id);

        // Properties
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.CompanyName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.ContactName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.Phone)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Ico)
            .IsRequired()
            .HasMaxLength(8);

        // Unique constraints
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        // Indexes for performance
        builder.HasIndex(u => u.Role)
            .HasDatabaseName("IX_Users_Role");

        builder.HasIndex(u => u.Status)
            .HasDatabaseName("IX_Users_Status");

        // Relationships
        builder.HasMany(u => u.Offers)
            .WithOne(o => o.MediaUser)
            .HasForeignKey(o => o.MediaUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.OrdersAsAgency)
            .WithOne(o => o.AgencyUser)
            .HasForeignKey(o => o.AgencyUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.OrdersAsMedia)
            .WithOne(o => o.MediaUser)
            .HasForeignKey(o => o.MediaUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
