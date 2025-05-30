using QRCoder;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using MebToplantiTakip.Dtos;
using System.Text.Json;
using MebToplantiTakip.Entities;

namespace MebToplantiTakip.Services
{
   

    public class QrCodeService
    {
        public async Task<byte[]> GenerateQrCode(Meeting meeting)
        {
             
            string meetingInfo = JsonSerializer.Serialize(meeting);

            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData =   qrGenerator.CreateQrCode(meetingInfo, QRCodeGenerator.ECCLevel.Q);
                using (BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData))
                {
                    
                     return  qrCode.GetGraphic(20);
                }
            }
        }
    }
} 