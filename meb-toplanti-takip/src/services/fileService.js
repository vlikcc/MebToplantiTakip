import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const fileService = {
  // Tek bir dokümanı indir
  downloadFile: async (documentId, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/meetings/download-document/${documentId}`, {
        responseType: 'blob',
      });
      
      // Dosyayı indirme işlemi
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      throw error;
    }
  },
  
  // Bir toplantıya ait tüm dokümanları indir
  downloadFiles: async (meetingId) => {
    try {
      const response = await axios.get(`${API_URL}/meetings/download-documents/${meetingId}`, {
        responseType: 'blob',
      });
      
      // Zip dosyasını indirme işlemi
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Meeting_${meetingId}_Documents.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      throw error;
    }
  },
  
  // Doküman sil - Bu endpoint backend'de yok, eklenmesi gerekiyor
  deleteFile: async (documentId) => {
    try {
      const response = await axios.delete(`${API_URL}/meetings/delete-document/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      throw error;
    }
  },
  
  // Doküman yükle
  uploadFiles: async (meetingId, files) => {
    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const response = await axios.post(`${API_URL}/meetings/upload-document/${meetingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw error;
    }
  },
};

export default fileService;