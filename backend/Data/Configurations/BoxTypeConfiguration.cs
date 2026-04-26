using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class BoxTypeConfiguration : IEntityTypeConfiguration<BoxType>
{
    public void Configure(EntityTypeBuilder<BoxType> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasDefaultValueSql("NEWID()");
        builder.Property(b => b.Name).HasMaxLength(100).IsRequired();
        builder.Property(b => b.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(b => b.Slug).IsUnique();
        builder.Property(b => b.Gender).HasConversion(EnumExtensions.SnakeCaseConverter<Gender>()).HasMaxLength(20).IsRequired();
        builder.Property(b => b.BasePrice).HasColumnType("decimal(10,2)");
        builder.Property(b => b.ImageUrl).HasMaxLength(500).IsRequired();
        builder.Property(b => b.IsActive).HasDefaultValue(true);
        builder.Property(b => b.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(b => b.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
    }
}
