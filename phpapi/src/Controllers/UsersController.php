<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Services\UserService;

class UsersController
{
    private $userService;

    public function __construct()
    {
        $this->userService = new UserService();
    }

    public function getAllUsers(Request $request, Response $response): Response
    {
        try {
            $users = $this->userService->getAllUsers();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $users
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcılar getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getUserById(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $user = $this->userService->getUserById($id);
            
            if (!$user) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Kullanıcı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcı getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getUserByDeviceId(Request $request, Response $response, array $args): Response
    {
        try {
            $deviceId = $args['deviceId'];
            $user = $this->userService->getUserByDeviceId($deviceId);
            
            if (!$user) {
                return $response->withStatus(204); // No Content
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcı getirilemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function createUser(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Cihaz ID kontrolü
            $exists = $this->userService->checkUserExists($data['DeviceId']);
            if ($exists) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Bu cihaz ID ile zaten bir kullanıcı kayıtlı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
            }
            
            $user = $this->userService->createUser($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Kullanıcı başarıyla oluşturuldu',
                'data' => $user
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcı oluşturulamadı: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function updateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $user = $this->userService->updateUser($id, $data);
            
            if (!$user) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Kullanıcı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Kullanıcı başarıyla güncellendi',
                'data' => $user
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcı güncellenemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $deleted = $this->userService->deleteUser($id);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Kullanıcı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Kullanıcı başarıyla silindi'
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Kullanıcı silinemedi: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
} 