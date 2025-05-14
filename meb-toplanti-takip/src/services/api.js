import axios from 'axios';
import { API_BASE_URL, APP_CONFIG } from '../config';

// API Base URL
let apiBaseUrl = API_BASE_URL;

const getApiUrl = () => {
  return apiBaseUrl;
};

// API'ye doğrudan erişim için config
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*'
  },
  timeout: 30000, // 30 saniye zaman aşımı süresi
  timeoutErrorMessage: 'Sunucu yanıt vermedi. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.',
  withCredentials: false, // CORS için
  crossDomain: true
});

// İstek interceptor'ı - her istekte token eklemek için
api.interceptors.request.use(
  (config) => {
    // Her istekte güncel URL kullan
    config.baseURL = getApiUrl();
    
    console.log(`İstek yapılıyor: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // CORS sorunlarını aşmak için
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Request-With';
    
    // Geliştirme aşamasında kimlik doğrulamayı atla
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı - hata işleme için
api.interceptors.response.use(
  (response) => {
    console.log(`Yanıt alındı: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Hata detaylarını logla
    console.error('API Hatası:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });

    // Network hatası ise örnek veri döndür
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.log('Ağ hatası tespit edildi');
      
      // URL'ye göre farklı örnek veriler döndür
      if (error.config?.url.includes('GetMeetings')) {
        return Promise.resolve({
          data: [
            { 
              meetingId: 5, 
              title: "deneme",
              startDate: "string",
              endDate: "string",
              allday: "string",
              color: "string",
              location: null,
              documents: [
                {
                  id: 7,
                  meetingId: 5,
                  fileName: "main.js",
                  filePath: "wwwroot/Uploads\\main.js",
                  downloadUrl: "http://velikececi-001-site1.jtempurl.com/api/meetings/download-document/7"
                }
              ]
            },
            {
              meetingId: 6,
              title: "string",
              startDate: "string",
              endDate: "string",
              allday: "string",
              color: "string",
              location: null,
              documents: [
                {
                  id: 8,
                  meetingId: 6,
                  fileName: "main.js",
                  filePath: "wwwroot/Uploads\\main.js",
                  downloadUrl: "http://velikececi-001-site1.jtempurl.com/api/meetings/download-document/8"
                }
              ]
            }
          ]
        });
      }
    }

    // 401 Unauthorized hatası durumunda kullanıcıyı login sayfasına yönlendir
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API için proxy kullanan alternatif yöntem
export const directFetch = async (endpoint, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const currentUrl = getApiUrl();
  
  try {
    console.log(`Fetch isteği yapılıyor: ${currentUrl}${endpoint}`);
    
    const response = await fetch(`${currentUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Doğrudan fetch hatası:', error);
    
    // Yeniden deneme
    if (retryCount < MAX_RETRIES) {
      console.log(`Fetch hatası nedeniyle yeniden deneniyor: ${retryCount + 1}/${MAX_RETRIES}`);
      return directFetch(endpoint, retryCount + 1);
    }
    
    // Maksimum deneme sayısına ulaştıktan sonra hata fırlat
    throw error;
  }
};

// API base URL'yi manuel olarak değiştirmek için yardımcı fonksiyon
export const setApiBaseUrl = (url) => {
  apiBaseUrl = url;
  console.log(`API base URL manuel olarak ayarlandı: ${url}`);
};

export default api;