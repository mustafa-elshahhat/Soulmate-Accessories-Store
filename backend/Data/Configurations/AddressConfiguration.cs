using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Models;

namespace SoulmateStore.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasDefaultValueSql("NEWID()");
        builder.Property(a => a.Label).HasMaxLength(100).IsRequired();
        builder.Property(a => a.City).HasMaxLength(100).HasDefaultValue("");
        builder.Property(a => a.District).HasMaxLength(100).HasDefaultValue("");
        builder.Property(a => a.Street).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Building).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Floor).HasMaxLength(20).IsRequired();
        builder.Property(a => a.Phone).HasMaxLength(20).IsRequired();
        builder.Property(a => a.Apartment).HasMaxLength(50);
        builder.Property(a => a.IsDefault).HasDefaultValue(false);

        builder.HasOne(a => a.User)
            .WithMany(u => u.Addresses)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Governorate)
            .WithMany()
            .HasForeignKey(a => a.GovernorateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
