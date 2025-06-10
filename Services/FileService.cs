using System;
using System.IO;
using System.IO.Compression;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace MebToplantiTakip.Services
{
    public class FileService
    {
        private readonly MebToplantiTakipContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly string _uploadPath;

        public FileService(MebToplantiTakipContext context, IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
            _uploadPath = Path.Combine(_environment.WebRootPath, "Uploads");
            
            // Uploads dizininin varlığını kontrol et ve oluştur
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
            
            // Temp dizininin varlığını kontrol et ve oluştur
            var tempPath = Path.Combine(_environment.WebRootPath, "temp");
            if (!Directory.Exists(tempPath))
            {
                Directory.CreateDirectory(tempPath);
            }
            
            // Dizinlere yazma izni ver
            try
            {
                var uploadsInfo = new DirectoryInfo(_uploadPath);
                var tempInfo = new DirectoryInfo(tempPath);
                
                uploadsInfo.Attributes &= ~FileAttributes.ReadOnly;
                tempInfo.Attributes &= ~FileAttributes.ReadOnly;
            }
            catch (Exception ex)
            {
                throw new Exception($"Dizin izinleri ayarlanırken hata oluştu: {ex.Message}");
            }
        }

        private string GenerateDownloadUrl(int documentId)
        {
            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            return $"{baseUrl}/api/meetings/download-document/{documentId}";
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
                    await _context.SaveChangesAsync(); // Önce kaydet ki ID oluşsun

                    meetingDocument.DownloadUrl = GenerateDownloadUrl(meetingDocument.Id);
                    _context.MeetingDocuments.Update(meetingDocument);
                    
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

            // ZIP dosyası için geçici dizin yolunu oluştur
            var tempDirectory = Path.Combine(_environment.WebRootPath, "temp");
            
            // Temp dizininin varlığını tekrar kontrol et
            if (!Directory.Exists(tempDirectory))
            {
                try
            {
                    Directory.CreateDirectory(tempDirectory);
                    var tempInfo = new DirectoryInfo(tempDirectory);
                    tempInfo.Attributes &= ~FileAttributes.ReadOnly;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Geçici dizin oluşturulurken hata oluştu: {ex.Message}");
                }
            }

            // ZIP dosyası oluştur
            string zipFileName = $"Meeting_{meetingId}_Documents_{DateTime.Now:yyyyMMddHHmmss}.zip";
            string zipFilePath = Path.Combine(tempDirectory, zipFileName);
            
            try
            {
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
                    if (File.Exists(zipFilePath))
            {
                File.Delete(zipFilePath);
                    }
            }
            catch
            {
                // Silme hatası kritik değil, devam et
            }

            return zipBytes;
            }
            catch (Exception ex)
            {
                throw new Exception($"ZIP dosyası oluşturulurken hata oluştu: {ex.Message}");
            }
        }
    }
}
