<?php

namespace App\Services;

use App\Models\Meeting;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelMedium;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelLow;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelQuartile;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelHigh;
use Exception;

class QrCodeService
{
    public function generateMeetingQrCode(int $meetingId, int $size = 200, string $format = 'png')
    {
        $meeting = Meeting::with(['location'])->find($meetingId);
        
        if (!$meeting) {
            return null;
        }
        
        // Toplantı bilgilerini JSON formatında hazırla
        $meetingData = [
            'meetingId' => $meeting->MeetingId,
            'title' => $meeting->Title,
            'startDate' => $meeting->StartDate,
            'endDate' => $meeting->EndDate,
            'location' => $meeting->location ? $meeting->location->LocationName : null
        ];
        
        $qrText = json_encode($meetingData);
        
        return $this->generateQrCode($qrText, $size, $format);
    }
    
    public function generateCustomQrCode(string $text, int $size = 200, string $format = 'png', string $errorCorrection = 'M')
    {
        return $this->generateQrCode($text, $size, $format, $errorCorrection);
    }
    
    private function generateQrCode(string $text, int $size = 200, string $format = 'png', string $errorCorrection = 'M')
    {
        $qrCode = QrCode::create($text);
        
        // Error correction level ayarla
        switch ($errorCorrection) {
            case 'L':
                $qrCode->setErrorCorrectionLevel(new ErrorCorrectionLevelLow());
                break;
            case 'M':
                $qrCode->setErrorCorrectionLevel(new ErrorCorrectionLevelMedium());
                break;
            case 'Q':
                $qrCode->setErrorCorrectionLevel(new ErrorCorrectionLevelQuartile());
                break;
            case 'H':
                $qrCode->setErrorCorrectionLevel(new ErrorCorrectionLevelHigh());
                break;
            default:
                $qrCode->setErrorCorrectionLevel(new ErrorCorrectionLevelMedium());
        }
        
        $qrCode->setSize($size);
        $qrCode->setMargin(10);
        
        switch ($format) {
            case 'svg':
                $writer = new SvgWriter();
                $result = $writer->write($qrCode);
                return $result->getString();
                
            case 'base64':
                $writer = new PngWriter();
                $result = $writer->write($qrCode);
                return 'data:image/png;base64,' . base64_encode($result->getString());
                
            case 'png':
            default:
                $writer = new PngWriter();
                $result = $writer->write($qrCode);
                return $result->getString();
        }
    }
    
    public function generateQrCodeForUrl(string $url, int $size = 200, string $format = 'png')
    {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new Exception('Geçersiz URL formatı');
        }
        
        return $this->generateQrCode($url, $size, $format);
    }
    
    public function generateQrCodeForWiFi(string $ssid, string $password, string $security = 'WPA', bool $hidden = false)
    {
        $wifiText = "WIFI:T:{$security};S:{$ssid};P:{$password};H:" . ($hidden ? 'true' : 'false') . ";;";
        return $this->generateQrCode($wifiText);
    }
    
    public function generateQrCodeForContact(string $name, string $phone = '', string $email = '', string $organization = '')
    {
        $vcard = "BEGIN:VCARD\n";
        $vcard .= "VERSION:3.0\n";
        $vcard .= "FN:{$name}\n";
        if ($phone) $vcard .= "TEL:{$phone}\n";
        if ($email) $vcard .= "EMAIL:{$email}\n";
        if ($organization) $vcard .= "ORG:{$organization}\n";
        $vcard .= "END:VCARD";
        
        return $this->generateQrCode($vcard);
    }
    
    public function generateQrCodeForSMS(string $phoneNumber, string $message = '')
    {
        $smsText = "SMSTO:{$phoneNumber}:{$message}";
        return $this->generateQrCode($smsText);
    }
    
    public function generateQrCodeForEmail(string $email, string $subject = '', string $body = '')
    {
        $emailText = "mailto:{$email}";
        if ($subject || $body) {
            $emailText .= "?";
            if ($subject) $emailText .= "subject=" . urlencode($subject);
            if ($subject && $body) $emailText .= "&";
            if ($body) $emailText .= "body=" . urlencode($body);
        }
        
        return $this->generateQrCode($emailText);
    }
    
    public function saveQrCodeToFile(string $text, string $fileName, int $size = 200): string
    {
        $qrCodePath = $_ENV['QR_CODE_PATH'] ?? 'qrcodes/';
        
        if (!is_dir($qrCodePath)) {
            mkdir($qrCodePath, 0755, true);
        }
        
        $filePath = $qrCodePath . $fileName . '.png';
        $qrCodeData = $this->generateQrCode($text, $size, 'png');
        
        file_put_contents($filePath, $qrCodeData);
        
        return $filePath;
    }
    
    public function deleteQrCodeFile(string $fileName): bool
    {
        $qrCodePath = $_ENV['QR_CODE_PATH'] ?? 'qrcodes/';
        $filePath = $qrCodePath . $fileName . '.png';
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return false;
    }
    
    public function getQrCodeFiles(): array
    {
        $qrCodePath = $_ENV['QR_CODE_PATH'] ?? 'qrcodes/';
        
        if (!is_dir($qrCodePath)) {
            return [];
        }
        
        $files = scandir($qrCodePath);
        $qrFiles = [];
        
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'png') {
                $qrFiles[] = [
                    'filename' => $file,
                    'path' => $qrCodePath . $file,
                    'size' => filesize($qrCodePath . $file),
                    'created' => filemtime($qrCodePath . $file)
                ];
            }
        }
        
        return $qrFiles;
    }
} 