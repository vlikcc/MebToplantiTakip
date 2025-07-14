<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendee extends Model
{
    protected $table = 'Attendees';
    protected $primaryKey = 'Id';
    public $timestamps = true;

    protected $fillable = [
        'MeetingId',
        'UserId'
    ];

    // İlişkiler
    public function meeting()
    {
        return $this->belongsTo(Meeting::class, 'MeetingId');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'UserId');
    }
} 