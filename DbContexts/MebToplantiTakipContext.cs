using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.Data;
using System.Data.SqlClient;


namespace MebToplantiTakip.DbContexts
{
    public class MebToplantiTakipContext(IConfiguration configuration) :DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder )
        {
            var connectionString = configuration.GetConnectionString("MebToplantiTakipConnectionString");
            optionsBuilder.UseSqlServer(connectionString);
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Attendee> Attendees { get; set; }
    }
}
