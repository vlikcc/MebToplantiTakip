using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;

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
    }
}
