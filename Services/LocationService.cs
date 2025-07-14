using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Services
{
    public class LocationService(MebToplantiTakipContext context)
    {
        public async Task<Location> AddLocation (LocationDto location)
        {
            var Location = new Location
            {
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                LocationName = location.LocationName
            };
            await context.Locations.AddAsync (Location);    
            await context.SaveChangesAsync ();
            return Location;
        }

        public async Task<List<Location>> GetAllLocations()
        {
            return await context.Locations.AsNoTracking().ToListAsync();
        }

        public async Task<Location> GetLocationById(int locationId)
        {
            return await context.Locations.FindAsync(locationId);
        }

        public async Task<Location> UpdateLocation(Location location)
        {
            if (location == null || location.LocationId <= 0)
                throw new ArgumentException("Geçersiz lokasyon bilgisi");

            var existingLocation = await context.Locations.FindAsync(location.LocationId);
            if (existingLocation == null)
                throw new Exception("Lokasyon bulunamadı");

            existingLocation.LocationName = location.LocationName;
            existingLocation.Latitude = location.Latitude;
            existingLocation.Longitude = location.Longitude;

            context.Locations.Update(existingLocation);
            await context.SaveChangesAsync();
            return existingLocation;
        }

        public async Task<bool> DeleteLocation(int locationId)
        {
            var location = await context.Locations.FindAsync(locationId);
            if (location == null)
                return false;

            // Önce bu lokasyonu kullanan toplantılar var mı kontrol et
            var meetingsUsingLocation = await context.Meetings
                .Where(m => m.Location != null && m.Location.LocationId == locationId)
                .CountAsync();

            if (meetingsUsingLocation > 0)
                throw new Exception("Bu lokasyon toplantılarda kullanıldığı için silinemiyor");

            context.Locations.Remove(location);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Location>> SearchLocationsByName(string locationName)
        {
            if (string.IsNullOrWhiteSpace(locationName))
                return new List<Location>();

            return await context.Locations
                .AsNoTracking()
                .Where(l => l.LocationName.Contains(locationName))
                .ToListAsync();
        }

        public async Task<List<Location>> GetLocationsByDistance(double latitude, double longitude, double maxDistanceKm)
        {
            // Basit mesafe hesaplama (Haversine formülü kullanılabilir daha doğru hesaplama için)
            return await context.Locations
                .AsNoTracking()
                .Where(l => Math.Abs(l.Latitude - latitude) <= maxDistanceKm / 111.0 && 
                           Math.Abs(l.Longitude - longitude) <= maxDistanceKm / 111.0)
                .ToListAsync();
        }

        public async Task<bool> IsLocationNameExists(string locationName, int? excludeLocationId = null)
        {
            var query = context.Locations.AsNoTracking()
                .Where(l => l.LocationName.ToLower() == locationName.ToLower());

            if (excludeLocationId.HasValue)
                query = query.Where(l => l.LocationId != excludeLocationId.Value);

            return await query.AnyAsync();
        }
    }
}
