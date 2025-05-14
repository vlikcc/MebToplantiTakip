import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import qrCodeService from '../../services/qrCodeService';
import meetingService from '../../services/meetingService';

const MeetingQRCode = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Toplantı bilgilerini getir
        const meetingData = await meetingService.getMeetingById(meetingId);
        setMeeting(meetingData);

        // QR kod oluştur
        const qrCodeBlob = await qrCodeService.generateQRCode(meetingData);
        const qrCodeObjectUrl = URL.createObjectURL(qrCodeBlob);
        setQrCodeUrl(qrCodeObjectUrl);
      } catch (error) {
        console.error('QR kod yüklenirken hata oluştu:', error);
        setError('QR kod oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [meetingId]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `toplanti-qr-${meetingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!qrCodeRef.current) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Toplantı QR Kodu</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
            }
            img {
              max-width: 300px;
              margin-bottom: 20px;
            }
            h2 {
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 5px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${meeting?.title || 'Toplantı QR Kodu'}</h2>
            <p>${meeting?.location?.locationName || ''}</p>
            <img src="${qrCodeUrl}" />
            <p>Bu QR kodu toplantıya katılım için taratın</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/meetings/${meetingId}`}
          sx={{ mt: 2 }}
        >
          Toplantı Detayına Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton
          color="primary"
          component={Link}
          to={`/meetings/${meetingId}`}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Toplantı QR Kodu</Typography>
      </Box>

      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {meeting && (
          <>
            <Typography variant="h5" gutterBottom>
              {meeting.title}
            </Typography>
            {meeting.location && (
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {meeting.location.locationName}
              </Typography>
            )}
          </>
        )}

        <Box
          ref={qrCodeRef}
          sx={{
            mt: 3,
            mb: 3,
            p: 3,
            border: '1px solid #eee',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Toplantı QR Kodu"
              style={{ maxWidth: '300px', width: '100%' }}
            />
          ) : (
            <Typography>QR kod yüklenemedi</Typography>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
          Bu QR kodu toplantıya katılım için kullanılacaktır.
          <br />
          Katılımcılar bu kodu taratarak toplantıya katılım sağlayabilirler.
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={!qrCodeUrl}
          >
            İndir
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!qrCodeUrl}
          >
            Yazdır
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MeetingQRCode;