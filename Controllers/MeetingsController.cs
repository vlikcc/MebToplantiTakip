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
