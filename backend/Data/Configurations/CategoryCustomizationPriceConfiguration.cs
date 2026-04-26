using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Models;

namespace SoulmateStore.Data.Configurations;

public class CategoryCustomizationPriceConfiguration : IEntityTypeConfiguration<CategoryCustomizationPrice>
{
    public void Configure(EntityTypeBuilder<CategoryCustomizationPrice> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasDefaultValueSql("NEWID()");
        builder.Property(c => c.Category).HasMaxLength(50).IsRequired();
        builder.HasIndex(c => c.Category).IsUnique();
        builder.Property(c => c.Price).HasColumnType("decimal(10,2)");
    }
}
