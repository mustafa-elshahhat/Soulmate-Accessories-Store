using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Models;

namespace SoulmateStore.Data.Configurations;

public class GovernorateConfiguration : IEntityTypeConfiguration<Governorate>
{
    public void Configure(EntityTypeBuilder<Governorate> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasDefaultValueSql("NEWID()");
        builder.Property(g => g.Name).HasMaxLength(100).IsRequired();
        builder.Property(g => g.ShippingCost).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(g => g.IsActive).HasDefaultValue(true);

        builder.HasIndex(g => g.Name).IsUnique();
    }
}
