using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class AddProductCustomization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCustomizable",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CategoryCustomizationPrices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryCustomizationPrices", x => x.Id);
                });

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
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000003"),
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
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000003"),
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
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000006"),
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
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000002"),
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
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000002"),
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

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000006"),
                column: "IsCustomizable",
                value: false);

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsCustomizable",
                table: "Products",
                column: "IsCustomizable");

            migrationBuilder.CreateIndex(
                name: "IX_CategoryCustomizationPrices_Category",
                table: "CategoryCustomizationPrices",
                column: "Category",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategoryCustomizationPrices");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsCustomizable",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsCustomizable",
                table: "Products");
        }
    }
}
