using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;

namespace SoulmateStore.Tests.Helpers;

public static class TestDbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();

        // Clear seed data so tests start with a clean slate
        context.Products.RemoveRange(context.Products);
        context.BoxSlots.RemoveRange(context.BoxSlots);
        context.BoxTypes.RemoveRange(context.BoxTypes);
        context.Governorates.RemoveRange(context.Governorates);
        context.CategoryCustomizationPrices.RemoveRange(context.CategoryCustomizationPrices);
        context.Users.RemoveRange(context.Users);
        context.SaveChanges();

        return context;
    }
}
