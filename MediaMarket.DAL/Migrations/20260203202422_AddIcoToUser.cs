using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMarket.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddIcoToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Ico",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ico",
                table: "Users");
        }
    }
}
