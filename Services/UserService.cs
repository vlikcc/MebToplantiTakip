using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Services
{
    public class UserService (MebToplantiTakipContext context)
    {
        public async Task<User> CreateUser (UserDto user)
        {
            var createdUser = new User
            {
                DeviceId = user.DeviceId,
                UserName = user.UserName,
                InstitutionName = user.InstitutionName,
                LastLoginDate = user.LastLoginDate
            };  
            await context.Users.AddAsync (createdUser);
            await context.SaveChangesAsync ();
            return createdUser;
        }

        public async Task<List<User>> GetAllUsers ()
        {
           return  await context.Users.AsNoTracking().ToListAsync ();
        }

        public async Task<bool> CheckUserIsExist (string deviceId)
        {
            var existingUser = await context.Users.AsNoTracking().FirstOrDefaultAsync (u=>u.DeviceId == deviceId);
            if (existingUser != null)
            {
                return true;
            }
            else
            {
                return false;
            }

        }
         public async Task<User> GetUserById(int id)
        {
            return await context.Users.FindAsync(id);
        }

        public async Task<UserDto?> GetUserbyDeviceId(string deviceId)
        {
            var user = await context.Users.FirstOrDefaultAsync(x => x.DeviceId == deviceId);
            if (user != null)
            {
                return new UserDto
                {
                    DeviceId = user.DeviceId,
                    UserName = user.UserName,
                    InstitutionName = user.InstitutionName,
                    LastLoginDate = user.LastLoginDate
                };
            }
            else
            {
                return null;
            }
        }

        public async Task<User> UpdateUser (User user)
        {
            context.Users.Update(user);
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUser (int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user != null) 
            {
                 context.Users.Remove(user);
                await context.SaveChangesAsync();
                return true;
            }
            else
            {
                return false;
            }

        }
    }
}
