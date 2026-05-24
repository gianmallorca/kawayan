using Microsoft.EntityFrameworkCore.Migrations;



#nullable disable



namespace kawayan.API.Migrations;



public partial class RemoveServiceSortOrder : Migration

{

    protected override void Up(MigrationBuilder migrationBuilder)

    {

        migrationBuilder.DropColumn(name: "SortOrder", table: "Services");

    }



    protected override void Down(MigrationBuilder migrationBuilder)

    {

        migrationBuilder.AddColumn<int>(

            name: "SortOrder",

            table: "Services",

            type: "int",

            nullable: false,

            defaultValue: 0);

    }

}

