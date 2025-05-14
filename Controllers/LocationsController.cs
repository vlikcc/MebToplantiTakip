using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MebToplantiTakip.Services;
using MebToplantiTakip.Dtos;
using Microsoft.EntityFrameworkCore;
using MebToplantiTakip.DbContexts;

namespace MebToplantiTakip.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly LocationService _locationService;
        private readonly MebToplantiTakipContext _context;

        public LocationsController(LocationService locationService, MebToplantiTakipContext context)
        {
            _locationService = locationService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _context.Locations.ToListAsync();
            return Ok(locations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLocationById(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            
            if (location == null)
            {
                return NotFound($"Location with ID {id} not found.");
            }

            return Ok(location);
        }

        [HttpPost("AddLocation")]
        public async Task<IActionResult> AddLocation(LocationDto locationDto)
        {
            var location = await _locationService.AddLocation(locationDto);
            return Ok(location);
        }
    }
}
