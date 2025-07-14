using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using System.Text.Json;
using QRCoder;

namespace MebToplantiTakip.Tests
{
    public class QrCodeServiceTests
    {
        [Fact]
        public async Task GenerateQrCode_ValidMeeting_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 1,
                Title = "Test Toplantısı",
                Description = "Test açıklaması",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(2),
                LocationName = "Test Lokasyonu",
                MeetingCode = "TEST123"
            };

            // Act
            var result = await service.GenerateQrCode(meeting);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
            Assert.IsType<byte[]>(result);
        }

        [Fact]
        public async Task GenerateQrCodeWithCustomSize_ValidParameters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 1,
                Title = "Test Toplantısı",
                Description = "Test açıklaması",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(2)
            };

            // Act
            var result = await service.GenerateQrCodeWithCustomSize(meeting, 30);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeWithCustomSize_InvalidSize_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting { MeetingId = 1, Title = "Test" };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeWithCustomSize(meeting, 0));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeWithCustomSize(meeting, 101));
        }

        [Fact]
        public async Task GenerateQrCodeWithErrorCorrection_DifferentLevels_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 1,
                Title = "Test Toplantısı",
                StartDate = DateTime.Now
            };

            // Act
            var resultL = await service.GenerateQrCodeWithErrorCorrection(meeting, QRCodeGenerator.ECCLevel.L);
            var resultM = await service.GenerateQrCodeWithErrorCorrection(meeting, QRCodeGenerator.ECCLevel.M);
            var resultQ = await service.GenerateQrCodeWithErrorCorrection(meeting, QRCodeGenerator.ECCLevel.Q);
            var resultH = await service.GenerateQrCodeWithErrorCorrection(meeting, QRCodeGenerator.ECCLevel.H);

            // Assert
            Assert.NotNull(resultL);
            Assert.NotNull(resultM);
            Assert.NotNull(resultQ);
            Assert.NotNull(resultH);
            Assert.True(resultL.Length > 0);
            Assert.True(resultM.Length > 0);
            Assert.True(resultQ.Length > 0);
            Assert.True(resultH.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeFromText_ValidText_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var text = "Bu bir test metnidir";

            // Act
            var result = await service.GenerateQrCodeFromText(text);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeFromText_EmptyText_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeFromText(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeFromText(null));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeFromText("   "));
        }

        [Fact]
        public async Task GenerateQrCodeForUrl_ValidUrl_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var url = "https://www.google.com";

            // Act
            var result = await service.GenerateQrCodeForUrl(url);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForUrl_InvalidUrl_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForUrl("invalid-url"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForUrl(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForUrl(null));
        }

        [Fact]
        public async Task GenerateQrCodeForWiFi_ValidParameters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var ssid = "TestWiFi";
            var password = "testpassword123";

            // Act
            var result = await service.GenerateQrCodeForWiFi(ssid, password);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForWiFi_EmptySSID_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForWiFi("", "password"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForWiFi(null, "password"));
        }

        [Fact]
        public async Task GenerateQrCodeForContact_ValidParameters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var name = "Ahmet Yılmaz";
            var phone = "+905551234567";
            var email = "ahmet@example.com";
            var organization = "Test Şirketi";

            // Act
            var result = await service.GenerateQrCodeForContact(name, phone, email, organization);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForContact_OnlyRequiredParameters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var name = "Ahmet Yılmaz";
            var phone = "+905551234567";

            // Act
            var result = await service.GenerateQrCodeForContact(name, phone);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForContact_MissingRequiredParameters_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForContact("", "phone"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForContact("name", ""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForContact(null, "phone"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForContact("name", null));
        }

        [Fact]
        public async Task GenerateQrCodeForSMS_ValidParameters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var phoneNumber = "+905551234567";
            var message = "Merhaba, bu bir test mesajıdır.";

            // Act
            var result = await service.GenerateQrCodeForSMS(phoneNumber, message);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForSMS_OnlyPhoneNumber_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var phoneNumber = "+905551234567";

            // Act
            var result = await service.GenerateQrCodeForSMS(phoneNumber);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForSMS_EmptyPhoneNumber_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForSMS(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForSMS(null));
        }

        [Fact]
        public async Task GenerateQrCodeForEmail_ValidParameters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var email = "test@example.com";
            var subject = "Test Konusu";
            var body = "Bu bir test e-postasıdır.";

            // Act
            var result = await service.GenerateQrCodeForEmail(email, subject, body);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForEmail_OnlyEmail_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var email = "test@example.com";

            // Act
            var result = await service.GenerateQrCodeForEmail(email);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeForEmail_EmptyEmail_ThrowsArgumentException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForEmail(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.GenerateQrCodeForEmail(null));
        }

        [Fact]
        public async Task GenerateQrCodeMeetingWithSpecialCharacters_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 2,
                Title = "Özel Karakter İçeren Toplantı",
                Description = "Şçıüğö karakterli açıklama",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(1),
                LocationName = "İstanbul Şişli",
                MeetingCode = "ÖZL123"
            };

            // Act
            var result = await service.GenerateQrCode(meeting);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeMeetingWithLongText_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 3,
                Title = "Çok Uzun Başlıklı Toplantı " + new string('A', 100),
                Description = "Çok uzun açıklama " + new string('B', 500),
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(3),
                LocationName = "Çok Uzun Lokasyon Adı " + new string('C', 50),
                MeetingCode = "LONG123"
            };

            // Act
            var result = await service.GenerateQrCode(meeting);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeMeetingWithNullValues_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 4,
                Title = "Null Değerli Toplantı",
                Description = null,
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(1),
                LocationName = null,
                MeetingCode = "NULL123"
            };

            // Act
            var result = await service.GenerateQrCode(meeting);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeMultipleMeetings_GeneratesDifferentQrCodes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting1 = new Meeting
            {
                MeetingId = 5,
                Title = "Toplantı 1",
                Description = "Açıklama 1",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(1),
                LocationName = "Lokasyon 1",
                MeetingCode = "TEST1"
            };

            var meeting2 = new Meeting
            {
                MeetingId = 6,
                Title = "Toplantı 2",
                Description = "Açıklama 2",
                StartDate = DateTime.Now.AddDays(1),
                EndDate = DateTime.Now.AddDays(1).AddHours(1),
                LocationName = "Lokasyon 2",
                MeetingCode = "TEST2"
            };

            // Act
            var result1 = await service.GenerateQrCode(meeting1);
            var result2 = await service.GenerateQrCode(meeting2);

            // Assert
            Assert.NotNull(result1);
            Assert.NotNull(result2);
            Assert.NotEqual(result1, result2);
        }

        [Fact]
        public async Task GenerateQrCodeSameMeeting_GeneratesSameQrCode()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 7,
                Title = "Aynı Toplantı",
                Description = "Aynı açıklama",
                StartDate = new DateTime(2024, 1, 1, 10, 0, 0),
                EndDate = new DateTime(2024, 1, 1, 12, 0, 0),
                LocationName = "Aynı lokasyon",
                MeetingCode = "SAME123"
            };

            // Act
            var result1 = await service.GenerateQrCode(meeting);
            var result2 = await service.GenerateQrCode(meeting);

            // Assert
            Assert.NotNull(result1);
            Assert.NotNull(result2);
            Assert.Equal(result1, result2);
        }

        [Fact]
        public async Task GenerateQrCodeMeetingWithEmptyStrings_ReturnsQrCodeBytes()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 8,
                Title = "",
                Description = "",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(1),
                LocationName = "",
                MeetingCode = ""
            };

            // Act
            var result = await service.GenerateQrCode(meeting);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public async Task GenerateQrCodeMeetingSerializesToValidJson()
        {
            // Arrange
            var service = new QrCodeService();
            var meeting = new Meeting
            {
                MeetingId = 9,
                Title = "JSON Test Toplantısı",
                Description = "JSON serialization testi",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(2),
                LocationName = "Test Lokasyonu",
                MeetingCode = "JSON123"
            };

            // Act
            var result = await service.GenerateQrCode(meeting);

            // Assert - QR code oluşturulduğunda meeting nesnesi JSON'a serialize edilebilmeli
            var jsonString = JsonSerializer.Serialize(meeting);
            Assert.False(string.IsNullOrEmpty(jsonString));
            
            // QR kod bytes'ı boş olmamalı
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
        }

        [Fact]
        public void GetQrCodeDirectory_ParametresizConstructor_ReturnsEmptyString()
        {
            // Arrange
            var service = new QrCodeService();

            // Act
            var result = service.GetQrCodeDirectory();

            // Assert
            Assert.Equal("", result);
        }

        [Fact]
        public async Task DeleteQrCodeFile_WithoutEnvironment_ReturnsFalse()
        {
            // Arrange
            var service = new QrCodeService();

            // Act
            var result = await service.DeleteQrCodeFile("test.png");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetAllQrCodeFiles_WithoutEnvironment_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => service.GetAllQrCodeFiles());
        }

        [Fact]
        public async Task GetQrCodeFile_WithoutEnvironment_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = new QrCodeService();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => service.GetQrCodeFile("test.png"));
        }

        [Fact]
        public async Task IsValidQrCodeFile_WithoutEnvironment_ReturnsFalse()
        {
            // Arrange
            var service = new QrCodeService();

            // Act
            var result = await service.IsValidQrCodeFile("test.png");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CleanupOldQrCodeFiles_WithoutEnvironment_ReturnsZero()
        {
            // Arrange
            var service = new QrCodeService();

            // Act
            var result = await service.CleanupOldQrCodeFiles();

            // Assert
            Assert.Equal(0, result);
        }
    }
} 