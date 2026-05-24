using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kawayan.API.Migrations
{
    public partial class StructuredCompanyAddress : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Region",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "CompanyDetails",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "CompanyDetails",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE CompanyDetails SET Street = Address WHERE (Street = '' OR Street IS NULL) AND Address IS NOT NULL AND Address <> ''");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "CompanyDetails");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "CompanyDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                @"UPDATE CompanyDetails SET Address = 
                    LTRIM(RTRIM(CONCAT(Street, CASE WHEN City <> '' THEN ', ' + City ELSE '' END,
                    CASE WHEN Province <> '' THEN ', ' + Province ELSE '' END,
                    CASE WHEN Region <> '' THEN ', ' + Region ELSE '' END,
                    CASE WHEN Country <> '' THEN ', ' + Country ELSE '' END,
                    CASE WHEN PostalCode <> '' THEN ' ' + PostalCode ELSE '' END)))");

            migrationBuilder.DropColumn(name: "Longitude", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "Latitude", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "PostalCode", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "Country", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "Region", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "Province", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "City", table: "CompanyDetails");
            migrationBuilder.DropColumn(name: "Street", table: "CompanyDetails");
        }
    }
}
