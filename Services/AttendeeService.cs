using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;
using System.Transactions;

namespace MebToplantiTakip.Services
{
    public class AttendeeService(MebToplantiTakipContext context, UserService userService, MeetingService meetingService)
    {
        public async Task<Attendee> AddAttendee (AttendeeDto attendee)
        {
            var user = await userService.GetUserById(attendee.UserId);
            if (user == null) 
            {
                throw new Exception("Kullanıcı Bulunamadı");
            }
            var meeting = await meetingService.GetMeetingById(attendee.MeetingId);
            if (meeting == null)
            {
                throw new Exception("Toplantı Bulunamadı");
            }
            using var scope = new System.Transactions.TransactionScope(System.Transactions.TransactionScopeAsyncFlowOption.Enabled);
            var existingAttendee = await context.Attendees
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == attendee.UserId && a.MeetingId == attendee.MeetingId);
            if (existingAttendee != null)
            {
                throw new Exception("Kullanıcının bu toplantıda kaydı var.");
            }
            var createdAtendee = new Attendee
            {
                MeetingId = attendee.MeetingId,
                UserId = attendee.UserId
            };  
            await context.Attendees.AddAsync(createdAtendee);
            await context.SaveChangesAsync();
            scope.Complete();
            return createdAtendee;
        }
      
      
        public async Task<List<Attendee>> GetAttendees ()
        {
           return await context.Attendees.ToListAsync();
        }
        public async Task<List<Meeting>> GetUserMeetings(int userId)
        {
            return await context.Attendees.AsNoTracking()
                .Where(a => a.UserId == userId)
                .Join(context.Meetings,
                    attendee => attendee.MeetingId,
                    meeting => meeting.MeetingId,
                    (attendee, meeting) => meeting)
                .ToListAsync();
        }

        
        public async Task<List<User>> GetMeetingAttendees(int meetingId)
        {
            return await context.Attendees.AsNoTracking()
                .Where(a => a.MeetingId == meetingId)
                .Join(context.Users,
                    attendee => attendee.UserId,
                    user => user.UserId,
                    (attendee, user) => user)
                .ToListAsync();
        }

    }
}
