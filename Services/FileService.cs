using System.IO.Compression;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace MebToplantiTakip.Services
{
    public class FileService
    {
        private readonly MebToplantiTakipContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadPath;

        public FileService(MebToplantiTakipContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
            _uploadPath = Path.Combine(_environment.WebRootPath, "Uploads");
            // Başlangıçta dizinin varlığını kontrol et ve oluştur
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<List<MeetingDocument>> UploadFiles(List<IFormFile> files, int meetingId)
        {
            var meetingDocuments = new List<MeetingDocument>();

            if (files == null || !files.Any())
                throw new ArgumentException("Geçersiz dosya listesi.");

            try
            {
                // Yükleme dizininin varlığını tekrar kontrol et
                if (!Directory.Exists(_uploadPath))
                {
                    Directory.CreateDirectory(_uploadPath);
                }

                foreach (var file in files)
                {
                    // Dosya adının benzersiz olması için
                    var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(_uploadPath, uniqueFileName);

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

                    _context.MeetingDocuments.Add(meetingDocument);
                    meetingDocuments.Add(meetingDocument);
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Dosya yüklenirken bir hata oluştu: {ex.Message}");
            }

            return meetingDocuments;
        }

        public async Task<byte[]> DownloadFilesByMeetingId(int meetingId)
        {
            var documents = await _context.MeetingDocuments
                                          .Where(d => d.MeetingId == meetingId)
                                          .ToListAsync();

            if (documents == null || !documents.Any())
                throw new FileNotFoundException("Bu toplantıya ait dosya bulunamadı.");

            // ZIP dosyası için geçici bir yol oluştur
            var zipDirectory = Path.Combine(_environment.WebRootPath, "temp");
            if (!Directory.Exists(zipDirectory))
            {
                Directory.CreateDirectory(zipDirectory);
            }

            // ZIP dosyası oluştur
            string zipFileName = $"Meeting_{meetingId}_Documents_{DateTime.Now:yyyyMMddHHmmss}.zip";
            string zipFilePath = Path.Combine(zipDirectory, zipFileName);
            
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

            var zipBytes = await File.ReadAllBytesAsync(zipFilePath);
            
            // Zip dosyasını temizle
            try 
            {
                File.Delete(zipFilePath);
            }
            catch
            {
                // Silme hatası kritik değil, devam et
            }

            return zipBytes;
        }
    }
}
