<?php

namespace App\Services;

use App\Models\Attendee;
use App\Models\Meeting;
use App\Models\User;
use Exception;

class AttendeeService
{
    public function getAllAttendees()
    {
        return Attendee::with(['meeting', 'user'])->get();
    }

    public function getMeetingAttendees(int $meetingId)
    {
        return Attendee::with(['user'])
            ->where('MeetingId', $meetingId)
            ->get();
    }

    public function getUserMeetings(int $userId)
    {
        return Attendee::with(['meeting.location'])
            ->where('UserId', $userId)
            ->get();
    }

    public function addAttendee(array $data)
    {
        if (empty($data['MeetingId']) || empty($data['UserId'])) {
            throw new Exception('MeetingId ve UserId alanları zorunludur');
        }

        $meetingId = (int)$data['MeetingId'];
        $userId = (int)$data['UserId'];

        // Toplantı var mı kontrol et
        $meeting = Meeting::find($meetingId);
        if (!$meeting) {
            throw new Exception('Belirtilen toplantı bulunamadı');
        }

        // Kullanıcı var mı kontrol et
        $user = User::find($userId);
        if (!$user) {
            throw new Exception('Belirtilen kullanıcı bulunamadı');
        }

        // Zaten katılımcı mı kontrol et
        $existingAttendee = Attendee::where('MeetingId', $meetingId)
            ->where('UserId', $userId)
            ->first();

        if ($existingAttendee) {
            throw new Exception('Kullanıcı zaten bu toplantıya katılımcı');
        }

        $attendeeData = [
            'MeetingId' => $meetingId,
            'UserId' => $userId
        ];

        return Attendee::create($attendeeData);
    }

    public function deleteAttendee(int $id): bool
    {
        $attendee = Attendee::find($id);
        
        if (!$attendee) {
            return false;
        }

        return $attendee->delete();
    }

    public function removeUserFromMeeting(int $userId, int $meetingId): bool
    {
        $attendee = Attendee::where('UserId', $userId)
            ->where('MeetingId', $meetingId)
            ->first();

        if (!$attendee) {
            return false;
        }

        return $attendee->delete();
    }

    public function isUserAttendingMeeting(int $userId, int $meetingId): bool
    {
        return Attendee::where('UserId', $userId)
            ->where('MeetingId', $meetingId)
            ->exists();
    }

    public function getMeetingAttendeeCount(int $meetingId): int
    {
        return Attendee::where('MeetingId', $meetingId)->count();
    }

    public function getAttendeeById(int $id)
    {
        return Attendee::with(['meeting', 'user'])->find($id);
    }

    public function updateAttendee(int $id, array $data)
    {
        $attendee = Attendee::find($id);
        
        if (!$attendee) {
            return null;
        }

        // Yeni katılım bilgileri kontrolü
        if (isset($data['MeetingId']) || isset($data['UserId'])) {
            $newMeetingId = $data['MeetingId'] ?? $attendee->MeetingId;
            $newUserId = $data['UserId'] ?? $attendee->UserId;

            // Aynı toplantıya aynı kullanıcının başka bir kaydı var mı?
            $duplicateCheck = Attendee::where('MeetingId', $newMeetingId)
                ->where('UserId', $newUserId)
                ->where('Id', '!=', $id)
                ->first();

            if ($duplicateCheck) {
                throw new Exception('Bu kullanıcı zaten belirtilen toplantıya katılımcı');
            }
        }

        $allowedFields = ['MeetingId', 'UserId'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        $attendee->update($updateData);
        
        return $attendee->fresh(['meeting', 'user']);
    }
} 