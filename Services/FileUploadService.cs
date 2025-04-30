namespace MebToplantiTakip.Services
{
    public class FileUploadService
    {
        private readonly string UploadPath = "wwwroot/Uploads";

        public async Task<string> UploadFile (IFormFile file)
        {
            if (file == null || file.Length == 0) return null;
            var filePath = Path.Combine(UploadPath, file.FileName);
            Directory.CreateDirectory(UploadPath);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return filePath;
        }
    }
}
