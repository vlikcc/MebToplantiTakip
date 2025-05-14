import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import qrCodeService from '../../services/qrCodeService';
import meetingService from '../../services/meetingService';

const MeetingQRCode = () => {
  const { meetingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const prevMeetingIdRef = useRef(meetingId);

  // QR kod oluşturma ve yükleme işlemi
  const generateQRCode = useCallback(async (meetingData) => {
    if (!meetingData) return;
    
    try {
      setIsRetrying(true);
      
      // QR kodu oluştur
      const qrCodeBlob = await qrCodeService.generateQRCode(meetingData);
      
      // Önceki URL'yi temizle
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
      
      // Yeni URL oluştur
      const qrCodeObjectUrl = URL.createObjectURL(qrCodeBlob);
      setQrCodeUrl(qrCodeObjectUrl);
      setError(null);
      setSuccessMessage('QR kod başarıyla oluşturuldu');
      
      return true;
    } catch (error) {
      console.error('QR kod yüklenirken hata oluştu:', error);
      setError(`QR kod oluşturulamadı: ${error.message || 'Bilinmeyen bir hata oluştu'}`);
      return false;
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [qrCodeUrl]);

  // Toplantı verilerini yükleme
  const loadMeetingData = useCallback(async () => {
    if (!meetingId) return;
    setLoading(true);
    
    try {
      // Önce toplantı bilgilerini al
      const meetingData = await meetingService.getMeetingById(meetingId);
      console.log('Alınan toplantı verileri:', meetingData);
      
      if (!meetingData) {
        throw new Error('Toplantı bilgileri alınamadı');
      }
      
      setMeeting(meetingData);
      
      // QR kodu oluştur
      await generateQRCode(meetingData);
    } catch (error) {
      console.error('Toplantı bilgileri yüklenirken hata oluştu:', error);
      setError(`Toplantı bilgileri yüklenirken bir hata oluştu: ${error.message}`);
      setLoading(false);
    }
  }, [meetingId, generateQRCode]);

  // Yeniden deneme işlemi
  const handleRetry = useCallback(() => {
    if (meeting) {
      generateQRCode(meeting);
    } else {
      loadMeetingData();
    }
  }, [meeting, generateQRCode, loadMeetingData]);

  // Sayfa yüklendiğinde veya meetingId değiştiğinde çalış
  useEffect(() => {
    // MeetingId değiştiyse state'i sıfırla
    if (prevMeetingIdRef.current !== meetingId) {
      setQrCodeUrl(null);
      setError(null);
      setMeeting(null);
      prevMeetingIdRef.current = meetingId;
    }
    
    loadMeetingData();
    
    // Cleanup
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [meetingId, loadMeetingData]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `toplanti-qr-${meetingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  if (loading && !isRetrying) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          component={Link}
          to="/meetings"
          startIcon={<ArrowBackIcon />}
        >
          Toplantı Listesine Dön
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            disabled={isRetrying}
            sx={{ mr: 2 }}
          >
            {isRetrying ? 'Yükleniyor...' : 'Yeniden Dene'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={!qrCodeUrl}
          >
            QR Kodu İndir
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="div" gutterBottom align="center">
          {meeting?.title || 'Toplantı'} - QR Kod
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Hata</AlertTitle>
            {error}
          </Alert>
        )}
        
        {isRetrying && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={30} />
          </Box>
        )}
        
        {qrCodeUrl && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            mt={3}
          >
            <img
              src={qrCodeUrl}
              alt="Toplantı QR Kodu"
              style={{
                maxWidth: '300px',
                width: '100%',
                height: 'auto',
                marginBottom: '20px'
              }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              Bu QR kodu toplantıya katılım için kullanabilirsiniz.
            </Typography>
          </Box>
        )}
        
        {!qrCodeUrl && !error && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            QR kod yüklenemedi. Lütfen "Yeniden Dene" düğmesine tıklayarak tekrar deneyiniz.
          </Alert>
        )}
      </Paper>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Box>
  );
};

export default MeetingQRCode; 