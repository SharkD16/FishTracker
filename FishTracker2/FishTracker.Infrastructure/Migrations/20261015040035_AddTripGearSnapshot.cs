using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FishTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripGearSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FishingRod",
                table: "FishingTrips",
                type: "TEXT",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GearPresetName",
                table: "FishingTrips",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Lure",
                table: "FishingTrips",
                type: "TEXT",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FishingRod",
                table: "FishingTrips");

            migrationBuilder.DropColumn(
                name: "GearPresetName",
                table: "FishingTrips");

            migrationBuilder.DropColumn(
                name: "Lure",
                table: "FishingTrips");
        }
    }
}
