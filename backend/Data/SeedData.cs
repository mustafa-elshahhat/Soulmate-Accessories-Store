using Microsoft.EntityFrameworkCore;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Data;

public static class SeedData
{
    // Fixed GUIDs for seed data so migrations are deterministic
    private static readonly Guid MaleBoxId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    private static readonly Guid FemaleBoxId = Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901");
    private static readonly Guid CoupleBoxId = Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012");
    private static readonly Guid AdminUserId = Guid.Parse("d4e5f6a7-b8c9-0123-defa-234567890123");

    // Admin credentials for initial setup: admin@soulmate.com / admin123
    private const string AdminEmail = "admin@soulmate.com";
    private const string AdminPasswordHash = "$2a$11$qS9eG5f.5lY.u8S/x6fGTe7r9.S.S.S.S.S.S.S.S.S.S.S.S.S.S"; // Just a placeholder, I will use a real one

    private static readonly DateTime SeedDate = new(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static void Seed(ModelBuilder modelBuilder)
    {
        SeedAdmin(modelBuilder);
        SeedGovernorates(modelBuilder);
        SeedBoxTypes(modelBuilder);
        SeedBoxSlots(modelBuilder);
        SeedProducts(modelBuilder);
        SeedCustomizationPrices(modelBuilder);
        SeedPromotions(modelBuilder);
        SeedCoupons(modelBuilder);
    }

    private static void SeedGovernorates(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Governorate>().HasData(
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000001"), Name = "القاهرة", NameEn = "Cairo", ShippingCost = 50, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000002"), Name = "الجيزة", NameEn = "Giza", ShippingCost = 50, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000003"), Name = "الإسكندرية", NameEn = "Alexandria", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000004"), Name = "الدقهلية", NameEn = "Dakahlia", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000005"), Name = "البحيرة", NameEn = "Beheira", ShippingCost = 65, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000006"), Name = "المنيا", NameEn = "Minya", ShippingCost = 70, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000007"), Name = "القليوبية", NameEn = "Qalyubia", ShippingCost = 50, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000008"), Name = "الشرقية", NameEn = "Sharqia", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000009"), Name = "الغربية", NameEn = "Gharbia", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000000a"), Name = "المنوفية", NameEn = "Monufia", ShippingCost = 55, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000000b"), Name = "كفر الشيخ", NameEn = "Kafr El Sheikh", ShippingCost = 65, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000000c"), Name = "الفيوم", NameEn = "Fayoum", ShippingCost = 65, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000000d"), Name = "بني سويف", NameEn = "Beni Suef", ShippingCost = 65, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000000e"), Name = "أسيوط", NameEn = "Assiut", ShippingCost = 75, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000000f"), Name = "سوهاج", NameEn = "Sohag", ShippingCost = 75, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000010"), Name = "قنا", NameEn = "Qena", ShippingCost = 80, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000011"), Name = "الأقصر", NameEn = "Luxor", ShippingCost = 80, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000012"), Name = "أسوان", NameEn = "Aswan", ShippingCost = 85, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000013"), Name = "دمياط", NameEn = "Damietta", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000014"), Name = "بورسعيد", NameEn = "Port Said", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000015"), Name = "الإسماعيلية", NameEn = "Ismailia", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000016"), Name = "السويس", NameEn = "Suez", ShippingCost = 60, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000017"), Name = "شمال سيناء", NameEn = "North Sinai", ShippingCost = 80, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000018"), Name = "جنوب سيناء", NameEn = "South Sinai", ShippingCost = 85, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-000000000019"), Name = "مطروح", NameEn = "Matrouh", ShippingCost = 80, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000001a"), Name = "الوادي الجديد", NameEn = "New Valley", ShippingCost = 90, IsActive = true },
            new Governorate { Id = Guid.Parse("a0000000-0000-0000-0000-00000000001b"), Name = "البحر الأحمر", NameEn = "Red Sea", ShippingCost = 85, IsActive = true }
        );
    }

    private static void SeedAdmin(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = AdminUserId,
            Name = "Admin",
            Email = AdminEmail,
            Phone = "01000000000",
            PasswordHash = "$2a$11$9Z5R6K39Y4AWgmB6aFyvh.CjYm6EEESBzyuBTGQrguHhFa48c642S", // This is 'Password123!'
            Role = UserRole.Admin,
            CreatedAt = SeedDate,
        });
    }

    private static void SeedBoxTypes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BoxType>().HasData(
            new BoxType
            {
                Id = MaleBoxId,
                Name = "البوكس الرجالي",
                NameEn = "Men's Box",
                Slug = "male-box",
                Gender = Gender.Male,
                BasePrice = 200,
                ImageUrl = "/assets/images/box-male.webp",
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate,
            },
            new BoxType
            {
                Id = FemaleBoxId,
                Name = "البوكس الحريمي",
                NameEn = "Women's Box",
                Slug = "female-box",
                Gender = Gender.Female,
                BasePrice = 200,
                ImageUrl = "/assets/images/box-female.webp",
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate,
            },
            new BoxType
            {
                Id = CoupleBoxId,
                Name = "بوكس لأجلكما",
                NameEn = "Couple's Box",
                Slug = "couple-box",
                Gender = Gender.Couple,
                BasePrice = 350,
                ImageUrl = "/assets/images/box-couple.webp",
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate,
            }
        );
    }

    private static void SeedBoxSlots(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BoxSlot>().HasData(
            // Male box: watch, wallet, mug, necklace, ring
            new BoxSlot { Id = Guid.Parse("11111111-0001-0001-0001-000000000001"), BoxTypeId = MaleBoxId, SlotKey = "watch", LabelAr = "ساعة", LabelEn = "Watch", IsRequired = true, SortOrder = 1, FilterGender = Gender.Male },
            new BoxSlot { Id = Guid.Parse("11111111-0001-0001-0001-000000000002"), BoxTypeId = MaleBoxId, SlotKey = "wallet", LabelAr = "محفظة", LabelEn = "Wallet", IsRequired = true, SortOrder = 2, FilterGender = Gender.Male },
            new BoxSlot { Id = Guid.Parse("11111111-0001-0001-0001-000000000003"), BoxTypeId = MaleBoxId, SlotKey = "mug", LabelAr = "مج", LabelEn = "Mug", IsRequired = true, SortOrder = 3, FilterGender = Gender.Male },
            new BoxSlot { Id = Guid.Parse("11111111-0001-0001-0001-000000000004"), BoxTypeId = MaleBoxId, SlotKey = "necklace", LabelAr = "سلسلة", LabelEn = "Necklace", IsRequired = true, SortOrder = 4, FilterGender = Gender.Male },
            new BoxSlot { Id = Guid.Parse("11111111-0001-0001-0001-000000000005"), BoxTypeId = MaleBoxId, SlotKey = "ring", LabelAr = "خاتم", LabelEn = "Ring", IsRequired = true, SortOrder = 5, FilterGender = Gender.Male },

            // Female box: watch, wallet, mug, necklace, ring
            new BoxSlot { Id = Guid.Parse("22222222-0002-0002-0002-000000000001"), BoxTypeId = FemaleBoxId, SlotKey = "watch", LabelAr = "ساعة", LabelEn = "Watch", IsRequired = true, SortOrder = 1, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("22222222-0002-0002-0002-000000000002"), BoxTypeId = FemaleBoxId, SlotKey = "wallet", LabelAr = "محفظة", LabelEn = "Wallet", IsRequired = true, SortOrder = 2, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("22222222-0002-0002-0002-000000000003"), BoxTypeId = FemaleBoxId, SlotKey = "mug", LabelAr = "مج", LabelEn = "Mug", IsRequired = true, SortOrder = 3, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("22222222-0002-0002-0002-000000000004"), BoxTypeId = FemaleBoxId, SlotKey = "necklace", LabelAr = "عقد", LabelEn = "Necklace", IsRequired = true, SortOrder = 4, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("22222222-0002-0002-0002-000000000005"), BoxTypeId = FemaleBoxId, SlotKey = "ring", LabelAr = "خاتم", LabelEn = "Ring", IsRequired = true, SortOrder = 5, FilterGender = Gender.Female },

            // Couple box: watch (×2), wallet, mug (×2), necklace, ring
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000001"), BoxTypeId = CoupleBoxId, SlotKey = "watch", LabelAr = "ساعة له", LabelEn = "Watch for Him", IsRequired = true, SortOrder = 1, FilterGender = Gender.Male },
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000002"), BoxTypeId = CoupleBoxId, SlotKey = "watch", LabelAr = "ساعة لها", LabelEn = "Watch for Her", IsRequired = true, SortOrder = 2, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000003"), BoxTypeId = CoupleBoxId, SlotKey = "wallet", LabelAr = "محفظة", LabelEn = "Wallet", IsRequired = true, SortOrder = 3 },
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000004"), BoxTypeId = CoupleBoxId, SlotKey = "mug", LabelAr = "مج له", LabelEn = "Mug for Him", IsRequired = true, SortOrder = 4, FilterGender = Gender.Male },
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000005"), BoxTypeId = CoupleBoxId, SlotKey = "mug", LabelAr = "مج لها", LabelEn = "Mug for Her", IsRequired = true, SortOrder = 5, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000006"), BoxTypeId = CoupleBoxId, SlotKey = "necklace", LabelAr = "عقد", LabelEn = "Necklace", IsRequired = true, SortOrder = 6, FilterGender = Gender.Female },
            new BoxSlot { Id = Guid.Parse("33333333-0003-0003-0003-000000000007"), BoxTypeId = CoupleBoxId, SlotKey = "ring", LabelAr = "خاتم", LabelEn = "Ring", IsRequired = true, SortOrder = 7 }
        );
    }

    private static void SeedProducts(ModelBuilder modelBuilder)
    {
        var products = new List<Product>();

        // ── Watches (5/6 customizable = ~83%) ──
        products.AddRange([
            P("aaaa0001-0001-0001-0001-000000000001", "ساعة ذهبية كلاسيك رجالي", "Classic Gold Men's Watch", "men-classic-gold-watch", "ساعة رجالي ذهبية بتصميم كلاسيكي أنيق", "Elegant men's gold watch with a classic design", 450, "watch", Gender.Male, true),
            P("aaaa0001-0001-0001-0001-000000000002", "ساعة سوداء ستيل رجالي", "Black Steel Men's Watch", "men-black-steel-watch", "ساعة رجالي بإطار أسود من الستانلس ستيل", "Men's watch with a black stainless steel frame", 400, "watch", Gender.Male, true),
            P("aaaa0001-0001-0001-0001-000000000003", "ساعة فضية رياضية رجالي", "Silver Sport Men's Watch", "men-silver-sport-watch", "ساعة رجالي رياضية فضية اللون", "Silver-toned sporty men's watch", 380, "watch", Gender.Male),
            P("aaaa0001-0001-0001-0001-000000000004", "ساعة روز جولد نسائي", "Rose Gold Women's Watch", "women-rose-gold-watch", "ساعة نسائي بلون روز جولد راقي", "Refined women's watch in rose gold", 420, "watch", Gender.Female, true),
            P("aaaa0001-0001-0001-0001-000000000005", "ساعة مينيمال نسائي", "Minimal Women's Watch", "women-minimal-watch", "ساعة نسائي بتصميم بسيط وأنيق", "Women's watch with a sleek minimal design", 350, "watch", Gender.Female, true),
            P("aaaa0001-0001-0001-0001-000000000006", "ساعة لؤلؤية نسائي", "Pearl Women's Watch", "women-pearl-watch", "ساعة نسائي بسوار لؤلؤي فاخر", "Luxurious women's watch with a pearl bracelet", 480, "watch", Gender.Female, true, 0),
        ]);

        // ── Wallets (5/6 customizable) ──
        products.AddRange([
            P("aaaa0002-0002-0002-0002-000000000001", "محفظة جلد بني رجالي", "Brown Leather Men's Wallet", "men-brown-leather-wallet", "محفظة رجالي من الجلد الطبيعي البني", "Men's wallet made of genuine brown leather", 280, "wallet", Gender.Male, true),
            P("aaaa0002-0002-0002-0002-000000000002", "محفظة سليم سوداء رجالي", "Black Slim Men's Wallet", "men-black-slim-wallet", "محفظة رجالي رفيعة بلون أسود أنيق", "Slim men's wallet in elegant black", 250, "wallet", Gender.Male, true),
            P("aaaa0002-0002-0002-0002-000000000003", "محفظة كلاسيك رجالي", "Classic Men's Wallet", "men-classic-wallet", "محفظة رجالي كلاسيكية بجيوب متعددة", "Classic men's wallet with multiple compartments", 300, "wallet", Gender.Male, false, 0),
            P("aaaa0002-0002-0002-0002-000000000004", "محفظة وردية نسائي", "Pink Women's Wallet", "women-pink-wallet", "محفظة نسائي بلون وردي جذاب", "Women's wallet in an attractive pink color", 260, "wallet", Gender.Female, true),
            P("aaaa0002-0002-0002-0002-000000000005", "محفظة بيج نسائي", "Beige Women's Wallet", "women-beige-wallet", "محفظة نسائي بلون بيج كلاسيكي", "Women's wallet in classic beige", 270, "wallet", Gender.Female, true),
            P("aaaa0002-0002-0002-0002-000000000006", "محفظة ذهبية نسائي", "Gold Women's Wallet", "women-gold-wallet", "محفظة نسائي بلمسة ذهبية أنيقة", "Women's wallet with an elegant gold accent", 290, "wallet", Gender.Female, true),
        ]);

        // ── Mugs (5/6 customizable) ──
        products.AddRange([
            P("aaaa0003-0003-0003-0003-000000000001", "مج أسود رجالي", "Black Men's Mug", "men-black-mug", "مج أسود بتصميم رجالي مميز", "Black mug with a distinctive men's design", 120, "mug", Gender.Male, true),
            P("aaaa0003-0003-0003-0003-000000000002", "مج رمادي رجالي", "Grey Men's Mug", "men-grey-mug", "مج رمادي بلمسة عصرية", "Grey mug with a modern touch", 120, "mug", Gender.Male, true),
            P("aaaa0003-0003-0003-0003-000000000003", "مج كحلي رجالي", "Navy Men's Mug", "men-navy-mug", "مج بلون كحلي أنيق", "Elegant navy-colored mug", 130, "mug", Gender.Male, true),
            P("aaaa0003-0003-0003-0003-000000000004", "مج وردي نسائي", "Pink Women's Mug", "women-pink-mug", "مج وردي بتصميم ناعم", "Pink mug with a soft design", 120, "mug", Gender.Female, true),
            P("aaaa0003-0003-0003-0003-000000000005", "مج مرمري نسائي", "Marble Women's Mug", "women-marble-mug", "مج بتصميم مرمري فاخر", "Mug with a luxurious marble design", 140, "mug", Gender.Female, true),
            P("aaaa0003-0003-0003-0003-000000000006", "مج فلورال نسائي", "Floral Women's Mug", "women-floral-mug", "مج بنقشة زهور رقيقة", "Mug with a delicate floral pattern", 130, "mug", Gender.Female, false, 0),
        ]);

        // ── Necklaces (5/6 customizable) ──
        products.AddRange([
            P("aaaa0004-0004-0004-0004-000000000001", "سلسلة فضية رجالي", "Silver Men's Chain", "men-silver-chain", "سلسلة رجالي من الفضة الخالصة", "Men's chain made of pure silver", 220, "necklace", Gender.Male, true),
            P("aaaa0004-0004-0004-0004-000000000002", "سلسلة ستيل رجالي", "Steel Men's Chain", "men-steel-chain", "سلسلة رجالي من الستانلس ستيل", "Men's stainless steel chain", 180, "necklace", Gender.Male, false, 0),
            P("aaaa0004-0004-0004-0004-000000000003", "سلسلة مينيمال رجالي", "Minimal Men's Chain", "men-minimal-chain", "سلسلة رجالي بتصميم بسيط", "Men's chain with a minimal design", 200, "necklace", Gender.Male, true),
            P("aaaa0004-0004-0004-0004-000000000004", "عقد قلب نسائي", "Heart Women's Necklace", "women-heart-necklace", "عقد نسائي بتعليقة قلب رقيقة", "Women's necklace with a dainty heart pendant", 250, "necklace", Gender.Female, true),
            P("aaaa0004-0004-0004-0004-000000000005", "عقد لؤلؤ نسائي", "Pearl Women's Necklace", "women-pearl-necklace", "عقد نسائي بلؤلؤ طبيعي", "Women's necklace with natural pearls", 320, "necklace", Gender.Female, true),
            P("aaaa0004-0004-0004-0004-000000000006", "عقد ذهبي نسائي", "Gold Women's Pendant", "women-gold-pendant", "عقد نسائي بتعليقة ذهبية أنيقة", "Women's necklace with an elegant gold pendant", 280, "necklace", Gender.Female, true),
        ]);

        // ── Rings (4/6 customizable) ──
        products.AddRange([
            P("aaaa0005-0005-0005-0005-000000000001", "خاتم تيتانيوم رجالي", "Titanium Men's Ring", "men-titanium-ring", "خاتم رجالي من التيتانيوم المتين", "Durable men's titanium ring", 200, "ring", Gender.Male, true),
            P("aaaa0005-0005-0005-0005-000000000002", "خاتم فضي رجالي", "Silver Men's Ring", "men-silver-ring", "خاتم رجالي فضي بتصميم كلاسيكي", "Classic silver men's ring", 180, "ring", Gender.Male, false, 0),
            P("aaaa0005-0005-0005-0005-000000000003", "خاتم أسود رجالي", "Black Men's Ring", "men-black-ring", "خاتم رجالي أسود أنيق", "Elegant black men's ring", 190, "ring", Gender.Male, true),
            P("aaaa0005-0005-0005-0005-000000000004", "خاتم ألماس نسائي", "Diamond Women's Ring", "women-diamond-ring", "خاتم نسائي مرصع بالألماس", "Women's ring studded with diamonds", 350, "ring", Gender.Female, true),
            P("aaaa0005-0005-0005-0005-000000000005", "خاتم ذهبي نسائي", "Gold Women's Ring", "women-gold-ring", "خاتم نسائي ذهبي رقيق", "Delicate gold women's ring", 280, "ring", Gender.Female, true),
            P("aaaa0005-0005-0005-0005-000000000006", "خاتم فضي نسائي", "Silver Women's Ring", "women-silver-ring", "خاتم نسائي فضي بتصميم مميز", "Silver women's ring with a unique design", 220, "ring", Gender.Female, false, 0),
        ]);

        modelBuilder.Entity<Product>().HasData(products);
    }

    private static void SeedCustomizationPrices(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CategoryCustomizationPrice>().HasData(
            new CategoryCustomizationPrice { Id = Guid.Parse("cc000000-0000-0000-0000-000000000001"), Category = "watch", Price = 50 },
            new CategoryCustomizationPrice { Id = Guid.Parse("cc000000-0000-0000-0000-000000000002"), Category = "wallet", Price = 40 },
            new CategoryCustomizationPrice { Id = Guid.Parse("cc000000-0000-0000-0000-000000000003"), Category = "mug", Price = 30 },
            new CategoryCustomizationPrice { Id = Guid.Parse("cc000000-0000-0000-0000-000000000004"), Category = "necklace", Price = 45 },
            new CategoryCustomizationPrice { Id = Guid.Parse("cc000000-0000-0000-0000-000000000005"), Category = "ring", Price = 35 }
        );
    }

    private static Product P(string id, string name, string nameEn, string slug, string desc, string descEn, decimal price, string category, Gender gender, bool isCustomizable = false, int stockQuantity = 25) => new()
    {
        Id = Guid.Parse(id),
        Name = name,
        NameEn = nameEn,
        Slug = slug,
        Description = desc,
        DescriptionEn = descEn,
        Price = price,
        ImageUrl = $"/assets/mock-products/{category}/{slug}.webp",
        Category = category,
        Gender = gender,
        IsActive = true,
        IsStandalone = true,
        IsBuilderItem = true,
        IsCustomizable = isCustomizable,
        StockQuantity = stockQuantity,
        CreatedAt = SeedDate,
        UpdatedAt = SeedDate,
    };

    private static void SeedPromotions(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Promotion>().HasData(
            // Category-wide: 15% off all watches
            new Promotion
            {
                Id = Guid.Parse("bb000001-0000-0000-0000-000000000001"),
                Name = "خصم على الساعات",
                NameEn = "Watch Sale",
                DiscountType = DiscountType.Percentage,
                Value = 15,
                StartDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true,
                Category = "watch",
                CreatedAt = SeedDate
            },
            // Product-specific: 20% off Rose Gold Women's Watch
            new Promotion
            {
                Id = Guid.Parse("bb000001-0000-0000-0000-000000000002"),
                Name = "عرض خاص على ساعة روز جولد",
                NameEn = "Rose Gold Watch Deal",
                DiscountType = DiscountType.Percentage,
                Value = 20,
                StartDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true,
                ProductId = Guid.Parse("aaaa0001-0001-0001-0001-000000000004"),
                CreatedAt = SeedDate
            },
            // Fixed discount: 30 EGP off all mugs
            new Promotion
            {
                Id = Guid.Parse("bb000001-0000-0000-0000-000000000003"),
                Name = "خصم على المجات",
                NameEn = "Mug Discount",
                DiscountType = DiscountType.Fixed,
                Value = 30,
                StartDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true,
                Category = "mug",
                CreatedAt = SeedDate
            },
            // Inactive promotion (for testing)
            new Promotion
            {
                Id = Guid.Parse("bb000001-0000-0000-0000-000000000004"),
                Name = "عرض الصيف المنتهي",
                NameEn = "Expired Summer Sale",
                DiscountType = DiscountType.Percentage,
                Value = 25,
                StartDate = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2024, 9, 30, 23, 59, 59, DateTimeKind.Utc),
                IsActive = false,
                Category = "necklace",
                CreatedAt = SeedDate
            }
        );
    }

    private static void SeedCoupons(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Coupon>().HasData(
            // 10% off any order
            new Coupon
            {
                Id = Guid.Parse("cc000001-0000-0000-0000-000000000001"),
                Code = "WELCOME10",
                DiscountType = DiscountType.Percentage,
                Value = 10,
                MaxUses = 100,
                UsedCount = 0,
                ExpirationDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true,
                CreatedAt = SeedDate
            },
            // Fixed 50 EGP off, min order 300
            new Coupon
            {
                Id = Guid.Parse("cc000001-0000-0000-0000-000000000002"),
                Code = "SAVE50",
                DiscountType = DiscountType.Fixed,
                Value = 50,
                MaxUses = 50,
                UsedCount = 0,
                ExpirationDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true,
                MinOrderAmount = 300,
                CreatedAt = SeedDate
            },
            // 20% off, limited uses
            new Coupon
            {
                Id = Guid.Parse("cc000001-0000-0000-0000-000000000003"),
                Code = "VIP20",
                DiscountType = DiscountType.Percentage,
                Value = 20,
                MaxUses = 10,
                UsedCount = 7,
                ExpirationDate = new DateTime(2026, 6, 30, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true,
                MinOrderAmount = 500,
                CreatedAt = SeedDate
            },
            // Expired coupon (for testing)
            new Coupon
            {
                Id = Guid.Parse("cc000001-0000-0000-0000-000000000004"),
                Code = "EXPIRED25",
                DiscountType = DiscountType.Percentage,
                Value = 25,
                MaxUses = 50,
                UsedCount = 50,
                ExpirationDate = new DateTime(2024, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = false,
                CreatedAt = SeedDate
            }
        );
    }
}
