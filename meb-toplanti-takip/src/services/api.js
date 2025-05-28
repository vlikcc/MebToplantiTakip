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
  timeout: 30000,
  timeoutErrorMessage: 'Sunucu yanıt vermedi. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.',
  withCredentials: false,
  crossDomain: true
});

// İstek interceptor'ı
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
    
    if (APP_CONFIG.useDebugMode) {
      console.log(`İstek yapılıyor: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
api.interceptors.response.use(
  (response) => {
    if (APP_CONFIG.useDebugMode) {
      console.log(`Yanıt alındı: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
      if (response.data) {
        console.log('API yanıtı:', response.data);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      // Sunucudan yanıt alındı ama hata kodu döndü
      console.error(`API Hatası: ${error.response.status} ${error.response.statusText}`, error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
      }
      
      return Promise.reject(error.response.data || error.response.statusText);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Sunucuya ulaşılamıyor:', error.request);
      return Promise.reject(new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.'));
    } else {
      // İstek oluşturulurken hata oluştu
      console.error('İstek hatası:', error.message);
      return Promise.reject(new Error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
    }
  }
);

export default api;

// Doğrudan fetch API kullanımı için yardımcı fonksiyon
export const directFetch = async (endpoint) => {
  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch hatası (${endpoint}):`, error);
    throw error;
  }
};

// API base URL'yi manuel olarak değiştirmek için yardımcı fonksiyon
export const setApiBaseUrl = (url) => {
  apiBaseUrl = url;
  console.log(`API base URL manuel olarak ayarlandı: ${url}`);
};