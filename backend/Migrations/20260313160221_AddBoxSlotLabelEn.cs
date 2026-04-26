using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class AddBoxSlotLabelEn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LabelEn",
                table: "BoxSlots",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000001"),
                column: "LabelEn",
                value: "Watch");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000002"),
                column: "LabelEn",
                value: "Wallet");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000003"),
                column: "LabelEn",
                value: "Mug");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000004"),
                column: "LabelEn",
                value: "Necklace");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("11111111-0001-0001-0001-000000000005"),
                column: "LabelEn",
                value: "Ring");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000001"),
                column: "LabelEn",
                value: "Watch");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000002"),
                column: "LabelEn",
                value: "Wallet");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000003"),
                column: "LabelEn",
                value: "Mug");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000004"),
                column: "LabelEn",
                value: "Necklace");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("22222222-0002-0002-0002-000000000005"),
                column: "LabelEn",
                value: "Ring");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000001"),
                column: "LabelEn",
                value: "Watch for Him");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000002"),
                column: "LabelEn",
                value: "Watch for Her");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000003"),
                column: "LabelEn",
                value: "Wallet");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000004"),
                column: "LabelEn",
                value: "Mug for Him");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000005"),
                column: "LabelEn",
                value: "Mug for Her");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000006"),
                column: "LabelEn",
                value: "Necklace");

            migrationBuilder.UpdateData(
                table: "BoxSlots",
                keyColumn: "Id",
                keyValue: new Guid("33333333-0003-0003-0003-000000000007"),
                column: "LabelEn",
                value: "Ring");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LabelEn",
                table: "BoxSlots");
        }
    }
}
