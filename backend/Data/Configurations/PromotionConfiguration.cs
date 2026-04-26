using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
{
    public void Configure(EntityTypeBuilder<Promotion> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("NEWID()");
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.NameEn).HasMaxLength(200);
        builder.Property(p => p.DiscountType).HasConversion(EnumExtensions.SnakeCaseConverter<DiscountType>()).HasMaxLength(20).IsRequired();
        builder.Property(p => p.Value).HasColumnType("decimal(10,2)");
        builder.Property(p => p.IsActive).HasDefaultValue(true);
        builder.Property(p => p.Category).HasMaxLength(50);
        builder.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(p => p.Product)
            .WithMany()
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.StartDate);
        builder.HasIndex(p => p.EndDate);
        builder.HasIndex(p => p.ProductId);
        builder.HasIndex(p => p.Category);
    }
}
