using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Moq;

namespace MebToplantiTakip.Tests
{
    public class AttendeeServiceTests
    {
        private MebToplantiTakipContext GetInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<MebToplantiTakipContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var mockConfig = new Mock<IConfiguration>();
            return new MebToplantiTakipContext(mockConfig.Object, options);
        }

        [Fact]
        public async Task AddAttendee_ValidAttendee_ReturnsAttendee()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb1");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            // Setup test data
            var user = new User { DeviceId = "device123", UserName = "Test User", InstitutionName = "Test Institution" };
            var meeting = new Meeting { Title = "Test Meeting", Description = "Test Description", StartDate = DateTime.Now };
            
            await context.Users.AddAsync(user);
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            mockUserService.Setup(x => x.GetUserById(user.UserId)).ReturnsAsync(user);
            mockMeetingService.Setup(x => x.GetMeetingById(meeting.MeetingId)).ReturnsAsync(meeting);

            var attendeeDto = new AttendeeDto
            {
                UserId = user.UserId,
                MeetingId = meeting.MeetingId
            };

            // Act
            var result = await service.AddAttendee(attendeeDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(attendeeDto.UserId, result.UserId);
            Assert.Equal(attendeeDto.MeetingId, result.MeetingId);
        }

        [Fact]
        public async Task AddAttendee_UserNotFound_ThrowsException()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb2");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            mockUserService.Setup(x => x.GetUserById(It.IsAny<int>())).ReturnsAsync((User)null);

            var attendeeDto = new AttendeeDto
            {
                UserId = 999,
                MeetingId = 1
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.AddAttendee(attendeeDto));
            Assert.Equal("Kullanıcı Bulunamadı", exception.Message);
        }

        [Fact]
        public async Task AddAttendee_MeetingNotFound_ThrowsException()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb3");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var user = new User { DeviceId = "device123", UserName = "Test User", InstitutionName = "Test Institution" };
            
            mockUserService.Setup(x => x.GetUserById(It.IsAny<int>())).ReturnsAsync(user);
            mockMeetingService.Setup(x => x.GetMeetingById(It.IsAny<int>())).ReturnsAsync((Meeting)null);

            var attendeeDto = new AttendeeDto
            {
                UserId = 1,
                MeetingId = 999
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.AddAttendee(attendeeDto));
            Assert.Equal("Toplantı Bulunamadı", exception.Message);
        }

        [Fact]
        public async Task AddAttendee_DuplicateAttendee_ThrowsException()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb4");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            // Setup test data
            var user = new User { DeviceId = "device123", UserName = "Test User", InstitutionName = "Test Institution" };
            var meeting = new Meeting { Title = "Test Meeting", Description = "Test Description", StartDate = DateTime.Now };
            var existingAttendee = new Attendee { UserId = user.UserId, MeetingId = meeting.MeetingId };
            
            await context.Users.AddAsync(user);
            await context.Meetings.AddAsync(meeting);
            await context.Attendees.AddAsync(existingAttendee);
            await context.SaveChangesAsync();

            mockUserService.Setup(x => x.GetUserById(user.UserId)).ReturnsAsync(user);
            mockMeetingService.Setup(x => x.GetMeetingById(meeting.MeetingId)).ReturnsAsync(meeting);

            var attendeeDto = new AttendeeDto
            {
                UserId = user.UserId,
                MeetingId = meeting.MeetingId
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.AddAttendee(attendeeDto));
            Assert.Equal("Kullanıcının bu toplantıda kaydı var.", exception.Message);
        }

        [Fact]
        public async Task GetAttendees_ReturnsAllAttendees()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb5");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var attendee1 = new Attendee { UserId = 1, MeetingId = 1 };
            var attendee2 = new Attendee { UserId = 2, MeetingId = 1 };

            await context.Attendees.AddRangeAsync(attendee1, attendee2);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAttendees();

            // Assert
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetUserMeetings_ReturnsUserMeetings()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb6");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var user = new User { DeviceId = "device123", UserName = "Test User", InstitutionName = "Test Institution" };
            var meeting1 = new Meeting { Title = "Meeting 1", Description = "Description 1", StartDate = DateTime.Now };
            var meeting2 = new Meeting { Title = "Meeting 2", Description = "Description 2", StartDate = DateTime.Now };
            
            await context.Users.AddAsync(user);
            await context.Meetings.AddRangeAsync(meeting1, meeting2);
            await context.SaveChangesAsync();

            var attendee1 = new Attendee { UserId = user.UserId, MeetingId = meeting1.MeetingId };
            var attendee2 = new Attendee { UserId = user.UserId, MeetingId = meeting2.MeetingId };

            await context.Attendees.AddRangeAsync(attendee1, attendee2);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetUserMeetings(user.UserId);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, m => m.Title == "Meeting 1");
            Assert.Contains(result, m => m.Title == "Meeting 2");
        }

        [Fact]
        public async Task GetMeetingAttendees_ReturnsMeetingAttendees()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb7");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var user1 = new User { DeviceId = "device1", UserName = "User 1", InstitutionName = "Institution 1" };
            var user2 = new User { DeviceId = "device2", UserName = "User 2", InstitutionName = "Institution 2" };
            var meeting = new Meeting { Title = "Test Meeting", Description = "Test Description", StartDate = DateTime.Now };
            
            await context.Users.AddRangeAsync(user1, user2);
            await context.Meetings.AddAsync(meeting);
            await context.SaveChangesAsync();

            var attendee1 = new Attendee { UserId = user1.UserId, MeetingId = meeting.MeetingId };
            var attendee2 = new Attendee { UserId = user2.UserId, MeetingId = meeting.MeetingId };

            await context.Attendees.AddRangeAsync(attendee1, attendee2);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetMeetingAttendees(meeting.MeetingId);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, u => u.UserName == "User 1");
            Assert.Contains(result, u => u.UserName == "User 2");
        }

        [Fact]
        public async Task GetAttendeeById_ExistingId_ReturnsAttendee()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb8");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var attendee = new Attendee { UserId = 1, MeetingId = 1 };
            await context.Attendees.AddAsync(attendee);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAttendeeById(attendee.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(attendee.Id, result.Id);
            Assert.Equal(attendee.UserId, result.UserId);
            Assert.Equal(attendee.MeetingId, result.MeetingId);
        }

        [Fact]
        public async Task GetAttendeeById_NonExistingId_ReturnsNull()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb9");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            // Act
            var result = await service.GetAttendeeById(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateAttendee_ValidAttendee_ReturnsUpdatedAttendee()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb10");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var user1 = new User { DeviceId = "device1", UserName = "User 1", InstitutionName = "Institution 1" };
            var user2 = new User { DeviceId = "device2", UserName = "User 2", InstitutionName = "Institution 2" };
            var meeting1 = new Meeting { Title = "Meeting 1", Description = "Description 1", StartDate = DateTime.Now };
            var meeting2 = new Meeting { Title = "Meeting 2", Description = "Description 2", StartDate = DateTime.Now };
            
            await context.Users.AddRangeAsync(user1, user2);
            await context.Meetings.AddRangeAsync(meeting1, meeting2);
            await context.SaveChangesAsync();

            var attendee = new Attendee { UserId = user1.UserId, MeetingId = meeting1.MeetingId };
            await context.Attendees.AddAsync(attendee);
            await context.SaveChangesAsync();

            // Mock services
            mockUserService.Setup(x => x.GetUserById(user2.UserId)).ReturnsAsync(user2);
            mockMeetingService.Setup(x => x.GetMeetingById(meeting2.MeetingId)).ReturnsAsync(meeting2);

            // Update attendee
            attendee.UserId = user2.UserId;
            attendee.MeetingId = meeting2.MeetingId;

            // Act
            var result = await service.UpdateAttendee(attendee);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user2.UserId, result.UserId);
            Assert.Equal(meeting2.MeetingId, result.MeetingId);
        }

        [Fact]
        public async Task DeleteAttendee_ExistingId_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb11");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var attendee = new Attendee { UserId = 1, MeetingId = 1 };
            await context.Attendees.AddAsync(attendee);
            await context.SaveChangesAsync();

            // Act
            var result = await service.DeleteAttendee(attendee.Id);

            // Assert
            Assert.True(result);

            // Verify deletion
            var deletedAttendee = await context.Attendees.FindAsync(attendee.Id);
            Assert.Null(deletedAttendee);
        }

        [Fact]
        public async Task DeleteAttendee_NonExistingId_ReturnsFalse()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb12");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            // Act
            var result = await service.DeleteAttendee(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task RemoveUserFromMeeting_ExistingUserAndMeeting_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb13");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var attendee = new Attendee { UserId = 1, MeetingId = 1 };
            await context.Attendees.AddAsync(attendee);
            await context.SaveChangesAsync();

            // Act
            var result = await service.RemoveUserFromMeeting(1, 1);

            // Assert
            Assert.True(result);

            // Verify removal
            var removedAttendee = await context.Attendees
                .FirstOrDefaultAsync(a => a.UserId == 1 && a.MeetingId == 1);
            Assert.Null(removedAttendee);
        }

        [Fact]
        public async Task GetMeetingAttendeeCount_ReturnsCorrectCount()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb14");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var attendee1 = new Attendee { UserId = 1, MeetingId = 1 };
            var attendee2 = new Attendee { UserId = 2, MeetingId = 1 };
            var attendee3 = new Attendee { UserId = 3, MeetingId = 2 };

            await context.Attendees.AddRangeAsync(attendee1, attendee2, attendee3);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetMeetingAttendeeCount(1);

            // Assert
            Assert.Equal(2, result);
        }

        [Fact]
        public async Task IsUserAttendingMeeting_ExistingAttendance_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb15");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            var attendee = new Attendee { UserId = 1, MeetingId = 1 };
            await context.Attendees.AddAsync(attendee);
            await context.SaveChangesAsync();

            // Act
            var result = await service.IsUserAttendingMeeting(1, 1);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsUserAttendingMeeting_NonExistingAttendance_ReturnsFalse()
        {
            // Arrange
            using var context = GetInMemoryContext("AttendeeTestDb16");
            var mockUserService = new Mock<UserService>(context);
            var mockMeetingService = new Mock<MeetingService>(context, null);
            var service = new AttendeeService(context, mockUserService.Object, mockMeetingService.Object);

            // Act
            var result = await service.IsUserAttendingMeeting(999, 999);

            // Assert
            Assert.False(result);
        }
    }
} 