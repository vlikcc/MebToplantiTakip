<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\QrCodeService;

class QrCodeController
{
    private $qrCodeService;

    public function __construct()
    {
        $this->qrCodeService = new QrCodeService();
    }

    public function generateMeetingQrCode(Request $request, Response $response, array $args): Response
    {
        try {
            $meetingId = (int)$args['meetingId'];
            $queryParams = $request->getQueryParams();
            
            $size = isset($queryParams['size']) ? (int)$queryParams['size'] : 200;
            $format = $queryParams['format'] ?? 'png';
            
            $qrCode = $this->qrCodeService->generateMeetingQrCode($meetingId, $size, $format);
            
            if (!$qrCode) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Toplantı bulunamadı'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            if ($format === 'base64') {
                $response->getBody()->write(json_encode([
                    'success' => true,
                    'data' => $qrCode
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                // PNG/SVG formatında direkt döndür
                $response->getBody()->write($qrCode);
                $contentType = $format === 'svg' ? 'image/svg+xml' : 'image/png';
                return $response->withHeader('Content-Type', $contentType);
            }
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'QR kod oluşturulamadı: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function generateCustomQrCode(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (empty($data['text'])) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Metin alanı zorunludur'
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }
            
            $text = $data['text'];
            $size = $data['size'] ?? 200;
            $format = $data['format'] ?? 'png';
            $errorCorrection = $data['errorCorrection'] ?? 'M';
            
            $qrCode = $this->qrCodeService->generateCustomQrCode($text, $size, $format, $errorCorrection);
            
            if ($format === 'base64') {
                $response->getBody()->write(json_encode([
                    'success' => true,
                    'data' => $qrCode
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                $response->getBody()->write($qrCode);
                $contentType = $format === 'svg' ? 'image/svg+xml' : 'image/png';
                return $response->withHeader('Content-Type', $contentType);
            }
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Özel QR kod oluşturulamadı: ' . $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
} 