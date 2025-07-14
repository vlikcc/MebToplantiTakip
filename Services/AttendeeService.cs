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

        public async Task<Attendee> GetAttendeeById(int attendeeId)
        {
            return await context.Attendees.FindAsync(attendeeId);
        }

        public async Task<Attendee> UpdateAttendee(Attendee attendee)
        {
            if (attendee == null || attendee.Id <= 0)
                throw new ArgumentException("Geçersiz katılımcı bilgisi");

            var existingAttendee = await context.Attendees.FindAsync(attendee.Id);
            if (existingAttendee == null)
                throw new Exception("Katılımcı bulunamadı");

            // Kullanıcı ve toplantı varlığını kontrol et
            var user = await userService.GetUserById(attendee.UserId);
            if (user == null)
                throw new Exception("Kullanıcı bulunamadı");

            var meeting = await meetingService.GetMeetingById(attendee.MeetingId);
            if (meeting == null)
                throw new Exception("Toplantı bulunamadı");

            // Aynı kullanıcının aynı toplantıda başka kaydı var mı kontrol et (kendisi hariç)
            var duplicateAttendee = await context.Attendees
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == attendee.UserId && 
                                         a.MeetingId == attendee.MeetingId && 
                                         a.Id != attendee.Id);
            if (duplicateAttendee != null)
                throw new Exception("Kullanıcının bu toplantıda zaten kaydı var.");

            existingAttendee.UserId = attendee.UserId;
            existingAttendee.MeetingId = attendee.MeetingId;

            context.Attendees.Update(existingAttendee);
            await context.SaveChangesAsync();
            return existingAttendee;
        }

        public async Task<bool> DeleteAttendee(int attendeeId)
        {
            var attendee = await context.Attendees.FindAsync(attendeeId);
            if (attendee == null)
                return false;

            context.Attendees.Remove(attendee);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserFromMeeting(int userId, int meetingId)
        {
            var attendee = await context.Attendees
                .FirstOrDefaultAsync(a => a.UserId == userId && a.MeetingId == meetingId);
            
            if (attendee == null)
                return false;

            context.Attendees.Remove(attendee);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Meeting>> GetUserMeetings(int userId)
        {
            return await context.Attendees.AsNoTracking()
                .Where(a => a.UserId == userId)
                .Join(context.Meetings.Include(m => m.Documents),
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

        public async Task<int> GetMeetingAttendeeCount(int meetingId)
        {
            return await context.Attendees
                .Where(a => a.MeetingId == meetingId)
                .CountAsync();
        }

        public async Task<bool> IsUserAttendingMeeting(int userId, int meetingId)
        {
            return await context.Attendees
                .AnyAsync(a => a.UserId == userId && a.MeetingId == meetingId);
        }
    }
}
