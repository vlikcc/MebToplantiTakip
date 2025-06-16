import api, { directFetch, setApiBaseUrl } from './api';
import { ALTERNATIVE_URLS } from '../config';

// İstekleri yeniden deneme mekanizması
const retryApiCall = async (apiCallFunction, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCallFunction();
    } catch (error) {
      console.error(`API isteği başarısız (Deneme ${attempt + 1}/${maxRetries + 1}):`, error);
      lastError = error;
      
      // Eğer bu bir ağ hatası değilse, yeniden denemeyi durdur
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNABORTED') {
        break;
      }
    }
  }
  
  throw lastError;
};

const meetingService = {
  getAllMeetings: async () => {
    try {
      // Axios ile deneme yap
      return await retryApiCall(async () => {
        console.log('Toplantılar axios ile getiriliyor...');
        const response = await api.get('/Meetings/GetMeetings');
        console.log('API yanıtı (axios):', response.data);
        return response.data;
      });
    } catch (axiosError) {
      console.log('Axios istekleri başarısız, fetch API deneniyor...');
      
      try {
        // Fetch API ile deneme yap
        const data = await directFetch('/Meetings/GetMeetings');
        console.log('API yanıtı (fetch):', data);
        return data;
      } catch (fetchError) {
        console.error('Tüm istekler başarısız:', fetchError);
        throw new Error('Toplantı verileri alınamadı. Lütfen daha sonra tekrar deneyin.');
      }
    }
  },
  
  // Diğer metodlar
  getMeetingById: async (id) => {
    try {
      return await retryApiCall(async () => {
        const response = await api.get(`/Meetings/${id}`);
        return response.data;
      });
    } catch (axiosError) {
      try {
        console.log('Axios ile istek başarısız, fetch API ile deneniyor...');
        return await directFetch(`/Meetings/${id}`);
      } catch (error) {
        console.error(`Toplantı (ID: ${id}) bulunamadı:`, error);
        
        // Örnek veri döndür
        return {
          meetingId: parseInt(id),
          title: "Örnek Toplantı",
          startDate: "string",
          endDate: "string",
          allday: "string",
          color: "string",
          location: null,
          documents: []
        };
      }
    }
  },
  
  createMeeting: async (meetingData, files = []) => {
    try {
      // FormData oluştur - backend'in beklediği format
      const formData = new FormData();
      
      // Meeting verilerini formData'ya ekle
      formData.append('Title', meetingData.title);
      formData.append('StartDate', meetingData.startDate);
      formData.append('EndDate', meetingData.endDate);
      formData.append('Allday', meetingData.allday);
      formData.append('Color', meetingData.color);
      
      // LocationId gönder
      if (meetingData.location && meetingData.location.locationId) {
        formData.append('LocationId', meetingData.location.locationId.toString());
      }
      
      // Dosyaları ekle
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }
      
      // Backend'in doğru endpoint'ine istek gönder
      const response = await api.post('/Meetings/AddMeeting', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Toplantı oluşturulurken hata:', error);
      throw error;
    }
  },
  
  updateMeeting: async (id, meetingData) => {
    try {
      const response = await api.put(`/Meetings/${id}`, meetingData);
      return response.data;
    } catch (error) {
      console.error('Toplantı güncellenirken hata:', error);
      throw error;
    }
  },
  
  deleteMeeting: async (id) => {
    try {
      const response = await api.delete(`/Meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Toplantı silinirken hata:', error);
      throw error;
    }
  }
};

export default meetingService;