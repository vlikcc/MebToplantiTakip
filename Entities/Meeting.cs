﻿namespace MebToplantiTakip.Entities
{
    public class Meeting
    {
        public int MeetingId { get; set; }
        public string Title { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Allday { get; set; }
        public string Color { get; set; }
        public Location Location { get; set; }

    }
}
