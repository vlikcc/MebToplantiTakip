﻿namespace MebToplantiTakip.Entities
{
    public class MeetingDocument
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string? DownloadUrl { get; set; }
    }
}
