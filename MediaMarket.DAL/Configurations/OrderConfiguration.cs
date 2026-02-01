using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MediaMarket.DAL.Entities;

namespace MediaMarket.DAL.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        // Table name
        builder.ToTable("Orders");

        // Primary key
        builder.HasKey(o => o.Id);

        // Properties
        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.UnitPriceSnapshot)
            .HasPrecision(18, 2);

        builder.Property(o => o.CptSnapshot)
            .HasPrecision(18, 2);

        builder.Property(o => o.TotalPrice)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(o => o.CommissionRate)
            .HasPrecision(5, 4); // 0.025 alebo 0.05

        builder.Property(o => o.CommissionAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.Note)
            .HasMaxLength(2000);

        // Unique constraints
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique()
            .HasDatabaseName("IX_Orders_OrderNumber");

        // Indexes for performance
        builder.HasIndex(o => o.OfferId)
            .HasDatabaseName("IX_Orders_OfferId");

        builder.HasIndex(o => o.AgencyUserId)
            .HasDatabaseName("IX_Orders_AgencyUserId");

        builder.HasIndex(o => o.MediaUserId)
            .HasDatabaseName("IX_Orders_MediaUserId");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("IX_Orders_Status");

        builder.HasIndex(o => o.CreatedAt)
            .HasDatabaseName("IX_Orders_CreatedAt");

        // Composite index for filtering orders by agency and status
        builder.HasIndex(o => new { o.AgencyUserId, o.Status })
            .HasDatabaseName("IX_Orders_AgencyUserId_Status");

        // Composite index for filtering orders by media and status
        builder.HasIndex(o => new { o.MediaUserId, o.Status })
            .HasDatabaseName("IX_Orders_MediaUserId_Status");

        // Composite index for admin filtering (date range + status)
        builder.HasIndex(o => new { o.CreatedAt, o.Status })
            .HasDatabaseName("IX_Orders_CreatedAt_Status");
    }
}
