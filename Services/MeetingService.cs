using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Services
{
    using Microsoft.EntityFrameworkCore;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using MebToplantiTakip.Entities;
 

    public class MeetingService(MebToplantiTakipContext context, FileService fileUploadService)

    {
        
        public async Task<Meeting> CreateMeeting(MeetingDto meeting,List<IFormFile> files)
        {
            if (meeting == null)
                throw new ArgumentNullException(nameof(meeting), "Toplantı bilgileri boş olamaz.");

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
                },
                Documents = new List<MeetingDocument>()
            };

            await context.Meetings.AddAsync(createdMeeting);
            await context.SaveChangesAsync();

          
            if (files != null && files.Any())
            {
                var uploadedDocuments = await fileUploadService.UploadFiles(files, createdMeeting.MeetingId);
                createdMeeting.Documents.AddRange(uploadedDocuments);

                context.Meetings.Update(createdMeeting);
                await context.SaveChangesAsync();
            }

            return createdMeeting;
        }

        

        public async Task<Meeting?> UpdateMeeting(Meeting meeting)
        {
            if (meeting == null || meeting.MeetingId <= 0)
                return null;

            var existingMeeting = await context.Meetings.FindAsync(meeting.MeetingId);
            if (existingMeeting == null)
                return null;

            context.Entry(existingMeeting).State = EntityState.Detached; // Veriyi izlemeyi kapat
            context.Meetings.Update(meeting);
            await context.SaveChangesAsync();

            return meeting;
        }

        public async Task<bool> DeleteMeeting(int meetingId)
        {
            var meeting = await context.Meetings.Include(m => m.Documents)
                                                 .FirstOrDefaultAsync(m => m.MeetingId == meetingId);

            if (meeting == null)
                return false;

           
            context.MeetingDocuments.RemoveRange(meeting.Documents);
            context.Meetings.Remove(meeting);
            await context.SaveChangesAsync();

            return true;
        }

        public async Task<Meeting?> GetMeetingById(int meetingId)
        {
            return await context.Meetings.Include(m => m.Documents)
                                          .FirstOrDefaultAsync(m => m.MeetingId == meetingId);
        }

        public async Task<List<Meeting>> GetAllMeetings()
        {
            return await context.Meetings.AsNoTracking()
                                          .Include(m => m.Documents)
                                          .ToListAsync();
        }
    }
}
