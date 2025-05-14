using Microsoft.AspNetCore.Mvc;
using MebToplantiTakip.Services;
using MebToplantiTakip.Entities;
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
        public async Task<IActionResult> GenerateQRCode([FromBody] Meeting meeting)
        {
            if (meeting == null)
            {
                return BadRequest("Meeting data is required.");
            }

            var qrCodeImage = await qrCodeService.GenerateQrCode(meeting);
            if (qrCodeImage == null)
            {
                return NotFound("QR code could not be generated.");
            }

            return File(qrCodeImage, "image/png");
        }
    }
} 