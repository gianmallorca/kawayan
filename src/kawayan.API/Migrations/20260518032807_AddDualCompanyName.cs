using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kawayan.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDualCompanyName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CompanyName",
                table: "CompanyDetails",
                newName: "NameMain");

            migrationBuilder.AddColumn<string>(
                name: "NameBaybayin",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameBaybayin",
                table: "CompanyDetails");

            migrationBuilder.RenameColumn(
                name: "NameMain",
                table: "CompanyDetails",
                newName: "CompanyName");
        }
    }
}
