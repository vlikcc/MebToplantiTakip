import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const UserMeetings = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'den kullanıcı ve toplantı bilgilerini çek
    const fetchUserAndMeetings = async () => {
      try {
        // API henüz bağlanmadığı için örnek veri kullanıyoruz
        const mockUser = {
          userId: parseInt(userId),
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          department: 'Bilgi İşlem',
          position: 'Yazılım Geliştirici',
          phone: '0555 123 4567',
        };
        
        const mockMeetings = [
          { meetingId: 1, title: 'Yıllık Değerlendirme Toplantısı', date: '2023-05-15', time: '14:00', location: 'A Blok Konferans Salonu', status: 'Katıldı' },
          { meetingId: 2, title: 'Proje Planlama Toplantısı', date: '2023-06-20', time: '10:30', location: 'B Blok Toplantı Odası', status: 'Katılmadı' },
          { meetingId: 3, title: 'Bütçe Toplantısı', date: '2023-07-10', time: '09:00', location: 'Genel Müdürlük Toplantı Salonu', status: 'Katıldı' },
          { meetingId: 4, title: 'Eğitim Planlama Toplantısı', date: '2023-08-05', time: '13:30', location: 'C Blok Seminer Salonu', status: 'Davet Edildi' },
        ];
        
        setUser(mockUser);
        setMeetings(mockMeetings);
        setLoading(false);
      } catch (error) {
        console.error('Kullanıcı ve toplantı bilgileri yüklenirken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchUserAndMeetings();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Kullanıcı Toplantıları</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
            {user.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body1">{user.email}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.department} - {user.position}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1">
          <strong>Telefon:</strong> {user.phone}
        </Typography>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Toplantı</TableCell>
                <TableCell>Tarih & Saat</TableCell>
                <TableCell>Lokasyon</TableCell>
                <TableCell>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Toplantı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => (
                  <TableRow key={meeting.meetingId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Link to={`/meetings/${meeting.meetingId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {meeting.title}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>{meeting.date} - {meeting.time}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationIcon sx={{ mr: 1, color: 'secondary.main', fontSize: 'small' }} />
                        {meeting.location}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meeting.status}
                        color={meeting.status === 'Katıldı' ? 'success' : meeting.status === 'Katılmadı' ? 'error' : 'default'}
                        icon={meeting.status === 'Katıldı' ? <CheckIcon /> : meeting.status === 'Katılmadı' ? <CloseIcon /> : null}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default UserMeetings;