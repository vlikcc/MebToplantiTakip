using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Services
{
    public class MeetingService(MebToplantiTakipContext context)
    {
       

        public async Task<Meeting> CreateMeeting (MeetingDto meeting)
        {
            var createdMeeting = new Meeting
            {
                Title = meeting.Title,
                StartDate = meeting.StartDate,
                EndDate = meeting.EndDate,
                Allday = meeting.Allday,
                Color = meeting.Color,
                Location = new Location
                {
                    Latitude = meeting.Location.Latitude,
                    Longitude = meeting.Location.Longitude,
                    LocationName = meeting.Location.LocationName
                }
            };  
            await context.Meetings.AddAsync(createdMeeting);
            await context.SaveChangesAsync();
            return createdMeeting;
        }

        public async Task<Meeting> UpdateMeeting (Meeting meeting)
        {
            context.Meetings.Update(meeting);
            await context.SaveChangesAsync();
            return meeting;
        }

        public async Task<bool> DeleteMeeting (int meetingId)
        {
            var meeting = await context.Meetings.FindAsync(meetingId);
            if (meeting != null) 
            {
                    context.Remove(meeting);
                await context.SaveChangesAsync ();
                return true;

            }
            return false;
        }

        public async Task<Meeting> GetMeetingById (int meetingId)
        {
            return await context.Meetings.FirstOrDefaultAsync(m=>m.MeetingId == meetingId);
        }
        public async Task<List<Meeting>> GetAllMeetings()
        {
            return await context.Meetings.AsNoTracking().ToListAsync();
        }
    }
}
