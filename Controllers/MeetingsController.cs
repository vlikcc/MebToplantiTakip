using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MebToplantiTakip.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingsController(MeetingService meetingService) : ControllerBase
    {
        [HttpPost("AddMeeting")]
        public async Task<IActionResult> AddMeeting(MeetingDto meeting)
        {
            await meetingService.CreateMeeting(meeting);
            return Ok();
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
            var updatedMeeting= await meetingService.UpdateMeeting(meeting);
            return Ok(updatedMeeting);

        }

        [HttpGet("GetMeetings")]

        public  async Task<IActionResult> GetAllMeetings ()
        {
            var meetings = await meetingService.GetAllMeetings();
            return Ok(meetings);
        }
    }
}
