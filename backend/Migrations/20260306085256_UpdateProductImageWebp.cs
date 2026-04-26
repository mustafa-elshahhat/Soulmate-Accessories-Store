using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoulmateStore.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductImageWebp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/men-classic-gold-watch.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/men-black-steel-watch.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/men-silver-sport-watch.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/women-rose-gold-watch.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/women-minimal-watch.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/women-pearl-watch.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/men-brown-leather-wallet.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/men-black-slim-wallet.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/men-classic-wallet.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/women-pink-wallet.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/women-beige-wallet.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/women-gold-wallet.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/men-black-mug.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/men-grey-mug.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/men-navy-mug.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/women-pink-mug.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/women-marble-mug.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/women-floral-mug.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/men-silver-chain.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/men-steel-chain.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/men-minimal-chain.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/women-heart-necklace.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/women-pearl-necklace.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/women-gold-pendant.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/men-titanium-ring.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/men-silver-ring.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/men-black-ring.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/women-diamond-ring.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/women-gold-ring.webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/women-silver-ring.webp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/men-classic-gold-watch.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/men-black-steel-watch.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/men-silver-sport-watch.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/women-rose-gold-watch.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/women-minimal-watch.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0001-0001-0001-0001-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/watch/women-pearl-watch.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/men-brown-leather-wallet.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/men-black-slim-wallet.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/men-classic-wallet.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/women-pink-wallet.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/women-beige-wallet.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0002-0002-0002-0002-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/wallet/women-gold-wallet.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/men-black-mug.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/men-grey-mug.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/men-navy-mug.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/women-pink-mug.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/women-marble-mug.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0003-0003-0003-0003-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/mug/women-floral-mug.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/men-silver-chain.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/men-steel-chain.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/men-minimal-chain.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/women-heart-necklace.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/women-pearl-necklace.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0004-0004-0004-0004-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/necklace/women-gold-pendant.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000001"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/men-titanium-ring.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000002"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/men-silver-ring.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000003"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/men-black-ring.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000004"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/women-diamond-ring.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000005"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/women-gold-ring.jpg");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("aaaa0005-0005-0005-0005-000000000006"),
                column: "ImageUrl",
                value: "/assets/mock-products/ring/women-silver-ring.jpg");
        }
    }
}
