using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBoxTypeImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                column: "ImageUrl",
                value: "/assets/images/box-male.webp");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
                column: "ImageUrl",
                value: "/assets/images/box-female.webp");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012"),
                column: "ImageUrl",
                value: "/assets/images/box-couple.webp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                column: "ImageUrl",
                value: "/images/box-male.jpg");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
                column: "ImageUrl",
                value: "/images/box-female.jpg");

            migrationBuilder.UpdateData(
                table: "BoxTypes",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012"),
                column: "ImageUrl",
                value: "/images/box-couple.jpg");
        }
    }
}
