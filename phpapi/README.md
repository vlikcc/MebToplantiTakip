# MEB Toplantı Takip PHP API

Bu proje, MEB Toplantı Takip sisteminin PHP API versiyonudur. Slim Framework ve Eloquent ORM kullanılarak geliştirilmiştir.

## Özellikler

- **Kullanıcı Yönetimi**: Kullanıcı ekleme, güncelleme, silme ve listeleme
- **Toplantı Yönetimi**: Toplantı oluşturma, düzenleme ve yönetimi
- **Katılımcı Takibi**: Toplantı katılımcılarını yönetme
- **Lokasyon Servisleri**: GPS koordinatları ile lokasyon yönetimi
- **QR Kod Üretimi**: Toplantılar için QR kod oluşturma
- **Dosya Yükleme**: Toplantı dökümanları yönetimi
- **CORS Desteği**: Frontend entegrasyonu için
- **RESTful API**: Standart HTTP metodları

## Gereksinimler

- PHP 8.1 veya üzeri
- Composer
- MySQL/MariaDB
- Apache/Nginx (isteğe bağlı)

## Kurulum

1. **Composer paketlerini yükleyin:**
```bash
cd phpapi
composer install
```

2. **Environment dosyasını oluşturun:**
```bash
cp env.example .env
```

3. **Environment değişkenlerini düzenleyin:**
- Veritabanı bağlantı bilgileri
- JWT secret key
- Dosya yolları

4. **Veritabanı tablolarını oluşturun:**
```php
// Database sınıfının createTables() methodunu çalıştırın
$database = new \App\Config\Database();
$database->createTables();
```

5. **Geliştirme sunucusunu başlatın:**
```bash
composer start
# veya
php -S localhost:8080 -t public
```

## API Endpoints

### Kullanıcılar
- `GET /api/v1/users` - Tüm kullanıcıları listele
- `GET /api/v1/users/{id}` - Kullanıcı detayı
- `GET /api/v1/users/device/{deviceId}` - Device ID ile kullanıcı
- `POST /api/v1/users` - Yeni kullanıcı oluştur
- `PUT /api/v1/users/{id}` - Kullanıcı güncelle
- `DELETE /api/v1/users/{id}` - Kullanıcı sil

### Toplantılar
- `GET /api/v1/meetings` - Tüm toplantıları listele
- `GET /api/v1/meetings/{id}` - Toplantı detayı
- `POST /api/v1/meetings` - Yeni toplantı oluştur
- `PUT /api/v1/meetings/{id}` - Toplantı güncelle
- `DELETE /api/v1/meetings/{id}` - Toplantı sil

### Katılımcılar
- `GET /api/v1/attendees` - Tüm katılımcıları listele
- `GET /api/v1/attendees/meeting/{meetingId}` - Toplantı katılımcıları
- `GET /api/v1/attendees/user/{userId}` - Kullanıcının toplantıları
- `POST /api/v1/attendees` - Katılımcı ekle
- `DELETE /api/v1/attendees/{id}` - Katılımcı sil

### Lokasyonlar
- `GET /api/v1/locations` - Tüm lokasyonları listele
- `GET /api/v1/locations/{id}` - Lokasyon detayı
- `POST /api/v1/locations` - Yeni lokasyon oluştur
- `PUT /api/v1/locations/{id}` - Lokasyon güncelle
- `DELETE /api/v1/locations/{id}` - Lokasyon sil

### QR Kodlar
- `GET /api/v1/qrcode/meeting/{meetingId}` - Toplantı QR kodu
- `POST /api/v1/qrcode/custom` - Özel QR kod

## Kullanım Örnekleri

### Kullanıcı Oluşturma
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "DeviceId": "device123",
    "UserName": "Ahmet Yılmaz",
    "InstitutionName": "MEB"
  }'
```

### Toplantı Oluşturma
```bash
curl -X POST http://localhost:8080/api/v1/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Haftalık Toplantı",
    "StartDate": "2024-01-15 10:00:00",
    "EndDate": "2024-01-15 12:00:00",
    "LocationId": 1
  }'
```

### QR Kod Alma
```bash
curl "http://localhost:8080/api/v1/qrcode/meeting/1?format=base64&size=300"
```

## Proje Yapısı

```
phpapi/
├── public/              # Web root
│   └── index.php       # Giriş noktası
├── src/
│   ├── Controllers/    # API Controller'ları
│   ├── Services/       # İş mantığı katmanı
│   ├── Models/         # Eloquent modelleri
│   ├── Middleware/     # Middleware sınıfları
│   └── Config/         # Konfigürasyon dosyaları
├── uploads/            # Yüklenen dosyalar
├── temp/               # Geçici dosyalar
├── qrcodes/           # QR kod dosyaları
├── composer.json      # Composer bağımlılıkları
└── README.md          # Bu dosya
```

## Teknolojiler

- **Slim Framework 4**: Hafif PHP micro framework
- **Eloquent ORM**: Laravel'in ORM'i
- **PHP-DI**: Dependency injection container
- **Endroid QR Code**: QR kod üretimi
- **Respect/Validation**: Veri doğrulama
- **PHPDotEnv**: Environment yönetimi

## Güvenlik

- CORS middleware ile cross-origin istekleri kontrol
- Input validation ile veri doğrulama
- SQL injection koruması (Eloquent ORM)
- Error handling ile güvenli hata mesajları

## Geliştirme

Geliştirme sırasında debug modunu açmak için:
```php
$errorMiddleware = $app->addErrorMiddleware(true, true, true);
```

## Test

API'yi test etmek için Postman koleksiyonu veya benzeri araçlar kullanabilirsiniz.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 