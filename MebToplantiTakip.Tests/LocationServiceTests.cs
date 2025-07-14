using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Moq;

namespace MebToplantiTakip.Tests
{
    public class LocationServiceTests
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
        public async Task AddLocation_ValidLocation_ReturnsLocation()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb1");
            var service = new LocationService(context);

            var locationDto = new LocationDto
            {
                Latitude = 41.0082,
                Longitude = 28.9784,
                LocationName = "Istanbul"
            };

            // Act
            var result = await service.AddLocation(locationDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(locationDto.Latitude, result.Latitude);
            Assert.Equal(locationDto.Longitude, result.Longitude);
            Assert.Equal(locationDto.LocationName, result.LocationName);
            Assert.True(result.LocationId > 0);
        }

        [Fact]
        public async Task AddLocation_ValidLocationWithDifferentCoordinates_ReturnsLocation()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb2");
            var service = new LocationService(context);

            var locationDto = new LocationDto
            {
                Latitude = 39.9334,
                Longitude = 32.8597,
                LocationName = "Ankara"
            };

            // Act
            var result = await service.AddLocation(locationDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(locationDto.Latitude, result.Latitude);
            Assert.Equal(locationDto.Longitude, result.Longitude);
            Assert.Equal(locationDto.LocationName, result.LocationName);
        }

        [Fact]
        public async Task AddLocation_LocationSavedToDatabase()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb3");
            var service = new LocationService(context);

            var locationDto = new LocationDto
            {
                Latitude = 38.4237,
                Longitude = 27.1428,
                LocationName = "Izmir"
            };

            // Act
            var result = await service.AddLocation(locationDto);

            // Assert
            var savedLocation = await context.Locations.FindAsync(result.LocationId);
            Assert.NotNull(savedLocation);
            Assert.Equal(locationDto.LocationName, savedLocation.LocationName);
            Assert.Equal(locationDto.Latitude, savedLocation.Latitude);
            Assert.Equal(locationDto.Longitude, savedLocation.Longitude);
        }

        [Fact]
        public async Task AddLocation_MultipleLocations_AllSaved()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb4");
            var service = new LocationService(context);

            var location1Dto = new LocationDto
            {
                Latitude = 40.7589,
                Longitude = 29.9167,
                LocationName = "Uskudar"
            };

            var location2Dto = new LocationDto
            {
                Latitude = 40.9925,
                Longitude = 29.0269,
                LocationName = "Sisli"
            };

            // Act
            var result1 = await service.AddLocation(location1Dto);
            var result2 = await service.AddLocation(location2Dto);

            // Assert
            var allLocations = await context.Locations.ToListAsync();
            Assert.Equal(2, allLocations.Count);
            Assert.Contains(allLocations, l => l.LocationName == "Uskudar");
            Assert.Contains(allLocations, l => l.LocationName == "Sisli");
        }

        [Fact]
        public async Task AddLocation_NegativeCoordinates_HandledCorrectly()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb5");
            var service = new LocationService(context);

            var locationDto = new LocationDto
            {
                Latitude = -34.6037,
                Longitude = -58.3816,
                LocationName = "Buenos Aires"
            };

            // Act
            var result = await service.AddLocation(locationDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(locationDto.Latitude, result.Latitude);
            Assert.Equal(locationDto.Longitude, result.Longitude);
            Assert.Equal(locationDto.LocationName, result.LocationName);
        }

        [Fact]
        public async Task AddLocation_ZeroCoordinates_HandledCorrectly()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb6");
            var service = new LocationService(context);

            var locationDto = new LocationDto
            {
                Latitude = 0.0,
                Longitude = 0.0,
                LocationName = "Null Island"
            };

            // Act
            var result = await service.AddLocation(locationDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0.0, result.Latitude);
            Assert.Equal(0.0, result.Longitude);
            Assert.Equal("Null Island", result.LocationName);
        }

        [Fact]
        public async Task GetAllLocations_ReturnsAllLocations()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb7");
            var service = new LocationService(context);

            var location1 = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            var location2 = new Location { Latitude = 39.9334, Longitude = 32.8597, LocationName = "Ankara" };

            await context.Locations.AddRangeAsync(location1, location2);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAllLocations();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, l => l.LocationName == "Istanbul");
            Assert.Contains(result, l => l.LocationName == "Ankara");
        }

        [Fact]
        public async Task GetLocationById_ExistingId_ReturnsLocation()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb8");
            var service = new LocationService(context);

            var location = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            await context.Locations.AddAsync(location);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetLocationById(location.LocationId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(location.LocationName, result.LocationName);
            Assert.Equal(location.Latitude, result.Latitude);
            Assert.Equal(location.Longitude, result.Longitude);
        }

        [Fact]
        public async Task GetLocationById_NonExistingId_ReturnsNull()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb9");
            var service = new LocationService(context);

            // Act
            var result = await service.GetLocationById(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateLocation_ValidLocation_ReturnsUpdatedLocation()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb10");
            var service = new LocationService(context);

            var location = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            await context.Locations.AddAsync(location);
            await context.SaveChangesAsync();

            // Update location data
            location.LocationName = "Istanbul Updated";
            location.Latitude = 41.0083;
            location.Longitude = 28.9785;

            // Act
            var result = await service.UpdateLocation(location);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Istanbul Updated", result.LocationName);
            Assert.Equal(41.0083, result.Latitude);
            Assert.Equal(28.9785, result.Longitude);
        }

        [Fact]
        public async Task UpdateLocation_NonExistingLocation_ThrowsException()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb11");
            var service = new LocationService(context);

            var location = new Location { LocationId = 999, Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.UpdateLocation(location));
            Assert.Equal("Lokasyon bulunamadı", exception.Message);
        }

        [Fact]
        public async Task DeleteLocation_ExistingId_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb12");
            var service = new LocationService(context);

            var location = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            await context.Locations.AddAsync(location);
            await context.SaveChangesAsync();

            // Act
            var result = await service.DeleteLocation(location.LocationId);

            // Assert
            Assert.True(result);

            // Verify deletion
            var deletedLocation = await context.Locations.FindAsync(location.LocationId);
            Assert.Null(deletedLocation);
        }

        [Fact]
        public async Task DeleteLocation_NonExistingId_ReturnsFalse()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb13");
            var service = new LocationService(context);

            // Act
            var result = await service.DeleteLocation(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task SearchLocationsByName_ExistingLocations_ReturnsMatchingLocations()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb14");
            var service = new LocationService(context);

            var location1 = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul Merkez" };
            var location2 = new Location { Latitude = 40.9925, Longitude = 29.0269, LocationName = "Istanbul Sisli" };
            var location3 = new Location { Latitude = 39.9334, Longitude = 32.8597, LocationName = "Ankara" };

            await context.Locations.AddRangeAsync(location1, location2, location3);
            await context.SaveChangesAsync();

            // Act
            var result = await service.SearchLocationsByName("Istanbul");

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, l => l.LocationName == "Istanbul Merkez");
            Assert.Contains(result, l => l.LocationName == "Istanbul Sisli");
        }

        [Fact]
        public async Task SearchLocationsByName_EmptyQuery_ReturnsEmptyList()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb15");
            var service = new LocationService(context);

            // Act
            var result = await service.SearchLocationsByName("");

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetLocationsByDistance_ReturnsLocationsWithinDistance()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb16");
            var service = new LocationService(context);

            var location1 = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            var location2 = new Location { Latitude = 41.0083, Longitude = 28.9785, LocationName = "Istanbul Close" };
            var location3 = new Location { Latitude = 39.9334, Longitude = 32.8597, LocationName = "Ankara Far" };

            await context.Locations.AddRangeAsync(location1, location2, location3);
            await context.SaveChangesAsync();

            // Act - Search within 1km of Istanbul
            var result = await service.GetLocationsByDistance(41.0082, 28.9784, 1.0);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, l => l.LocationName == "Istanbul");
            Assert.Contains(result, l => l.LocationName == "Istanbul Close");
        }

        [Fact]
        public async Task IsLocationNameExists_ExistingName_ReturnsTrue()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb17");
            var service = new LocationService(context);

            var location = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            await context.Locations.AddAsync(location);
            await context.SaveChangesAsync();

            // Act
            var result = await service.IsLocationNameExists("Istanbul");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsLocationNameExists_NonExistingName_ReturnsFalse()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb18");
            var service = new LocationService(context);

            // Act
            var result = await service.IsLocationNameExists("NonExisting");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task IsLocationNameExists_ExcludingOwnId_ReturnsCorrectResult()
        {
            // Arrange
            using var context = GetInMemoryContext("LocationTestDb19");
            var service = new LocationService(context);

            var location = new Location { Latitude = 41.0082, Longitude = 28.9784, LocationName = "Istanbul" };
            await context.Locations.AddAsync(location);
            await context.SaveChangesAsync();

            // Act - Check if name exists excluding the same location
            var result = await service.IsLocationNameExists("Istanbul", location.LocationId);

            // Assert
            Assert.False(result); // Should return false because we're excluding the same location
        }
    }
} 