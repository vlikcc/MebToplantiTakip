// API URL'leri ve diğer yapılandırma ayarları

// Canlı ortam URL'si (HTTPS yerine HTTP kullanıyoruz çünkü sunucu HTTPS desteklemiyor olabilir)
export const API_BASE_URL = 'http://velikececi-001-site1.jtempurl.com/api';

// Geliştirme ortamı URL'si
// export const API_BASE_URL = 'http://localhost:5010/api';

// Alternatif API URL'leri (QR kod desteği için ek URL'ler eklenebilir)
export const ALTERNATIVE_URLS = [];

export const APP_CONFIG = {
  appName: 'MEB Toplantı Takip Sistemi',
  version: '1.0.0',
  useAlternativeUrlsOnError: false,
  useDebugMode: true, // API isteklerinde hata ayıklama için
  qrCodeSettings: {
    retryTimes: 3, // QR kod oluşturma isteği yeniden deneme sayısı
    timeoutInMs: 30000 // QR kod istek zaman aşımı süresi
  }
};