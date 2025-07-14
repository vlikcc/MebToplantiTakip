<?php

namespace App\Services;

use App\Models\User;
use Exception;

class UserService
{
    public function getAllUsers()
    {
        return User::all();
    }

    public function getUserById(int $id)
    {
        return User::find($id);
    }

    public function getUserByDeviceId(string $deviceId)
    {
        return User::where('DeviceId', $deviceId)->first();
    }

    public function checkUserExists(string $deviceId): bool
    {
        return User::where('DeviceId', $deviceId)->exists();
    }

    public function createUser(array $data)
    {
        if (empty($data['DeviceId']) || empty($data['UserName'])) {
            throw new Exception('DeviceId ve UserName alanları zorunludur');
        }

        // DeviceId benzersizliği kontrolü
        if ($this->checkUserExists($data['DeviceId'])) {
            throw new Exception('Bu DeviceId ile zaten bir kullanıcı kayıtlı');
        }

        $userData = [
            'DeviceId' => $data['DeviceId'],
            'UserName' => $data['UserName'],
            'InstitutionName' => $data['InstitutionName'] ?? '',
            'LastLoginDate' => $data['LastLoginDate'] ?? now()
        ];

        return User::create($userData);
    }

    public function updateUser(int $id, array $data)
    {
        $user = User::find($id);
        
        if (!$user) {
            return null;
        }

        // DeviceId güncelleniyorsa benzersizlik kontrolü
        if (isset($data['DeviceId']) && $data['DeviceId'] !== $user->DeviceId) {
            if ($this->checkUserExists($data['DeviceId'])) {
                throw new Exception('Bu DeviceId ile zaten başka bir kullanıcı kayıtlı');
            }
        }

        $allowedFields = ['DeviceId', 'UserName', 'InstitutionName', 'LastLoginDate'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        $user->update($updateData);
        
        return $user->fresh();
    }

    public function deleteUser(int $id): bool
    {
        $user = User::find($id);
        
        if (!$user) {
            return false;
        }

        // Kullanıcının aktif toplantı katılımları var mı kontrol et
        $activeAttendances = $user->attendees()->count();
        if ($activeAttendances > 0) {
            throw new Exception('Kullanıcının aktif toplantı katılımları bulunduğu için silinemez');
        }

        return $user->delete();
    }
} 