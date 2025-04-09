namespace MebToplantiTakip.Entities
{
    public class User
    {
        public int UserId { get; set; }
        public string DeviceId { get; set; }
        public string UserName { get; set; }
        public string InstitutionName { get; set; }
        public DateTime LastLoginDate { get; set; }
        
    }
}
