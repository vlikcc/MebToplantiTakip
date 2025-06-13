import { useCallback } from 'react';
import { useSnackbar } from '../components/common/SnackbarProvider';

export const useErrorHandler = () => {
  const { showError, showWarning, showInfo } = useSnackbar();

  const handleError = useCallback((error, customMessage) => {
    console.error('Error occurred:', error);

    let message = customMessage;
    
    if (!message) {
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        message = 'Beklenmeyen bir hata oluştu';
      }
    }

    // HTTP status kodlarına göre farklı mesajlar
    if (error?.response?.status) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          message = customMessage || 'Geçersiz istek. Lütfen bilgileri kontrol edin.';
          break;
        case 401:
          message = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
          break;
        case 403:
          message = 'Bu işlem için yetkiniz bulunmuyor.';
          break;
        case 404:
          message = customMessage || 'İstenen kaynak bulunamadı.';
          break;
        case 429:
          message = 'Çok fazla istek gönderdiniz. Lütfen bekleyin.';
          showWarning(message);
          return;
        case 500:
          message = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
          break;
        case 503:
          message = 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          message = customMessage || `Hata oluştu (${status}): ${message}`;
      }
    }

    // Network hataları
    if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
      message = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      showWarning(message);
      return;
    }

    // Timeout hataları
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      message = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      showWarning(message);
      return;
    }

    showError(message);
  }, [showError, showWarning]);

  const handleValidationError = useCallback((validationErrors) => {
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach(error => showError(error));
    } else if (typeof validationErrors === 'object') {
      Object.values(validationErrors).forEach(error => {
        if (Array.isArray(error)) {
          error.forEach(e => showError(e));
        } else {
          showError(error);
        }
      });
    } else {
      showError(validationErrors || 'Doğrulama hatası oluştu');
    }
  }, [showError]);

  const handleWarning = useCallback((message) => {
    showWarning(message);
  }, [showWarning]);

  const handleInfo = useCallback((message) => {
    showInfo(message);
  }, [showInfo]);

  return {
    handleError,
    handleValidationError,
    handleWarning,
    handleInfo,
  };
}; 