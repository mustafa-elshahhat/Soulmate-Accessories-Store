using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class SeedCustomizationData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "CategoryCustomizationPrices",
                columns: new[] { "Id", "Category", "Price" },
                values: new object[,]
                {
                    { new Guid("cc000000-0000-0000-0000-000000000001"), "watch", 50m },
                    { new Guid("cc000000-0000-0000-0000-000000000002"), "wallet", 40m },
                    { new Guid("cc000000-0000-0000-0000-000000000003"), "mug", 30m },
                    { new Guid("cc000000-0000-0000-0000-000000000004"), "necklace", 45m },
                    { new Guid("cc000000-0000-0000-0000-000000000005"), "ring", 35m }
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"),
                column: "IsCustomizable",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"),
                column: "IsCustomizable",
                value: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CategoryCustomizationPrices",
                keyColumn: "Id",
                keyValue: new Guid("cc000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "CategoryCustomizationPrices",
                keyColumn: "Id",
                keyValue: new Guid("cc000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "CategoryCustomizationPrices",
                keyColumn: "Id",
                keyValue: new Guid("cc000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "CategoryCustomizationPrices",
                keyColumn: "Id",
                keyValue: new Guid("cc000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "CategoryCustomizationPrices",
                keyColumn: "Id",
                keyValue: new Guid("cc000000-0000-0000-0000-000000000005"));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"),
                column: "IsCustomizable",
                value: false);
        }
    }
}
