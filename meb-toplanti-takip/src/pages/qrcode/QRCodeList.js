import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import meetingService from '../../services/meetingService';

const QRCodeList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'string' || typeof dateString !== 'string') return '-';
    try {
      // ISO string formatındaki tarihi parse et
      const date = new Date(dateString);
      // Geçerli bir tarih mi kontrol et
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      console.error('Tarih formatlanırken hata oluştu:', error);
      return '-';
    }
  };

  useEffect(() => {
    // API'den toplantıları çek
    const fetchMeetings = async () => {
      try {
        const data = await meetingService.getAllMeetings();
        // API'den gelen tarihleri kontrol et ve düzelt
        const formattedData = data.map(meeting => ({
          ...meeting,
          // "string" değerini null olarak değiştir
          startDate: meeting.startDate === 'string' ? null : meeting.startDate,
          endDate: meeting.endDate === 'string' ? null : meeting.endDate,
        }));
        setMeetings(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Toplantılar yüklenirken hata oluştu:', error);
        setError('Toplantılar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Arama filtrelemesi
  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (meeting.location?.locationName 
      ? meeting.location.locationName.toLowerCase().includes(searchTerm.toLowerCase())
      : false)
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Toplantı QR Kodları</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Toplantı ara..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Paper>
      ) : filteredMeetings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Toplantı bulunamadı</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMeetings.map((meeting) => (
            <Grid item xs={12} sm={6} md={4} key={meeting.meetingId}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <QrCodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {meeting.title}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EventIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(meeting.startDate)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {meeting.location?.locationName || '-'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<QrCodeIcon />}
                    component={Link}
                    to={`/meetings/${meeting.meetingId}/qrcode`}
                  >
                    QR Kodu Görüntüle
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => console.log(`QR kod indirildi: ${meeting.meetingId}`)}
                  >
                    İndir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default QRCodeList;