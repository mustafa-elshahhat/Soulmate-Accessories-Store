using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasDefaultValueSql("NEWID()");
        builder.Property(c => c.Code).HasMaxLength(50).IsRequired();
        builder.HasIndex(c => c.Code).IsUnique();
        builder.Property(c => c.DiscountType).HasConversion(EnumExtensions.SnakeCaseConverter<DiscountType>()).HasMaxLength(20).IsRequired();
        builder.Property(c => c.Value).HasColumnType("decimal(10,2)");
        builder.Property(c => c.MinOrderAmount).HasColumnType("decimal(10,2)");
        builder.Property(c => c.IsActive).HasDefaultValue(true);
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(c => c.IsActive);
        builder.HasIndex(c => c.ExpirationDate);
    }
}
