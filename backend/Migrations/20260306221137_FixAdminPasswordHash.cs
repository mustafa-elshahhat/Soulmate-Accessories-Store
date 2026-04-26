using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class FixAdminPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-0123-defa-234567890123"),
                column: "PasswordHash",
                value: "$2a$11$9Z5R6K39Y4AWgmB6aFyvh.CjYm6EEESBzyuBTGQrguHhFa48c642S");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-0123-defa-234567890123"),
                column: "PasswordHash",
                value: "$2a$11$ZYFKOP4eBiJBangTJim4m.o90GXRsWCmGJbCMbXEUbC5RbGOOVBdS");
        }
    }
}
