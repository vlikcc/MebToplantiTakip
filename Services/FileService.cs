using System.IO.Compression;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Services
{
    public class FileService(MebToplantiTakipContext context)
    {
        private readonly string UploadPath = "wwwroot/Uploads";


        public async Task<List<MeetingDocument>> UploadFiles(List<IFormFile> files, int meetingId)
        {
            var meetingDocuments = new List<MeetingDocument>();

            if (files == null || !files.Any())
                throw new ArgumentException("Geçersiz dosya listesi.");

            try
            {
                Directory.CreateDirectory(UploadPath);

                foreach (var file in files)
                {
                    var filePath = Path.Combine(UploadPath, file.FileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var meetingDocument = new MeetingDocument
                    {
                        FileName = file.FileName,
                        FilePath = filePath,
                        MeetingId = meetingId
                    };

                    context.MeetingDocuments.Add(meetingDocument);
                    meetingDocuments.Add(meetingDocument);
                }

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Dosya yüklenirken bir hata oluştu: {ex.Message}");
            }

            return meetingDocuments;
        }

        public async Task<byte[]> DownloadFilesByMeetingId(int meetingId)
        {
            var documents = await context.MeetingDocuments
                                          .Where(d => d.MeetingId == meetingId)
                                          .ToListAsync();

            if (documents == null || !documents.Any())
                throw new FileNotFoundException("Bu toplantıya ait dosya bulunamadı.");

            // ZIP dosyası oluştur
            string zipFilePath = $"wwwroot/uploads/Meeting_{meetingId}_Documents.zip";
            using (var zipArchive = ZipFile.Open(zipFilePath, ZipArchiveMode.Create))
            {
                foreach (var doc in documents)
                {
                    if (File.Exists(doc.FilePath))
                    {
                        zipArchive.CreateEntryFromFile(doc.FilePath, doc.FileName);
                    }
                }
            }

            return await File.ReadAllBytesAsync(zipFilePath);
        }


    }
}
