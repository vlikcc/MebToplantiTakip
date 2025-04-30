using Microsoft.AspNetCore.Mvc;
using MebToplantiTakip.Dtos;
using MebToplantiTakip.Services;

namespace MebToplantiTakip.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QrCodeController : ControllerBase
    {
        private readonly QrCodeService qrCodeService;

        public QrCodeController(QrCodeService qrCodeService)
        {
            this.qrCodeService = qrCodeService;
        }

        [HttpPost("GenerateQRCode")]
        public async Task<IActionResult> GenerateQRCode([FromBody] MeetingDto meetingDto)
        {
            if (meetingDto == null)
            {
                return BadRequest("Meeting data is required.");
            }

            var qrCodeImage = await qrCodeService.GenerateQrCode(meetingDto);
            if (qrCodeImage == null)
            {
                return NotFound("QR code could not be generated.");
            }

            return File(qrCodeImage, "image/png");
        }
    }
} 