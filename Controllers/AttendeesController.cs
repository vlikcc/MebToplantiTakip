using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Microsoft.AspNetCore.Mvc;

namespace MebToplantiTakip.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendeesController(AttendeeService attendeeService) : ControllerBase
    {
        [HttpPost("AddAttendee")]
        public async Task<IActionResult> AddAttendee(AttendeeDto attendee)
        {
            var result = await attendeeService.AddAttendee(attendee);
            return Ok(result);
        }

        [HttpGet("UserMeetings/{userId}")]
        public async Task<IActionResult> GetUserMeetings(int userId)
        {
            var meetings = await attendeeService.GetUserMeetings(userId);
            return Ok(meetings);
        }

        [HttpGet("MeetingAttendees/{meetingId}")]
        public async Task<IActionResult> GetMeetingAttendees(int meetingId)
        {
            var attendees = await attendeeService.GetMeetingAttendees(meetingId);
            return Ok(attendees);
        }
    }
} 