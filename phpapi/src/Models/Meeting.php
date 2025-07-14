<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $table = 'Meetings';
    protected $primaryKey = 'MeetingId';
    public $timestamps = true;

    protected $fillable = [
        'Title',
        'StartDate',
        'EndDate',
        'Allday',
        'Color',
        'LocationId'
    ];

    // İlişkiler
    public function location()
    {
        return $this->belongsTo(Location::class, 'LocationId');
    }

    public function attendees()
    {
        return $this->hasMany(Attendee::class, 'MeetingId');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'Attendees', 'MeetingId', 'UserId');
    }

    public function documents()
    {
        return $this->hasMany(MeetingDocument::class, 'MeetingId');
    }
} 