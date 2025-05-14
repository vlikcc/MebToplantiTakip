using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Controllers
{
   
   

    [Route("api/[controller]")]
    [ApiController]
    public class MeetingsController ( MeetingService meetingService, FileService fileService): ControllerBase
    {
       

       

        [HttpPost("AddMeeting")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Meeting))]
        public async Task<IActionResult> AddMeeting([FromForm] MeetingDto meeting, [FromForm] List<IFormFile> files)
        {
            if (meeting == null)
                return BadRequest("Toplantı bilgileri eksik.");

            try
            {
                var createdMeeting = await meetingService.CreateMeeting(meeting, files);
                return CreatedAtAction(nameof(GetAllMeetings), new { id = createdMeeting.MeetingId }, createdMeeting);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Toplantı oluşturulurken hata oluştu: {ex.Message}");
            }
        }

        [HttpPost("upload-document/{meetingId}")]
        public async Task<IActionResult> UploadDocument(int meetingId, [FromForm] List<IFormFile> files)
        {
            if (files == null || !files.Any())
                return BadRequest("Geçersiz dosya yükleme isteği.");

            try
            {
                var uploadedFiles = await fileService.UploadFiles(files, meetingId);
                return Ok(uploadedFiles);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Dosya yüklenirken hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("download-documents/{meetingId}")]
        public async Task<IActionResult> DownloadDocuments(int meetingId)
        {
            try
            {
                var fileBytes = await fileService.DownloadFilesByMeetingId(meetingId);
                var meetingName = await meetingService.GetMeetingById(meetingId);
                return File(fileBytes, "application/zip", $"{meetingName.Title}_Documents.zip");
            }
            catch (FileNotFoundException)
            {
                return NotFound("Bu toplantıya ait doküman bulunamadı.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Dosya indirilirken hata oluştu: {ex.Message}");
            }
        }

        [HttpGet("download-document/{id}")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            try
            {
                var document = await meetingService.GetDocumentById(id);
                if (document == null)
                    return NotFound("Doküman bulunamadı.");

                if (!System.IO.File.Exists(document.FilePath))
                    return NotFound("Dosya bulunamadı.");

                var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
                var contentType = GetContentType(document.FileName);
                
                return File(fileBytes, contentType, document.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Dosya indirilirken hata oluştu: {ex.Message}");
            }
        }
        
        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }

        [HttpDelete("{meetingId}")]
        public async Task<IActionResult> DeleteMeeting(int meetingId)
        {
            var result = await meetingService.DeleteMeeting(meetingId);
            return result ? NoContent() : NotFound();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMeeting(Meeting meeting)
        {
            var updatedMeeting = await meetingService.UpdateMeeting(meeting);
            return updatedMeeting != null ? Ok(updatedMeeting) : NotFound();
        }

        [HttpGet("GetMeetings")]
        public async Task<IActionResult> GetAllMeetings()
        {
            var meetings = await meetingService.GetAllMeetings();
            return Ok(meetings);
        }

        [HttpGet("{meetingId}")]
        public async Task<IActionResult> GetMeetingById(int meetingId)
        {
            var meeting = await meetingService.GetMeetingById(meetingId);
            return meeting != null ? Ok(meeting) : NotFound();
        }
    }
}
