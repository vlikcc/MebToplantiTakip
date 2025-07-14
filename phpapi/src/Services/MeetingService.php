<?php

namespace App\Services;

use App\Models\Meeting;
use Exception;

class MeetingService
{
    public function getAllMeetings()
    {
        return Meeting::with(['location', 'attendees.user', 'documents'])->get();
    }

    public function getMeetingById(int $id)
    {
        return Meeting::with(['location', 'attendees.user', 'documents'])->find($id);
    }

    public function createMeeting(array $data)
    {
        if (empty($data['Title'])) {
            throw new Exception('Toplantı başlığı zorunludur');
        }

        if (empty($data['StartDate']) || empty($data['EndDate'])) {
            throw new Exception('Başlangıç ve bitiş tarihleri zorunludur');
        }

        // Tarih formatı kontrolü (isteğe bağlı)
        $this->validateDateFormat($data['StartDate'], $data['EndDate']);

        $meetingData = [
            'Title' => $data['Title'],
            'StartDate' => $data['StartDate'],
            'EndDate' => $data['EndDate'],
            'Allday' => $data['Allday'] ?? 'false',
            'Color' => $data['Color'] ?? '#007bff',
            'LocationId' => $data['LocationId'] ?? null
        ];

        return Meeting::create($meetingData);
    }

    public function updateMeeting(int $id, array $data)
    {
        $meeting = Meeting::find($id);
        
        if (!$meeting) {
            return null;
        }

        // Tarih güncelleniyorsa kontrol et
        if (isset($data['StartDate']) && isset($data['EndDate'])) {
            $this->validateDateFormat($data['StartDate'], $data['EndDate']);
        }

        $allowedFields = ['Title', 'StartDate', 'EndDate', 'Allday', 'Color', 'LocationId'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        $meeting->update($updateData);
        
        return $meeting->fresh(['location', 'attendees.user', 'documents']);
    }

    public function deleteMeeting(int $id): bool
    {
        $meeting = Meeting::find($id);
        
        if (!$meeting) {
            return false;
        }

        // Katılımcıları ve dökümanları temizle
        $meeting->attendees()->delete();
        $meeting->documents()->delete();

        return $meeting->delete();
    }

    private function validateDateFormat(string $startDate, string $endDate)
    {
        // Basit tarih format kontrolü - gerekirse daha gelişmiş yapılabilir
        $start = strtotime($startDate);
        $end = strtotime($endDate);

        if ($start === false || $end === false) {
            throw new Exception('Geçersiz tarih formatı');
        }

        if ($start >= $end) {
            throw new Exception('Başlangıç tarihi bitiş tarihinden önce olmalıdır');
        }
    }

    public function getMeetingsByDateRange(string $startDate, string $endDate)
    {
        return Meeting::with(['location', 'attendees.user'])
            ->whereBetween('StartDate', [$startDate, $endDate])
            ->orderBy('StartDate')
            ->get();
    }

    public function getMeetingsByLocation(int $locationId)
    {
        return Meeting::with(['location', 'attendees.user'])
            ->where('LocationId', $locationId)
            ->orderBy('StartDate')
            ->get();
    }
} 