<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $table = 'Locations';
    protected $primaryKey = 'LocationId';
    public $timestamps = true;

    protected $fillable = [
        'Latitude',
        'Longitude',
        'LocationName'
    ];

    // İlişkiler
    public function meetings()
    {
        return $this->hasMany(Meeting::class, 'LocationId');
    }

    // Mesafe hesaplama fonksiyonu
    public function calculateDistance($lat, $lng)
    {
        $earthRadius = 6371; // km

        $latDelta = deg2rad($lat - $this->Latitude);
        $lngDelta = deg2rad($lng - $this->Longitude);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($this->Latitude)) * cos(deg2rad($lat)) *
             sin($lngDelta / 2) * sin($lngDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
} 