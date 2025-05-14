import axios from 'axios';
import { API_BASE_URL } from '../config';

const reportService = {
  /**
   * Toplantı katılım istatistiklerini getirir
   * @param {string} meetingId - Toplantı ID
   * @returns {Promise<Object>} Toplantı katılım istatistikleri
   */
  getMeetingStats: async (meetingId) => {
    try {
      // API endpoint henüz oluşturulmadığı için şimdilik mock veri döndürelim
      // Gerçek uygulamada bu kısım API'ye bağlanacak
      // const response = await axios.get(`${API_BASE_URL}/api/Reports/MeetingStats/${meetingId}`);
      // return response.data;
      
      // Mock veri
      return {
        totalAttendees: 15,
        attendanceRate: 75, // yüzde olarak
        institutionBreakdown: [
          { name: 'MEB Merkez', count: 5 },
          { name: 'İl Milli Eğitim', count: 4 },
          { name: 'İlçe Milli Eğitim', count: 3 },
          { name: 'Okul', count: 3 },
        ],
        timeStats: {
          averageStayDuration: 120, // dakika olarak
          earliestArrival: '09:15',
          latestDeparture: '16:45',
        }
      };
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
      // API endpoint henüz oluşturulmadığı için şimdilik mock veri döndürelim
      // Gerçek uygulamada bu kısım API'ye bağlanacak
      // const response = await axios.get(`${API_BASE_URL}/api/Reports/UserStats/${userId}`);
      // return response.data;
      
      // Mock veri
      return {
        totalMeetingsAttended: 8,
        upcomingMeetings: 2,
        attendanceRate: 90, // yüzde olarak
        meetingsByMonth: [
          { month: 'Ocak', count: 1 },
          { month: 'Şubat', count: 2 },
          { month: 'Mart', count: 0 },
          { month: 'Nisan', count: 3 },
          { month: 'Mayıs', count: 2 },
          { month: 'Haziran', count: 0 },
        ],
      };
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
      // API endpoint henüz oluşturulmadığı için şimdilik mock veri döndürelim
      // Gerçek uygulamada bu kısım API'ye bağlanacak
      // const response = await axios.get(`${API_BASE_URL}/api/Reports/OverallStats`);
      // return response.data;
      
      // Mock veri
      return {
        totalMeetings: 25,
        totalAttendees: 150,
        averageAttendanceRate: 82, // yüzde olarak
        meetingsByMonth: [
          { month: 'Ocak', count: 3 },
          { month: 'Şubat', count: 4 },
          { month: 'Mart', count: 2 },
          { month: 'Nisan', count: 5 },
          { month: 'Mayıs', count: 6 },
          { month: 'Haziran', count: 5 },
        ],
        topLocations: [
          { name: 'MEB Toplantı Salonu A', count: 8 },
          { name: 'MEB Konferans Salonu', count: 6 },
          { name: 'İl Milli Eğitim Toplantı Salonu', count: 5 },
          { name: 'Diğer', count: 6 },
        ],
      };
    } catch (error) {
      console.error('Genel istatistikler alınırken hata oluştu:', error);
      throw error;
    }
  },
};

export default reportService;