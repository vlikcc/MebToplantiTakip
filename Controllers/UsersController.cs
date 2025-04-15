using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Entities;
using MebToplantiTakip.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace MebToplantiTakip.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(UserService userService ): ControllerBase
    {
        [HttpGet("GetUsers")]
         public  async Task<IActionResult> GetUsers ()
        {
            var users = await userService.GetAllUsers();
            return Ok( users ); 
        }

        [HttpGet("{id}")]
         public async Task<IActionResult> GetUserById (int id)
        {
            var user = await userService.GetUserById(id);
            return Ok( user );
        }

        [HttpGet("GetUserByDeviceId/{deviceId}")]
        public async Task<IActionResult> GetUserByDeviceId(string deviceId)
        {
            var user = await userService.GetUserbyDeviceId(deviceId);
            if (user == null)
            {
                return NoContent(); // Return 204 if no user is found
            }
            //UserDto userDto = new UserDto();
            //userDto.DeviceId = user.DeviceId;
            //userDto.UserName = user.UserName;
            //userDto.InstitutionName = user.InstitutionName;
            
            return Ok(user);
        }

        [HttpPost("AddUser")]

        public async Task<IActionResult> AddUser (UserDto user)
        {
            bool result = await userService.CheckUserIsExist(user.DeviceId);

            if(result==true)
            {
                return BadRequest("Bu cihaz zaten kayıtlı.");
            }
            await userService.CreateUser( user );
            return Ok(user);
        }

        [HttpDelete("{id}")]
         
        public async Task<IActionResult> DeleteUser (int id)
        {
            var result = await userService.DeleteUser( id );
            return result ? NoContent() : NotFound();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser (int id, User user)
        {
            if(id!=user.UserId) return BadRequest("Kullanıcı Id'si ile Id uyuşmuyor.");
            var updatedUser = await userService.UpdateUser(user);
            return Ok( updatedUser );

        }

        


    }
}
