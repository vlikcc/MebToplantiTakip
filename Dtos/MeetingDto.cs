using MebToplantiTakip.Entities;

namespace MebToplantiTakip.Dtos
{
    public class MeetingDto
    {
    
        public string Title { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Allday { get; set; }
        public string Color { get; set; }
        public int? LocationId { get; set; }  // Location objesi yerine sadece LocationId

    }
}
