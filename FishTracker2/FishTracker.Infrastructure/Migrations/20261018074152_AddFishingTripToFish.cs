using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FishTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFishingTripToFish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FishingTripId",
                table: "Fish",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Fish_FishingTripId",
                table: "Fish",
                column: "FishingTripId");

            migrationBuilder.AddForeignKey(
                name: "FK_Fish_FishingTrips_FishingTripId",
                table: "Fish",
                column: "FishingTripId",
                principalTable: "FishingTrips",
                principalColumn: "FishingTripId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fish_FishingTrips_FishingTripId",
                table: "Fish");

            migrationBuilder.DropIndex(
                name: "IX_Fish_FishingTripId",
                table: "Fish");

            migrationBuilder.DropColumn(
                name: "FishingTripId",
                table: "Fish");
        }
    }
}
