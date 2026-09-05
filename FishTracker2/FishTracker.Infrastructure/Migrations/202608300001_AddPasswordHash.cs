using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using FishTracker.Infrastructure;

#nullable disable

namespace FishTracker.Infrastructure.Migrations;

[DbContext(typeof(FishTrackerDbContext))]
[Migration("202608300001_AddPasswordHash")]
public partial class AddPasswordHash : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Existing pre-authentication accounts cannot be safely converted because no plaintext
        // password exists. An empty hash makes them unable to authenticate until recreated/reset.
        migrationBuilder.AddColumn<string>(
            name: "PasswordHash",
            table: "Users",
            type: "TEXT",
            maxLength: 512,
            nullable: false,
            defaultValue: "");
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn(name: "PasswordHash", table: "Users");
}
