import api, { directFetch } from './api';

const qrCodeService = {
  /**
   * Toplantı için QR kod oluşturur
   * @param {Object} meetingData - Toplantı bilgileri
   * @returns {Promise<Blob>} QR kod görüntüsü (PNG formatında)
   */
  generateQRCode: async (meetingData) => {
    // API'ye gönderilecek veriyi dışarıda hazırla (catch bloğunda da erişilebilmesi için)
    const requestData = {
      meetingId: meetingData.meetingId || 0,
      title: meetingData.title || 'string',
      startDate: meetingData.startDate || 'string',
      endDate: meetingData.endDate || 'string',
      allday: meetingData.allday || false,
      color: meetingData.color || 'string',
      location: {
        locationId: meetingData.location?.locationId || 0,
        latitude: meetingData.location?.latitude || 0,
        longitude: meetingData.location?.longitude || 0,
        locationName: meetingData.location?.locationName || 'string'
      },
      documents: meetingData.documents || []
    };

    try {
      console.log('QR kod isteği gönderiliyor:', requestData);

      // API yanıtını takip etmek için Promise.race kullanımı
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('QR kod oluşturma zaman aşımı')), 30000)
      );
      
      const apiPromise = api.post(
        '/QrCode/GenerateQRCode',
        requestData,
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'image/png,application/octet-stream'
          }
        }
      );
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      console.log('QR kod yanıtı alındı:', response);
      
      // Blob tipi kontrolü
      if (!(response.data instanceof Blob)) {
        console.error('QR kod yanıtı blob tipinde değil:', response.data);
        throw new Error('QR kod yanıtı geçersiz formatta');
      }
      
      return response.data;
    } catch (error) {
      console.error('QR kod oluşturulurken hata oluştu:', error);
      
      // Hata detaylarını kontrol et
      if (error.response) {
        console.error('Hata yanıtı:', {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
        });
        
        // Hata mesajını çözmeye çalış
        try {
          // Eğer hata yanıtı blob ise, içeriğini okuyalım
          if (error.response.data instanceof Blob) {
            const errText = await error.response.data.text();
            console.error('Hata mesajı:', errText);
          } else {
            console.error('Hata verisi:', error.response.data);
          }
        } catch (readError) {
          console.error('Hata yanıtı okunamadı:', readError);
        }
      }
      
      // Network hatası ise alternatif fetch deneyelim
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        try {
          console.log('Axios ile istek başarısız, fetch API ile deneniyor...');
          const response = await fetch(`${api.defaults.baseURL}/QrCode/GenerateQRCode`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'image/png,application/octet-stream'
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP hata! Durum: ${response.status}`);
          }
          
          return await response.blob();
        } catch (fetchError) {
          console.error('Fetch isteği de başarısız:', fetchError);
        }
      }
      
      throw new Error('QR kod oluşturulamadı: ' + (error.message || 'Bilinmeyen hata'));
    }
  },
};

export default qrCodeService;