using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MebToplantiTakip.Migrations
{
    /// <inheritdoc />
    public partial class AddDownloadUrlToMeetingDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DownloadUrl",
                table: "MeetingDocuments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Mevcut dokümanların URL'lerini güncelle
            migrationBuilder.Sql(@"
                DECLARE @BaseUrl nvarchar(100)
                SET @BaseUrl = 'https://mebtoplantitakip-813955083168.europe-west1.run.app'

                UPDATE MeetingDocuments
                SET DownloadUrl = @BaseUrl + '/api/meetings/download-document/' + CAST(Id as nvarchar(10))
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DownloadUrl",
                table: "MeetingDocuments");
        }
    }
}
