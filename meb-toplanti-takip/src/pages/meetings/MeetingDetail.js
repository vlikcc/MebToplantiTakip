import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import meetingService from '../../services/meetingService';
import attendeeService from '../../services/attendeeService';
import fileService from '../../services/fileService';
import qrCodeService from '../../services/qrCodeService';

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [qrCodeError, setQrCodeError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'string' || typeof dateString !== 'string') {
      return '-';
    }
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return format(date, 'PPP p', { locale: tr });
    } catch (error) {
      console.error('Tarih formatlanırken hata oluştu:', error);
      return '-';
    }
  };

  const generateQRCode = async () => {
    setQrCodeLoading(true);
    setQrCodeError(null);
    try {
      const qrCodeData = {
        title: meeting.title,
        startDate: meeting.startDate,
        endDate: meeting.endDate,
        allday: meeting.allday,
        color: meeting.color,
        location: {
          locationId: meeting.location?.locationId || 0,
          latitude: meeting.location?.latitude || 0,
          longitude: meeting.location?.longitude || 0,
          locationName: meeting.location?.locationName || 'string'
        },
        documents: meeting.documents || []
      };

      const qrCodeBlob = await qrCodeService.generateQRCode(qrCodeData);
      const qrCodeObjectUrl = URL.createObjectURL(qrCodeBlob);
      setQrCodeUrl(qrCodeObjectUrl);
    } catch (error) {
      console.error('QR kod oluşturulurken hata oluştu:', error);
      setQrCodeError('QR kod oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleDownloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `toplanti-qr-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchMeetingData = async () => {
      setLoading(true);
      try {
        const meetingData = await meetingService.getMeetingById(id);
        // API'den gelen tarihleri kontrol et ve düzelt
        const formattedMeetingData = {
          ...meetingData,
          startDate: meetingData.startDate === 'string' ? null : meetingData.startDate,
          endDate: meetingData.endDate === 'string' ? null : meetingData.endDate,
        };
        setMeeting(formattedMeetingData);

        // Katılımcıları yükle
        const attendeesData = await attendeeService.getMeetingAttendees(id);
        setAttendees(attendeesData);
      } catch (error) {
        console.error('Toplantı bilgileri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) {
      try {
        await meetingService.deleteMeeting(id);
        navigate('/meetings');
      } catch (error) {
        console.error('Toplantı silinirken hata oluştu:', error);
      }
    }
  };

  const handleDownloadDocuments = async () => {
    try {
      await fileService.downloadFiles(id);
    } catch (error) {
      console.error('Dokümanlar indirilirken hata oluştu:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!meeting) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Toplantı bulunamadı
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/meetings"
          sx={{ mt: 2 }}
        >
          Toplantı Listesine Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{meeting.title}</Typography>
        <Box>
          {/* QR kod butonu */}
          <IconButton
            color="primary"
            component={Link}
            to={`/meetings/${meeting.meetingId}/qrcode`}
            title="QR Kod"
          >
            <QrCodeIcon />
          </IconButton>
          {/* İstatistik butonu */}
          <IconButton
            color="primary"
            component={Link}
            to={`/meetings/${meeting.meetingId}/stats`}
            title="İstatistikler"
          >
            <BarChartIcon />
          </IconButton>
          <IconButton
            color="secondary"
            component={Link}
            to={`/meetings/edit/${meeting.meetingId}`}
            title="Düzenle"
          >
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={handleDelete} title="Sil">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Toplantı Bilgileri
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Başlangıç Tarihi"
                  secondary={formatDate(meeting.startDate)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Bitiş Tarihi"
                  secondary={formatDate(meeting.endDate)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Lokasyon"
                  secondary={meeting.location?.locationName || '-'}
                />
              </ListItem>
              <ListItem>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: meeting.color || '#1976d2',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">
                    {meeting.allday === 'true' ? 'Tüm gün' : 'Belirli saatler'}
                  </Typography>
                </Box>
              </ListItem>
            </List>
          </Paper>

          {meeting.documents && meeting.documents.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Dokümanlar</Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadDocuments}
                >
                  Tümünü İndir
                </Button>
              </Box>
              <List>
                {meeting.documents.map((doc) => (
                  <ListItem key={doc.id}>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText primary={doc.fileName} />
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => fileService.downloadFile(doc.id, doc.fileName)}
                      title="İndir"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Katılımcılar</Typography>
              <Chip
                label={`${attendees.length} kişi`}
                color="primary"
                size="small"
              />
            </Box>
            <List>
              {attendees.map((attendee) => (
                <ListItem key={attendee.id}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${attendee.firstName} ${attendee.lastName}`}
                    secondary={attendee.email}
                  />
                </ListItem>
              ))}
              {attendees.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Henüz katılımcı bulunmuyor"
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MeetingDetail;