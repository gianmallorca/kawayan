using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kawayan.API.Migrations;

public partial class AddArticleAuthorAndImageDescription : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "AuthorFullName",
            table: "Articles",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "ImageDescription",
            table: "Articles",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "AuthorFullName", table: "Articles");
        migrationBuilder.DropColumn(name: "ImageDescription", table: "Articles");
    }
}
