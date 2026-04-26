using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("NEWID()");
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Price).HasColumnType("decimal(10,2)");
        builder.Property(p => p.ImageUrl).HasMaxLength(500).IsRequired();
        builder.Property(p => p.Category).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Gender).HasConversion(EnumExtensions.SnakeCaseConverter<Gender>()).HasMaxLength(20).IsRequired();
        builder.Property(p => p.IsActive).HasDefaultValue(true);
        builder.Property(p => p.StockQuantity).HasDefaultValue(0);
        builder.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(p => p.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.Category);
        builder.HasIndex(p => p.Gender);
        builder.HasIndex(p => p.IsStandalone);
        builder.HasIndex(p => p.IsBuilderItem);
        builder.HasIndex(p => p.IsCustomizable);
        builder.HasIndex(p => p.StockQuantity);
    }
}
