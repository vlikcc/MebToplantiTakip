using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Moq;

namespace MebToplantiTakip.Tests
{
    public class UserServiceTests
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
        public async Task CreateUser_ValidUser_ReturnsUser()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb1");
            var service = new UserService(context);

            var userDto = new UserDto
            {
                DeviceId = "device123",
                UserName = "Test Kullanıcı",
                InstitutionName = "Test Kurumu",
                LastLoginDate = DateTime.Now
            };

            // Act
            var result = await service.CreateUser(userDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userDto.DeviceId, result.DeviceId);
            Assert.Equal(userDto.UserName, result.UserName);
            Assert.Equal(userDto.InstitutionName, result.InstitutionName);
            Assert.True(result.UserId > 0);
        }

        [Fact]
        public async Task GetAllUsers_ReturnsAllUsers()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb2");
            var service = new UserService(context);

            var user1 = new User { DeviceId = "device1", UserName = "Kullanıcı 1", InstitutionName = "Kurum 1" };
            var user2 = new User { DeviceId = "device2", UserName = "Kullanıcı 2", InstitutionName = "Kurum 2" };

            await context.Users.AddRangeAsync(user1, user2);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAllUsers();

            // Assert
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task CheckUserIsExist_ExistingDeviceId_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb3");
            var service = new UserService(context);

            var user = new User { DeviceId = "existing_device", UserName = "Test User", InstitutionName = "Test Institution" };
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            // Act
            var result = await service.CheckUserIsExist("existing_device");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task CheckUserIsExist_NonExistingDeviceId_ReturnsFalse()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb4");
            var service = new UserService(context);

            // Act
            var result = await service.CheckUserIsExist("non_existing_device");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetUserById_ExistingId_ReturnsUser()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb5");
            var service = new UserService(context);

            var user = new User { DeviceId = "device123", UserName = "Test User", InstitutionName = "Test Institution" };
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetUserById(user.UserId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.DeviceId, result.DeviceId);
            Assert.Equal(user.UserName, result.UserName);
        }

        [Fact]
        public async Task GetUserById_NonExistingId_ReturnsNull()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb6");
            var service = new UserService(context);

            // Act
            var result = await service.GetUserById(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetUserbyDeviceId_ExistingDeviceId_ReturnsUser()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb7");
            var service = new UserService(context);

            var user = new User { DeviceId = "test_device", UserName = "Test User", InstitutionName = "Test Institution" };
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetUserbyDeviceId("test_device");

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.DeviceId, result.DeviceId);
        }

        [Fact]
        public async Task GetUserbyDeviceId_NonExistingDeviceId_ReturnsNull()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb8");
            var service = new UserService(context);

            // Act
            var result = await service.GetUserbyDeviceId("non_existing_device");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateUser_ValidUser_ReturnsUpdatedUser()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb9");
            var service = new UserService(context);

            var user = new User { DeviceId = "device123", UserName = "Original Name", InstitutionName = "Original Institution" };
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            // Update user data
            user.UserName = "Updated Name";
            user.InstitutionName = "Updated Institution";

            // Act
            var result = await service.UpdateUser(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Name", result.UserName);
            Assert.Equal("Updated Institution", result.InstitutionName);
        }

        [Fact]
        public async Task DeleteUser_ExistingId_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb10");
            var service = new UserService(context);

            var user = new User { DeviceId = "device123", UserName = "Test User", InstitutionName = "Test Institution" };
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            // Act
            var result = await service.DeleteUser(user.UserId);

            // Assert
            Assert.True(result);

            // Verify user is deleted
            var deletedUser = await context.Users.FindAsync(user.UserId);
            Assert.Null(deletedUser);
        }

        [Fact]
        public async Task DeleteUser_NonExistingId_ReturnsFalse()
        {
            // Arrange
            using var context = GetInMemoryContext("UserTestDb11");
            var service = new UserService(context);

            // Act
            var result = await service.DeleteUser(999);

            // Assert
            Assert.False(result);
        }
    }
} 