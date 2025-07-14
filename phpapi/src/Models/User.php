<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'Users';
    protected $primaryKey = 'UserId';
    public $timestamps = true;

    protected $fillable = [
        'DeviceId',
        'UserName',
        'InstitutionName',
        'LastLoginDate'
    ];

    protected $dates = [
        'LastLoginDate'
    ];

    // İlişkiler
    public function attendees()
    {
        return $this->hasMany(Attendee::class, 'UserId');
    }

    public function meetings()
    {
        return $this->belongsToMany(Meeting::class, 'Attendees', 'UserId', 'MeetingId');
    }
} 