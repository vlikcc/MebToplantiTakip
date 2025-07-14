using QRCoder;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using MebToplantiTakip.Dtos;
using System.Text.Json;
using MebToplantiTakip.Entities;
using MebToplantiTakip.DbContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace MebToplantiTakip.Services
{
    public class QrCodeService
    {
        private readonly MebToplantiTakipContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly string _qrCodePath;

        public QrCodeService(MebToplantiTakipContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
            _qrCodePath = Path.Combine(_environment.WebRootPath, "QrCodes");
            
            // QrCodes dizininin varlığını kontrol et ve oluştur
            if (!Directory.Exists(_qrCodePath))
            {
                Directory.CreateDirectory(_qrCodePath);
            }
        }

        // Parametresiz constructor (testler için)
        public QrCodeService()
        {
        }

        public async Task<byte[]> GenerateQrCode(Meeting meeting)
        {
            string meetingInfo = JsonSerializer.Serialize(meeting);

            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(meetingInfo, QRCodeGenerator.ECCLevel.Q);
                using (BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData))
                {
                    return qrCode.GetGraphic(20);
                }
            }
        }

        public async Task<byte[]> GenerateQrCodeWithCustomSize(Meeting meeting, int pixelsPerModule = 20)
        {
            if (pixelsPerModule < 1 || pixelsPerModule > 100)
                throw new ArgumentException("Pixel boyutu 1-100 arasında olmalıdır");

            string meetingInfo = JsonSerializer.Serialize(meeting);

            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(meetingInfo, QRCodeGenerator.ECCLevel.Q);
                using (BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData))
                {
                    return qrCode.GetGraphic(pixelsPerModule);
                }
            }
        }

        public async Task<byte[]> GenerateQrCodeWithErrorCorrection(Meeting meeting, QRCodeGenerator.ECCLevel errorCorrectionLevel = QRCodeGenerator.ECCLevel.M)
        {
            string meetingInfo = JsonSerializer.Serialize(meeting);

            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(meetingInfo, errorCorrectionLevel);
                using (BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData))
                {
                    return qrCode.GetGraphic(20);
                }
            }
        }

        public async Task<string> SaveQrCodeToFile(Meeting meeting, string fileName = null)
        {
            if (_environment == null)
                throw new InvalidOperationException("WebHostEnvironment yüklenmedi");

            var qrCodeBytes = await GenerateQrCode(meeting);
            
            if (string.IsNullOrEmpty(fileName))
                fileName = $"meeting_{meeting.MeetingId}_qr_{DateTime.Now:yyyyMMddHHmmss}.png";

            var fullPath = Path.Combine(_qrCodePath, fileName);
            
            await File.WriteAllBytesAsync(fullPath, qrCodeBytes);
            
            return fullPath;
        }

        public async Task<byte[]> GenerateQrCodeFromText(string text, int pixelsPerModule = 20, QRCodeGenerator.ECCLevel errorLevel = QRCodeGenerator.ECCLevel.Q)
        {
            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("Metin boş olamaz");

            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(text, errorLevel);
                using (BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData))
                {
                    return qrCode.GetGraphic(pixelsPerModule);
                }
            }
        }

        public async Task<byte[]> GenerateQrCodeForUrl(string url, int pixelsPerModule = 20)
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("URL boş olamaz");

            // URL format kontrolü
            if (!Uri.TryCreate(url, UriKind.Absolute, out _))
                throw new ArgumentException("Geçerli bir URL formatı değil");

            return await GenerateQrCodeFromText(url, pixelsPerModule);
        }

        public async Task<byte[]> GenerateQrCodeForWiFi(string ssid, string password, string securityType = "WPA", bool hidden = false)
        {
            if (string.IsNullOrWhiteSpace(ssid))
                throw new ArgumentException("SSID boş olamaz");

            // WiFi QR kodu formatı: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
            var wifiString = $"WIFI:T:{securityType};S:{ssid};P:{password};H:{hidden.ToString().ToLower()};;";
            
            return await GenerateQrCodeFromText(wifiString);
        }

        public async Task<List<string>> GetAllQrCodeFiles()
        {
            if (_environment == null)
                throw new InvalidOperationException("WebHostEnvironment yüklenmedi");

            if (!Directory.Exists(_qrCodePath))
                return new List<string>();

            var files = Directory.GetFiles(_qrCodePath, "*.png")
                               .Select(Path.GetFileName)
                               .ToList();

            return files;
        }

        public async Task<byte[]> GetQrCodeFile(string fileName)
        {
            if (_environment == null)
                throw new InvalidOperationException("WebHostEnvironment yüklenmedi");

            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("Dosya adı boş olamaz");

            var fullPath = Path.Combine(_qrCodePath, fileName);
            
            if (!File.Exists(fullPath))
                throw new FileNotFoundException("QR kod dosyası bulunamadı");

            return await File.ReadAllBytesAsync(fullPath);
        }

        public async Task<bool> DeleteQrCodeFile(string fileName)
        {
            if (_environment == null)
                return false;

            if (string.IsNullOrWhiteSpace(fileName))
                return false;

            var fullPath = Path.Combine(_qrCodePath, fileName);
            
            if (!File.Exists(fullPath))
                return false;

            try
            {
                File.Delete(fullPath);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<byte[]> GenerateQrCodeForContact(string name, string phone, string email = null, string organization = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("İsim boş olamaz");

            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Telefon numarası boş olamaz");

            // vCard formatı
            var vCard = $"BEGIN:VCARD\nVERSION:3.0\nFN:{name}\nTEL:{phone}";
            
            if (!string.IsNullOrWhiteSpace(email))
                vCard += $"\nEMAIL:{email}";
                
            if (!string.IsNullOrWhiteSpace(organization))
                vCard += $"\nORG:{organization}";
                
            vCard += "\nEND:VCARD";

            return await GenerateQrCodeFromText(vCard);
        }

        public async Task<byte[]> GenerateQrCodeForSMS(string phoneNumber, string message = null)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                throw new ArgumentException("Telefon numarası boş olamaz");

            var smsString = $"SMS:{phoneNumber}";
            if (!string.IsNullOrWhiteSpace(message))
                smsString += $":{message}";

            return await GenerateQrCodeFromText(smsString);
        }

        public async Task<byte[]> GenerateQrCodeForEmail(string email, string subject = null, string body = null)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("E-posta adresi boş olamaz");

            var emailString = $"mailto:{email}";
            var parameters = new List<string>();

            if (!string.IsNullOrWhiteSpace(subject))
                parameters.Add($"subject={Uri.EscapeDataString(subject)}");

            if (!string.IsNullOrWhiteSpace(body))
                parameters.Add($"body={Uri.EscapeDataString(body)}");

            if (parameters.Any())
                emailString += "?" + string.Join("&", parameters);

            return await GenerateQrCodeFromText(emailString);
        }

        public async Task<int> CleanupOldQrCodeFiles(int daysToKeep = 30)
        {
            if (_environment == null)
                return 0;

            if (!Directory.Exists(_qrCodePath))
                return 0;

            var cutoffDate = DateTime.Now.AddDays(-daysToKeep);
            var files = Directory.GetFiles(_qrCodePath, "*.png");
            int deletedCount = 0;

            foreach (var file in files)
            {
                try
                {
                    var fileInfo = new FileInfo(file);
                    if (fileInfo.CreationTime < cutoffDate)
                    {
                        File.Delete(file);
                        deletedCount++;
                    }
                }
                catch
                {
                    // Silme hatası kritik değil, devam et
                }
            }

            return deletedCount;
        }

        public string GetQrCodeDirectory()
        {
            return _qrCodePath ?? "";
        }

        public async Task<bool> IsValidQrCodeFile(string fileName)
        {
            if (_environment == null)
                return false;

            if (string.IsNullOrWhiteSpace(fileName))
                return false;

            var fullPath = Path.Combine(_qrCodePath, fileName);
            
            if (!File.Exists(fullPath))
                return false;

            try
            {
                // Dosyanın PNG uzantısına sahip olup olmadığını ve boyutunun geçerli olup olmadığını kontrol et
                var fileInfo = new FileInfo(fullPath);
                return fileInfo.Extension.ToLower() == ".png" && fileInfo.Length > 0;
            }
            catch
            {
                return false;
            }
        }
    }
} 