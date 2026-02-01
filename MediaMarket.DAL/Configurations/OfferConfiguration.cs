using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MediaMarket.DAL.Entities;

namespace MediaMarket.DAL.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        // Table name
        builder.ToTable("Offers");

        // Primary key
        builder.HasKey(o => o.Id);

        // Properties
        builder.Property(o => o.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(o => o.Format)
            .HasMaxLength(255);

        builder.Property(o => o.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(o => o.MediaType)
            .IsRequired();

        builder.Property(o => o.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(o => o.Cpt)
            .HasPrecision(18, 2);

        builder.Property(o => o.MinOrderValue)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0);

        builder.Property(o => o.TechnicalConditionsText)
            .HasMaxLength(2000);

        builder.Property(o => o.TechnicalConditionsUrl)
            .HasMaxLength(500);

        // Indexes for performance
        builder.HasIndex(o => o.MediaUserId)
            .HasDatabaseName("IX_Offers_MediaUserId");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("IX_Offers_Status");

        builder.HasIndex(o => o.MediaType)
            .HasDatabaseName("IX_Offers_MediaType");

        builder.HasIndex(o => o.ValidFrom)
            .HasDatabaseName("IX_Offers_ValidFrom");

        builder.HasIndex(o => o.ValidTo)
            .HasDatabaseName("IX_Offers_ValidTo");

        // Composite index for filtering published offers by date
        builder.HasIndex(o => new { o.Status, o.ValidFrom, o.ValidTo })
            .HasDatabaseName("IX_Offers_Status_ValidDates");

        // Composite index for filtering by media type and status
        builder.HasIndex(o => new { o.MediaType, o.Status })
            .HasDatabaseName("IX_Offers_MediaType_Status");

        // Relationships
        builder.HasMany(o => o.Orders)
            .WithOne(or => or.Offer)
            .HasForeignKey(or => or.OfferId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
