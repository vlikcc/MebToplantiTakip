using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MebToplantiTakip.Tests
{
    public class MeetingServiceTests
    {
        [Fact]
        public async Task CreateMeeting_NullMeeting_ThrowsArgumentNullException()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MebToplantiTakip.DbContexts.MebToplantiTakipContext>()
                .UseInMemoryDatabase(databaseName: "TestDb1")
                .Options;
            var context = new MebToplantiTakip.DbContexts.MebToplantiTakipContext(new Mock<Microsoft.Extensions.Configuration.IConfiguration>().Object);
            var fileServiceMock = new Mock<FileService>(context, null, null);
            var service = new MeetingService(context, fileServiceMock.Object);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => service.CreateMeeting(null, null));
        }
    }
}
