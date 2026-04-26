using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class ProductCatalogRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000006"));

            migrationBuilder.DeleteData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000006"));

            migrationBuilder.RenameColumn(
                name: "SlotType",
                table: "Products",
                newName: "Category");

            migrationBuilder.RenameIndex(
                name: "IX_Products_SlotType",
                table: "Products",
                newName: "IX_Products_Category");

            migrationBuilder.AddColumn<bool>(
                name: "IsBuilderItem",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000004"),
                column: "SlotKey",
                value: "necklace");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000005"),
                columns: new[] { "LabelAr", "SlotKey" },
                values: new object[] { "خاتم", "ring" });

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000005"),
                columns: new[] { "LabelAr", "SlotKey" },
                values: new object[] { "خاتم", "ring" });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "GalleryJson", "Gender", "ImageUrl", "IsActive", "IsBuilderItem", "IsStandalone", "Name", "Price", "Slug", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("aaaa0001-0001-0001-0001-000000000001"), "watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ساعة رجالي ذهبية بتصميم كلاسيكي أنيق", null, "male", "/assets/mock-products/watch/men-classic-gold-watch.jpg", true, true, true, "ساعة ذهبية كلاسيك رجالي", 450m, "men-classic-gold-watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0001-0001-0001-0001-000000000002"), "watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ساعة رجالي بإطار أسود من الستانلس ستيل", null, "male", "/assets/mock-products/watch/men-black-steel-watch.jpg", true, true, true, "ساعة سوداء ستيل رجالي", 400m, "men-black-steel-watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0001-0001-0001-0001-000000000003"), "watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ساعة رجالي رياضية فضية اللون", null, "male", "/assets/mock-products/watch/men-silver-sport-watch.jpg", true, true, true, "ساعة فضية رياضية رجالي", 380m, "men-silver-sport-watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0001-0001-0001-0001-000000000004"), "watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ساعة نسائي بلون روز جولد راقي", null, "female", "/assets/mock-products/watch/women-rose-gold-watch.jpg", true, true, true, "ساعة روز جولد نسائي", 420m, "women-rose-gold-watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0001-0001-0001-0001-000000000005"), "watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ساعة نسائي بتصميم بسيط وأنيق", null, "female", "/assets/mock-products/watch/women-minimal-watch.jpg", true, true, true, "ساعة مينيمال نسائي", 350m, "women-minimal-watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0001-0001-0001-0001-000000000006"), "watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ساعة نسائي بسوار لؤلؤي فاخر", null, "female", "/assets/mock-products/watch/women-pearl-watch.jpg", true, true, true, "ساعة لؤلؤية نسائي", 480m, "women-pearl-watch", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0002-0002-0002-0002-000000000001"), "wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "محفظة رجالي من الجلد الطبيعي البني", null, "male", "/assets/mock-products/wallet/men-brown-leather-wallet.jpg", true, true, true, "محفظة جلد بني رجالي", 280m, "men-brown-leather-wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0002-0002-0002-0002-000000000002"), "wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "محفظة رجالي رفيعة بلون أسود أنيق", null, "male", "/assets/mock-products/wallet/men-black-slim-wallet.jpg", true, true, true, "محفظة سليم سوداء رجالي", 250m, "men-black-slim-wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0002-0002-0002-0002-000000000003"), "wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "محفظة رجالي كلاسيكية بجيوب متعددة", null, "male", "/assets/mock-products/wallet/men-classic-wallet.jpg", true, true, true, "محفظة كلاسيك رجالي", 300m, "men-classic-wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0002-0002-0002-0002-000000000004"), "wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "محفظة نسائي بلون وردي جذاب", null, "female", "/assets/mock-products/wallet/women-pink-wallet.jpg", true, true, true, "محفظة وردية نسائي", 260m, "women-pink-wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0002-0002-0002-0002-000000000005"), "wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "محفظة نسائي بلون بيج كلاسيكي", null, "female", "/assets/mock-products/wallet/women-beige-wallet.jpg", true, true, true, "محفظة بيج نسائي", 270m, "women-beige-wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0002-0002-0002-0002-000000000006"), "wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "محفظة نسائي بلمسة ذهبية أنيقة", null, "female", "/assets/mock-products/wallet/women-gold-wallet.jpg", true, true, true, "محفظة ذهبية نسائي", 290m, "women-gold-wallet", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0003-0003-0003-0003-000000000001"), "mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مج أسود بتصميم رجالي مميز", null, "male", "/assets/mock-products/mug/men-black-mug.jpg", true, true, true, "مج أسود رجالي", 120m, "men-black-mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0003-0003-0003-0003-000000000002"), "mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مج رمادي بلمسة عصرية", null, "male", "/assets/mock-products/mug/men-grey-mug.jpg", true, true, true, "مج رمادي رجالي", 120m, "men-grey-mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0003-0003-0003-0003-000000000003"), "mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مج بلون كحلي أنيق", null, "male", "/assets/mock-products/mug/men-navy-mug.jpg", true, true, true, "مج كحلي رجالي", 130m, "men-navy-mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0003-0003-0003-0003-000000000004"), "mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مج وردي بتصميم ناعم", null, "female", "/assets/mock-products/mug/women-pink-mug.jpg", true, true, true, "مج وردي نسائي", 120m, "women-pink-mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0003-0003-0003-0003-000000000005"), "mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مج بتصميم مرمري فاخر", null, "female", "/assets/mock-products/mug/women-marble-mug.jpg", true, true, true, "مج مرمري نسائي", 140m, "women-marble-mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0003-0003-0003-0003-000000000006"), "mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مج بنقشة زهور رقيقة", null, "female", "/assets/mock-products/mug/women-floral-mug.jpg", true, true, true, "مج فلورال نسائي", 130m, "women-floral-mug", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0004-0004-0004-0004-000000000001"), "necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "سلسلة رجالي من الفضة الخالصة", null, "male", "/assets/mock-products/necklace/men-silver-chain.jpg", true, true, true, "سلسلة فضية رجالي", 220m, "men-silver-chain", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0004-0004-0004-0004-000000000002"), "necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "سلسلة رجالي من الستانلس ستيل", null, "male", "/assets/mock-products/necklace/men-steel-chain.jpg", true, true, true, "سلسلة ستيل رجالي", 180m, "men-steel-chain", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0004-0004-0004-0004-000000000003"), "necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "سلسلة رجالي بتصميم بسيط", null, "male", "/assets/mock-products/necklace/men-minimal-chain.jpg", true, true, true, "سلسلة مينيمال رجالي", 200m, "men-minimal-chain", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0004-0004-0004-0004-000000000004"), "necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "عقد نسائي بتعليقة قلب رقيقة", null, "female", "/assets/mock-products/necklace/women-heart-necklace.jpg", true, true, true, "عقد قلب نسائي", 250m, "women-heart-necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0004-0004-0004-0004-000000000005"), "necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "عقد نسائي بلؤلؤ طبيعي", null, "female", "/assets/mock-products/necklace/women-pearl-necklace.jpg", true, true, true, "عقد لؤلؤ نسائي", 320m, "women-pearl-necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0004-0004-0004-0004-000000000006"), "necklace", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "عقد نسائي بتعليقة ذهبية أنيقة", null, "female", "/assets/mock-products/necklace/women-gold-pendant.jpg", true, true, true, "عقد ذهبي نسائي", 280m, "women-gold-pendant", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0005-0005-0005-0005-000000000001"), "ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "خاتم رجالي من التيتانيوم المتين", null, "male", "/assets/mock-products/ring/men-titanium-ring.jpg", true, true, true, "خاتم تيتانيوم رجالي", 200m, "men-titanium-ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0005-0005-0005-0005-000000000002"), "ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "خاتم رجالي فضي بتصميم كلاسيكي", null, "male", "/assets/mock-products/ring/men-silver-ring.jpg", true, true, true, "خاتم فضي رجالي", 180m, "men-silver-ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0005-0005-0005-0005-000000000003"), "ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "خاتم رجالي أسود أنيق", null, "male", "/assets/mock-products/ring/men-black-ring.jpg", true, true, true, "خاتم أسود رجالي", 190m, "men-black-ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0005-0005-0005-0005-000000000004"), "ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "خاتم نسائي مرصع بالألماس", null, "female", "/assets/mock-products/ring/women-diamond-ring.jpg", true, true, true, "خاتم ألماس نسائي", 350m, "women-diamond-ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0005-0005-0005-0005-000000000005"), "ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "خاتم نسائي ذهبي رقيق", null, "female", "/assets/mock-products/ring/women-gold-ring.jpg", true, true, true, "خاتم ذهبي نسائي", 280m, "women-gold-ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("aaaa0005-0005-0005-0005-000000000006"), "ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "خاتم نسائي فضي بتصميم مميز", null, "female", "/assets/mock-products/ring/women-silver-ring.jpg", true, true, true, "خاتم فضي نسائي", 220m, "women-silver-ring", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsBuilderItem",
                table: "Products",
                column: "IsBuilderItem");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_IsBuilderItem",
                table: "Products");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000003"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000003"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000006"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000002"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000002"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000006"));

            migrationBuilder.DropColumn(
                name: "IsBuilderItem",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Products",
                newName: "SlotType");

            migrationBuilder.RenameIndex(
                name: "IX_Products_Category",
                table: "Products",
                newName: "IX_Products_SlotType");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000004"),
                column: "SlotKey",
                value: "chain");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000005"),
                columns: new[] { "LabelAr", "SlotKey" },
                values: new object[] { "كبك", "cufflinks" });

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000005"),
                columns: new[] { "LabelAr", "SlotKey" },
                values: new object[] { "إسورة", "bracelet" });

            migrationBuilder.InsertData(
                table: "BoxSlots",
                columns: new[] { "Id", "BoxTypeId", "FilterGender", "IsRequired", "LabelAr", "SlotKey", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("11111111-0001-0001-0001-000000000006"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "male", true, "خاتم", "ring", 6 },
                    { new Guid("22222222-0002-0002-0002-000000000006"), new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901"), "female", true, "حلق", "earrings", 6 }
                });
        }
    }
}
