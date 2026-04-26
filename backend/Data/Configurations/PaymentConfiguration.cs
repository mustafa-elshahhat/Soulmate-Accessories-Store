using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("NEWID()");
        builder.Property(p => p.Method).HasConversion(EnumExtensions.SnakeCaseConverter<PaymentMethod>()).HasMaxLength(30).IsRequired();
        builder.Property(p => p.ScreenshotUrl).HasMaxLength(500).IsRequired();
        builder.Property(p => p.Status).HasConversion(EnumExtensions.SnakeCaseConverter<PaymentStatus>()).HasMaxLength(20).HasDefaultValue(PaymentStatus.Pending);
        builder.Property(p => p.AdminNote).HasMaxLength(500);
        builder.Property(p => p.AttemptNumber).HasDefaultValue(1);
        builder.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(p => p.Order)
            .WithMany(o => o.Payments)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.OrderId);
        builder.HasIndex(p => p.Status);
    }
}
