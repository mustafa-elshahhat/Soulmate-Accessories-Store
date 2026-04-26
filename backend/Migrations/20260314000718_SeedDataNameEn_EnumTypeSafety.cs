using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class SeedDataNameEn_EnumTypeSafety : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                column: "NameEn",
                value: "Men's Box");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
                column: "NameEn",
                value: "Women's Box");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012"),
                column: "NameEn",
                value: "Couple's Box");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000001"),
                column: "NameEn",
                value: "Cairo");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000002"),
                column: "NameEn",
                value: "Giza");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000003"),
                column: "NameEn",
                value: "Alexandria");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000004"),
                column: "NameEn",
                value: "Dakahlia");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000005"),
                column: "NameEn",
                value: "Beheira");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000006"),
                column: "NameEn",
                value: "Minya");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000007"),
                column: "NameEn",
                value: "Qalyubia");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000008"),
                column: "NameEn",
                value: "Sharqia");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000009"),
                column: "NameEn",
                value: "Gharbia");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000a"),
                column: "NameEn",
                value: "Monufia");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000b"),
                column: "NameEn",
                value: "Kafr El Sheikh");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000c"),
                column: "NameEn",
                value: "Fayoum");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000d"),
                column: "NameEn",
                value: "Beni Suef");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000e"),
                column: "NameEn",
                value: "Assiut");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000f"),
                column: "NameEn",
                value: "Sohag");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000010"),
                column: "NameEn",
                value: "Qena");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000011"),
                column: "NameEn",
                value: "Luxor");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000012"),
                column: "NameEn",
                value: "Aswan");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000013"),
                column: "NameEn",
                value: "Damietta");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000014"),
                column: "NameEn",
                value: "Port Said");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000015"),
                column: "NameEn",
                value: "Ismailia");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000016"),
                column: "NameEn",
                value: "Suez");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000017"),
                column: "NameEn",
                value: "North Sinai");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000018"),
                column: "NameEn",
                value: "South Sinai");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000019"),
                column: "NameEn",
                value: "Matrouh");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000001a"),
                column: "NameEn",
                value: "New Valley");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000001b"),
                column: "NameEn",
                value: "Red Sea");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"),
                column: "NameEn",
                value: "Classic Gold Men's Watch");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"),
                column: "NameEn",
                value: "Black Steel Men's Watch");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000003"),
                column: "NameEn",
                value: "Silver Sport Men's Watch");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"),
                column: "NameEn",
                value: "Rose Gold Women's Watch");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"),
                column: "NameEn",
                value: "Minimal Women's Watch");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"),
                column: "NameEn",
                value: "Pearl Women's Watch");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"),
                column: "NameEn",
                value: "Brown Leather Men's Wallet");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"),
                column: "NameEn",
                value: "Black Slim Men's Wallet");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000003"),
                column: "NameEn",
                value: "Classic Men's Wallet");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"),
                column: "NameEn",
                value: "Pink Women's Wallet");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"),
                column: "NameEn",
                value: "Beige Women's Wallet");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"),
                column: "NameEn",
                value: "Gold Women's Wallet");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"),
                column: "NameEn",
                value: "Black Men's Mug");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"),
                column: "NameEn",
                value: "Grey Men's Mug");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"),
                column: "NameEn",
                value: "Navy Men's Mug");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"),
                column: "NameEn",
                value: "Pink Women's Mug");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"),
                column: "NameEn",
                value: "Marble Women's Mug");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000006"),
                column: "NameEn",
                value: "Floral Women's Mug");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"),
                column: "NameEn",
                value: "Silver Men's Chain");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000002"),
                column: "NameEn",
                value: "Steel Men's Chain");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"),
                column: "NameEn",
                value: "Minimal Men's Chain");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"),
                column: "NameEn",
                value: "Heart Women's Necklace");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"),
                column: "NameEn",
                value: "Pearl Women's Necklace");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"),
                column: "NameEn",
                value: "Gold Women's Pendant");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"),
                column: "NameEn",
                value: "Titanium Men's Ring");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000002"),
                column: "NameEn",
                value: "Silver Men's Ring");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"),
                column: "NameEn",
                value: "Black Men's Ring");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"),
                column: "NameEn",
                value: "Diamond Women's Ring");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"),
                column: "NameEn",
                value: "Gold Women's Ring");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000006"),
                column: "NameEn",
                value: "Silver Women's Ring");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000001"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000002"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000003"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000004"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000005"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000006"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000007"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000008"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000009"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000a"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000b"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000c"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000d"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000e"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000000f"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000010"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000011"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000012"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000013"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000014"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000015"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000016"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000017"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000018"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-000000000019"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000001a"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Governorates",
                keyColumn: "Id",
                keyValue: new Guid("a0000000-0000-0000-0000-00000000001b"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000003"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000003"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000006"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000002"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000002"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"),
                column: "NameEn",
                value: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000006"),
                column: "NameEn",
                value: "");
        }
    }
}
