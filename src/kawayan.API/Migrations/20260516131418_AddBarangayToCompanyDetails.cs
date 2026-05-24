using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kawayan.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBarangayToCompanyDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Barangay",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Barangay",
                table: "CompanyDetails");
        }
    }
}
