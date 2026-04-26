using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoulmateStore.Models;

namespace SoulmateStore.Data.Configurations;

public class BoxReviewConfiguration : IEntityTypeConfiguration<BoxReview>
{
    public void Configure(EntityTypeBuilder<BoxReview> builder)
    {
        builder.HasKey(br => br.Id);
        builder.Property(br => br.Id).HasDefaultValueSql("NEWID()");
        builder.Property(br => br.Rating).IsRequired();
        builder.Property(br => br.Comment).HasMaxLength(1000);
        builder.Property(br => br.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(br => br.User)
            .WithMany()
            .HasForeignKey(br => br.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(br => br.BoxType)
            .WithMany()
            .HasForeignKey(br => br.BoxTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(br => br.Order)
            .WithMany()
            .HasForeignKey(br => br.OrderId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(br => br.BoxTypeId);
        builder.HasIndex(br => br.UserId);
        builder.HasIndex(br => br.OrderId);
        builder.HasIndex(br => new { br.UserId, br.OrderId, br.BoxTypeId }).IsUnique();
    }
}
