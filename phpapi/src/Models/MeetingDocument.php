<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingDocument extends Model
{
    protected $table = 'MeetingDocuments';
    protected $primaryKey = 'Id';
    public $timestamps = true;

    protected $fillable = [
        'MeetingId',
        'FileName',
        'FilePath',
        'DownloadUrl'
    ];

    // İlişkiler
    public function meeting()
    {
        return $this->belongsTo(Meeting::class, 'MeetingId');
    }
} 