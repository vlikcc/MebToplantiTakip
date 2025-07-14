<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\MeetingService;

class MeetingsController
{
    private $meetingService;

    public function __construct()
    {
        $this->meetingService = new MeetingService();
    }

    public function getAllMeetings(Request $request, Response $response): Response
    {
        try {
            $meetings = $this->meetingService->getAllMeetings();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $meetings
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Toplantılar getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getMeetingById(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $meeting = $this->meetingService->getMeetingById($id);
            
            if (!$meeting) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Toplantı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $meeting
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Toplantı getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function createMeeting(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            $meeting = $this->meetingService->createMeeting($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Toplantı başarıyla oluşturuldu',
                'data' => $meeting
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Toplantı oluşturulamadı: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function updateMeeting(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $meeting = $this->meetingService->updateMeeting($id, $data);
            
            if (!$meeting) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Toplantı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Toplantı başarıyla güncellendi',
                'data' => $meeting
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Toplantı güncellenemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function deleteMeeting(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $deleted = $this->meetingService->deleteMeeting($id);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Toplantı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Toplantı başarıyla silindi'
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Toplantı silinemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
} 