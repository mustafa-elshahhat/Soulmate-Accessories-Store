using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class AddGovernorates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Addresses");

            migrationBuilder.AddColumn<Guid>(
                name: "GovernorateId",
                table: "Addresses",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Governorates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShippingCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Governorates", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Governorates",
                columns: new[] { "Id", "IsActive", "Name", "ShippingCost" },
                values: new object[,]
                {
                    { new Guid("a0000000-0000-0000-0000-000000000001"), true, "القاهرة", 50m },
                    { new Guid("a0000000-0000-0000-0000-000000000002"), true, "الجيزة", 50m },
                    { new Guid("a0000000-0000-0000-0000-000000000003"), true, "الإسكندرية", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000004"), true, "الدقهلية", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000005"), true, "البحيرة", 65m },
                    { new Guid("a0000000-0000-0000-0000-000000000006"), true, "المنيا", 70m },
                    { new Guid("a0000000-0000-0000-0000-000000000007"), true, "القليوبية", 50m },
                    { new Guid("a0000000-0000-0000-0000-000000000008"), true, "الشرقية", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000009"), true, "الغربية", 60m },
                    { new Guid("a0000000-0000-0000-0000-00000000000a"), true, "المنوفية", 55m },
                    { new Guid("a0000000-0000-0000-0000-00000000000b"), true, "كفر الشيخ", 65m },
                    { new Guid("a0000000-0000-0000-0000-00000000000c"), true, "الفيوم", 65m },
                    { new Guid("a0000000-0000-0000-0000-00000000000d"), true, "بني سويف", 65m },
                    { new Guid("a0000000-0000-0000-0000-00000000000e"), true, "أسيوط", 75m },
                    { new Guid("a0000000-0000-0000-0000-00000000000f"), true, "سوهاج", 75m },
                    { new Guid("a0000000-0000-0000-0000-000000000010"), true, "قنا", 80m },
                    { new Guid("a0000000-0000-0000-0000-000000000011"), true, "الأقصر", 80m },
                    { new Guid("a0000000-0000-0000-0000-000000000012"), true, "أسوان", 85m },
                    { new Guid("a0000000-0000-0000-0000-000000000013"), true, "دمياط", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000014"), true, "بورسعيد", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000015"), true, "الإسماعيلية", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000016"), true, "السويس", 60m },
                    { new Guid("a0000000-0000-0000-0000-000000000017"), true, "شمال سيناء", 80m },
                    { new Guid("a0000000-0000-0000-0000-000000000018"), true, "جنوب سيناء", 85m },
                    { new Guid("a0000000-0000-0000-0000-000000000019"), true, "مطروح", 80m },
                    { new Guid("a0000000-0000-0000-0000-00000000001a"), true, "الوادي الجديد", 90m },
                    { new Guid("a0000000-0000-0000-0000-00000000001b"), true, "البحر الأحمر", 85m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_GovernorateId",
                table: "Addresses",
                column: "GovernorateId");

            migrationBuilder.CreateIndex(
                name: "IX_Governorates_Name",
                table: "Governorates",
                column: "Name",
                unique: true);

            // Fix existing addresses: set GovernorateId to Cairo before adding FK
            migrationBuilder.Sql(
                "UPDATE Addresses SET GovernorateId = 'a0000000-0000-0000-0000-000000000001' WHERE GovernorateId = '00000000-0000-0000-0000-000000000000'");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Governorates_GovernorateId",
                table: "Addresses",
                column: "GovernorateId",
                principalTable: "Governorates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Governorates_GovernorateId",
                table: "Addresses");

            migrationBuilder.DropTable(
                name: "Governorates");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_GovernorateId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "GovernorateId",
                table: "Addresses");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
