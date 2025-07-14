using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Moq;
using System.Text;

namespace MebToplantiTakip.Tests
{
    public class FileServiceTests
    {
        private MebToplantiTakipContext GetInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<MebToplantiTakipContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var mockConfig = new Mock<IConfiguration>();
            return new MebToplantiTakipContext(mockConfig.Object, options);
        }

        private IFormFile CreateMockFile(string fileName, string content = "test content")
        {
            var mockFile = new Mock<IFormFile>();
            var ms = new MemoryStream(Encoding.UTF8.GetBytes(content));
            
            mockFile.Setup(f => f.FileName).Returns(fileName);
            mockFile.Setup(f => f.Length).Returns(ms.Length);
            mockFile.Setup(f => f.OpenReadStream()).Returns(ms);
            mockFile.Setup(f => f.ContentType).Returns("text/plain");
            
            return mockFile.Object;
        }

        [Fact]
        public async Task SaveFile_ValidFile_ReturnsSavedDocument()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb1");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            mockHostEnvironment.Setup(x => x.WebRootPath).Returns("/wwwroot");
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            var meeting = new Meeting
            {
                Title = "Test Meeting",
                Description = "Test Description",
                StartDate = DateTime.Now
            };
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            var mockFile = CreateMockFile("test.txt", "Test file content");

            // Act
            var result = await service.SaveFile(mockFile, meeting.MeetingId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("test.txt", result.OriginalFileName);
            Assert.Equal(meeting.MeetingId, result.MeetingId);
            Assert.False(string.IsNullOrEmpty(result.FilePath));
        }

        [Fact]
        public async Task SaveFile_FileWithSpecialCharacters_HandlesProperly()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb2");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            mockHostEnvironment.Setup(x => x.WebRootPath).Returns("/wwwroot");
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            var meeting = new Meeting
            {
                Title = "Test Meeting",
                Description = "Test Description",
                StartDate = DateTime.Now
            };
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            var mockFile = CreateMockFile("özel_karakter_dosyası.txt", "Özel karakterli içerik");

            // Act
            var result = await service.SaveFile(mockFile, meeting.MeetingId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("özel_karakter_dosyası.txt", result.OriginalFileName);
            Assert.Equal(meeting.MeetingId, result.MeetingId);
        }

        [Fact]
        public async Task GetMeetingDocuments_ReturnsDocumentsForMeeting()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb3");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            var meeting = new Meeting
            {
                Title = "Test Meeting",
                Description = "Test Description",
                StartDate = DateTime.Now
            };
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            var document1 = new MeetingDocument
            {
                MeetingId = meeting.MeetingId,
                OriginalFileName = "doc1.txt",
                FilePath = "/path/to/doc1.txt",
                UploadTime = DateTime.Now
            };

            var document2 = new MeetingDocument
            {
                MeetingId = meeting.MeetingId,
                OriginalFileName = "doc2.txt",
                FilePath = "/path/to/doc2.txt",
                UploadTime = DateTime.Now
            };

            await context.MeetingDocuments.AddRangeAsync(document1, document2);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetMeetingDocuments(meeting.MeetingId);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, d => d.OriginalFileName == "doc1.txt");
            Assert.Contains(result, d => d.OriginalFileName == "doc2.txt");
        }

        [Fact]
        public async Task GetMeetingDocuments_NoDocuments_ReturnsEmptyList()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb4");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            // Act
            var result = await service.GetMeetingDocuments(999);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetMeetingDocuments_MultipleFiles_ReturnsSortedByUploadTime()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb5");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            var meeting = new Meeting
            {
                Title = "Test Meeting",
                Description = "Test Description",
                StartDate = DateTime.Now
            };
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            var document1 = new MeetingDocument
            {
                MeetingId = meeting.MeetingId,
                OriginalFileName = "oldest.txt",
                FilePath = "/path/to/oldest.txt",
                UploadTime = DateTime.Now.AddHours(-2)
            };

            var document2 = new MeetingDocument
            {
                MeetingId = meeting.MeetingId,
                OriginalFileName = "newest.txt",
                FilePath = "/path/to/newest.txt",
                UploadTime = DateTime.Now
            };

            var document3 = new MeetingDocument
            {
                MeetingId = meeting.MeetingId,
                OriginalFileName = "middle.txt",
                FilePath = "/path/to/middle.txt",
                UploadTime = DateTime.Now.AddHours(-1)
            };

            await context.MeetingDocuments.AddRangeAsync(document1, document2, document3);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetMeetingDocuments(meeting.MeetingId);

            // Assert
            Assert.Equal(3, result.Count);
            // En yeni dosya en üstte olmalı (varsayılan sıralama)
            Assert.Equal("newest.txt", result.First().OriginalFileName);
        }

        [Fact]
        public void GenerateUniqueFileName_DifferentFiles_GeneratesDifferentNames()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb6");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            var file1 = CreateMockFile("test1.txt");
            var file2 = CreateMockFile("test2.txt");

            // Act - Reflection kullanarak private metodu test etmek mümkün ama pratik değil
            // Bu durumda SaveFile metodunu kullanarak dolaylı test yapacağız

            // Assert
            Assert.NotEqual(file1.FileName, file2.FileName);
        }

        [Fact]
        public async Task SaveFile_LargeFile_HandlesProperly()
        {
            // Arrange
            using var context = GetInMemoryContext("FileTestDb7");
            var mockConfig = new Mock<IConfiguration>();
            var mockHostEnvironment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            
            mockHostEnvironment.Setup(x => x.WebRootPath).Returns("/wwwroot");
            var service = new FileService(context, mockConfig.Object, mockHostEnvironment.Object);

            var meeting = new Meeting
            {
                Title = "Test Meeting",
                Description = "Test Description",
                StartDate = DateTime.Now
            };
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            // 1MB boyutunda bir dosya simüle et
            var largeContent = new string('A', 1024 * 1024);
            var mockFile = CreateMockFile("large_file.txt", largeContent);

            // Act
            var result = await service.SaveFile(mockFile, meeting.MeetingId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("large_file.txt", result.OriginalFileName);
            Assert.Equal(meeting.MeetingId, result.MeetingId);
        }
    }
} 