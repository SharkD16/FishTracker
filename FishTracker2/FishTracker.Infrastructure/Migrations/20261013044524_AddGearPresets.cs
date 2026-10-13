using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FishTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGearPresets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Gear_UserId",
                table: "Gear");

            migrationBuilder.AddColumn<bool>(
                name: "IsEquipped",
                table: "Gear",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PresetName",
                table: "Gear",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Gear_UserId",
                table: "Gear",
                column: "UserId",
                unique: true,
                filter: "\"IsEquipped\" = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Gear_UserId",
                table: "Gear");

            migrationBuilder.DropColumn(
                name: "IsEquipped",
                table: "Gear");

            migrationBuilder.DropColumn(
                name: "PresetName",
                table: "Gear");

            migrationBuilder.CreateIndex(
                name: "IX_Gear_UserId",
                table: "Gear",
                column: "UserId");
        }
    }
}
