import axios from 'axios';
import { API_BASE_URL } from '../config';
import api from './api';

const reportService = {
  /**
   * Toplantı katılım istatistiklerini getirir
   * @param {string} meetingId - Toplantı ID
   * @returns {Promise<Object>} Toplantı katılım istatistikleri
   */
  getMeetingStats: async (meetingId) => {
    try {
      const response = await api.get(`/Reports/MeetingStats/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error('Toplantı istatistikleri alınırken hata oluştu:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının toplantı katılım istatistiklerini getirir
   * @param {string} userId - Kullanıcı ID
   * @returns {Promise<Object>} Kullanıcı katılım istatistikleri
   */
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/Reports/UserStats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Kullanıcı istatistikleri alınırken hata oluştu:', error);
      throw error;
    }
  },

  /**
   * Genel toplantı istatistiklerini getirir
   * @returns {Promise<Object>} Genel toplantı istatistikleri
   */
  getOverallStats: async () => {
    try {
      const response = await api.get('/Reports/OverallStats');
      return response.data;
    } catch (error) {
      console.error('Genel istatistikler alınırken hata oluştu:', error);
      throw error;
    }
  },
};

export default reportService;