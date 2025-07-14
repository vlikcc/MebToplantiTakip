<?php

namespace App\Services;

use App\Models\Location;
use Exception;

class LocationService
{
    public function getAllLocations()
    {
        return Location::all();
    }

    public function getLocationById(int $id)
    {
        return Location::find($id);
    }

    public function createLocation(array $data)
    {
        if (empty($data['LocationName'])) {
            throw new Exception('Lokasyon adı zorunludur');
        }

        if (!isset($data['Latitude']) || !isset($data['Longitude'])) {
            throw new Exception('Enlem ve boylam bilgileri zorunludur');
        }

        // Koordinat geçerliliği kontrolü
        $latitude = (float)$data['Latitude'];
        $longitude = (float)$data['Longitude'];

        if ($latitude < -90 || $latitude > 90) {
            throw new Exception('Enlem değeri -90 ile 90 arasında olmalıdır');
        }

        if ($longitude < -180 || $longitude > 180) {
            throw new Exception('Boylam değeri -180 ile 180 arasında olmalıdır');
        }

        // Lokasyon adı benzersizliği kontrolü
        if ($this->isLocationNameExists($data['LocationName'])) {
            throw new Exception('Bu lokasyon adı zaten kullanılmakta');
        }

        $locationData = [
            'LocationName' => $data['LocationName'],
            'Latitude' => $latitude,
            'Longitude' => $longitude
        ];

        return Location::create($locationData);
    }

    public function updateLocation(int $id, array $data)
    {
        $location = Location::find($id);
        
        if (!$location) {
            return null;
        }

        // Koordinat güncelleniyorsa geçerlilik kontrolü
        if (isset($data['Latitude'])) {
            $latitude = (float)$data['Latitude'];
            if ($latitude < -90 || $latitude > 90) {
                throw new Exception('Enlem değeri -90 ile 90 arasında olmalıdır');
            }
        }

        if (isset($data['Longitude'])) {
            $longitude = (float)$data['Longitude'];
            if ($longitude < -180 || $longitude > 180) {
                throw new Exception('Boylam değeri -180 ile 180 arasında olmalıdır');
            }
        }

        // Lokasyon adı güncelleniyorsa benzersizlik kontrolü
        if (isset($data['LocationName']) && $data['LocationName'] !== $location->LocationName) {
            if ($this->isLocationNameExists($data['LocationName'], $id)) {
                throw new Exception('Bu lokasyon adı zaten kullanılmakta');
            }
        }

        $allowedFields = ['LocationName', 'Latitude', 'Longitude'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        $location->update($updateData);
        
        return $location->fresh();
    }

    public function deleteLocation(int $id): bool
    {
        $location = Location::find($id);
        
        if (!$location) {
            return false;
        }

        // Bu lokasyonu kullanan toplantılar var mı kontrol et
        $meetingCount = $location->meetings()->count();
        if ($meetingCount > 0) {
            throw new Exception('Bu lokasyon toplantılarda kullanıldığı için silinemez');
        }

        return $location->delete();
    }

    public function searchLocationsByName(string $locationName)
    {
        return Location::where('LocationName', 'LIKE', '%' . $locationName . '%')->get();
    }

    public function getLocationsByDistance(float $lat, float $lng, float $maxDistance)
    {
        $locations = Location::all();
        $nearbyLocations = [];

        foreach ($locations as $location) {
            $distance = $location->calculateDistance($lat, $lng);
            if ($distance <= $maxDistance) {
                $locationArray = $location->toArray();
                $locationArray['distance'] = round($distance, 2);
                $nearbyLocations[] = $locationArray;
            }
        }

        // Mesafeye göre sırala
        usort($nearbyLocations, function($a, $b) {
            return $a['distance'] <=> $b['distance'];
        });

        return $nearbyLocations;
    }

    public function isLocationNameExists(string $name, int $excludeId = null): bool
    {
        $query = Location::where('LocationName', $name);
        
        if ($excludeId) {
            $query->where('LocationId', '!=', $excludeId);
        }
        
        return $query->exists();
    }
} 