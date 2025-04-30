using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MebToplantiTakip.Controllers
{
   
   

    [Route("api/[controller]")]
    [ApiController]
    public class MeetingsController ( MeetingService meetingService, FileUploadService fileUploadService): ControllerBase
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
                var uploadedFiles = await fileUploadService.UploadFiles(files, meetingId);
                return Ok(uploadedFiles);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Dosya yüklenirken hata oluştu: {ex.Message}");
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
    }
}
