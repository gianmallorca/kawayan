using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kawayan.API.Migrations;

public partial class RemoveSiteSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "SiteSettings");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "SiteSettings",
            columns: table => new
            {
                Key = table.Column<string>(type: "nvarchar(450)", nullable: false),
                Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SiteSettings", x => x.Key);
            });
    }
}
