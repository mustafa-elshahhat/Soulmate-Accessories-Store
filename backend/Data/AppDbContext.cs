using Microsoft.EntityFrameworkCore;
using SoulmateStore.Models;

namespace SoulmateStore.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<BoxType> BoxTypes => Set<BoxType>();
    public DbSet<BoxSlot> BoxSlots => Set<BoxSlot>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Governorate> Governorates => Set<Governorate>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<CategoryCustomizationPrice> CategoryCustomizationPrices => Set<CategoryCustomizationPrice>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<BoxReview> BoxReviews => Set<BoxReview>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        SeedData.Seed(modelBuilder);
    }
}
