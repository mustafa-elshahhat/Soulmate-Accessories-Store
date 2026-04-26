using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasDefaultValueSql("NEWID()");
        builder.Property(o => o.OrderNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.Status).HasConversion(EnumExtensions.SnakeCaseConverter<OrderStatus>()).HasMaxLength(30).HasDefaultValue(OrderStatus.Pending);
        builder.Property(o => o.TotalPrice).HasColumnType("decimal(10,2)");
        builder.Property(o => o.ShippingCost).HasColumnType("decimal(10,2)");
        builder.Property(o => o.CouponCode).HasMaxLength(50);
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(10,2)").HasDefaultValue(0m);
        builder.Property(o => o.CancelReason).HasMaxLength(500);
        builder.Property(o => o.AdminNote).HasMaxLength(500);
        builder.Property(o => o.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(o => o.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Address)
            .WithMany()
            .HasForeignKey(o => o.AddressId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.CreatedAt);
        builder.HasIndex(o => o.AddressId);
    }
}
