<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\AttendeeService;

class AttendeesController
{
    private $attendeeService;

    public function __construct()
    {
        $this->attendeeService = new AttendeeService();
    }

    public function getAllAttendees(Request $request, Response $response): Response
    {
        try {
            $attendees = $this->attendeeService->getAllAttendees();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $attendees
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Katılımcılar getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getMeetingAttendees(Request $request, Response $response, array $args): Response
    {
        try {
            $meetingId = (int)$args['meetingId'];
            $attendees = $this->attendeeService->getMeetingAttendees($meetingId);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $attendees
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Toplantı katılımcıları getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getUserMeetings(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = (int)$args['userId'];
            $meetings = $this->attendeeService->getUserMeetings($userId);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $meetings
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcı toplantıları getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function addAttendee(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            $attendee = $this->attendeeService->addAttendee($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Katılımcı başarıyla eklendi',
                'data' => $attendee
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Katılımcı eklenemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function deleteAttendee(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $deleted = $this->attendeeService->deleteAttendee($id);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Katılımcı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Katılımcı başarıyla silindi'
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Katılımcı silinemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
} 