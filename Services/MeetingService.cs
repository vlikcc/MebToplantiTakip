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
 

    public class MeetingService
    {
        private readonly MebToplantiTakipContext _context;
        private readonly FileService _fileService;

        public MeetingService(MebToplantiTakipContext context, FileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<Meeting> CreateMeeting(MeetingDto meeting,List<IFormFile> files)
        {
            if (meeting == null)
                throw new ArgumentNullException(nameof(meeting), "Toplantı bilgileri boş olamaz.");

            // LocationId varsa mevcut Location'ı bul
            Location location = null;
            if (meeting.LocationId.HasValue)
            {
                location = await _context.Locations.FindAsync(meeting.LocationId.Value);
            }

            var createdMeeting = new Meeting
            {
                Title = meeting.Title,
                StartDate = meeting.StartDate,
                EndDate = meeting.EndDate,
                Allday = meeting.Allday,
                Color = meeting.Color,
                Location = location,
                Documents = new List<MeetingDocument>()
            };

            await _context.Meetings.AddAsync(createdMeeting);
            await _context.SaveChangesAsync();

          
            if (files != null && files.Any())
            {
                var uploadedDocuments = await _fileService.UploadFiles(files, createdMeeting.MeetingId);
                createdMeeting.Documents.AddRange(uploadedDocuments);

                _context.Meetings.Update(createdMeeting);
                await _context.SaveChangesAsync();
            }

            return createdMeeting;
        }

        

        public async Task<Meeting?> UpdateMeeting(Meeting meeting)
        {
            if (meeting == null || meeting.MeetingId <= 0)
                return null;

            var existingMeeting = await _context.Meetings.FindAsync(meeting.MeetingId);
            if (existingMeeting == null)
                return null;

            _context.Entry(existingMeeting).State = EntityState.Detached; // Veriyi izlemeyi kapat
            _context.Meetings.Update(meeting);
            await _context.SaveChangesAsync();

            return meeting;
        }

        public async Task<bool> DeleteMeeting(int meetingId)
        {
            var meeting = await _context.Meetings.Include(m => m.Documents)
                                                 .FirstOrDefaultAsync(m => m.MeetingId == meetingId);

            if (meeting == null)
                return false;

           
            _context.MeetingDocuments.RemoveRange(meeting.Documents);
            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Meeting?> GetMeetingById(int meetingId)
        {
            return await _context.Meetings.Include(m => m.Documents)
                                          .FirstOrDefaultAsync(m => m.MeetingId == meetingId);
        }

        public async Task<List<Meeting>> GetAllMeetings()
        {
            return await _context.Meetings.AsNoTracking()
                                          .Include(m => m.Documents)
                                          .ToListAsync();
        }

        // Dokümana ID'sine göre erişim
        public async Task<MeetingDocument> GetDocumentById(int id)
        {
            return await _context.MeetingDocuments.FindAsync(id);
        }

        // Doküman silme
        public async Task<bool> DeleteDocument(int documentId)
        {
            var document = await _context.MeetingDocuments.FindAsync(documentId);
            if (document == null)
                return false;

            _context.MeetingDocuments.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
