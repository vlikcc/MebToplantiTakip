<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\LocationService;

class LocationsController
{
    private $locationService;

    public function __construct()
    {
        $this->locationService = new LocationService();
    }

    public function getAllLocations(Request $request, Response $response): Response
    {
        try {
            $locations = $this->locationService->getAllLocations();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $locations
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Lokasyonlar getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getLocationById(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $location = $this->locationService->getLocationById($id);
            
            if (!$location) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Lokasyon bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $location
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Lokasyon getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function createLocation(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            $location = $this->locationService->createLocation($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Lokasyon başarıyla oluşturuldu',
                'data' => $location
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Lokasyon oluşturulamadı: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function updateLocation(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $location = $this->locationService->updateLocation($id, $data);
            
            if (!$location) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Lokasyon bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Lokasyon başarıyla güncellendi',
                'data' => $location
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Lokasyon güncellenemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function deleteLocation(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $deleted = $this->locationService->deleteLocation($id);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Lokasyon bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Lokasyon başarıyla silindi'
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Lokasyon silinemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
} 