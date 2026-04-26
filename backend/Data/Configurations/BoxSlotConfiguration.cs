using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data.Configurations;

public class BoxSlotConfiguration : IEntityTypeConfiguration<BoxSlot>
{
    public void Configure(EntityTypeBuilder<BoxSlot> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("NEWID()");
        builder.Property(s => s.SlotKey).HasMaxLength(50).IsRequired();
        builder.Property(s => s.LabelAr).HasMaxLength(100).IsRequired();
        builder.Property(s => s.FilterGender).HasConversion(EnumExtensions.SnakeCaseConverter<Gender>()).HasMaxLength(20);

        builder.HasOne(s => s.BoxType)
            .WithMany(b => b.BoxSlots)
            .HasForeignKey(s => s.BoxTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.BoxTypeId);
        builder.HasIndex(s => s.SlotKey);
    }
}
