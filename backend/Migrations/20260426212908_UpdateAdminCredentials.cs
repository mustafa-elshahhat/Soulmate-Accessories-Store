using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-0123-defa-234567890123"),
                column: "Email",
                value: "admin@soulmate.com");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-0123-defa-234567890123"),
                column: "Email",
                value: "admin@soulmate-store.com");
        }
    }
}
