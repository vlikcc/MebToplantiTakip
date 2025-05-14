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
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const MeetingAttendees = () => {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // API'den toplantı ve katılımcı bilgilerini çek
    const fetchMeetingAndAttendees = async () => {
      try {
        // API henüz bağlanmadığı için örnek veri kullanıyoruz
        const mockMeeting = {
          meetingId: parseInt(meetingId),
          title: 'Yıllık Değerlendirme Toplantısı',
          date: '2023-05-15',
          time: '14:00',
          location: 'A Blok Konferans Salonu',
          description: 'Yıllık hedeflerin değerlendirilmesi ve gelecek yıl planlaması',
        };
        
        const mockAttendees = [
          { attendeeId: 1, userId: 1, userName: 'Ahmet Yılmaz', email: 'ahmet@example.com', department: 'Bilgi İşlem', status: 'Katıldı' },
          { attendeeId: 2, userId: 2, userName: 'Ayşe Demir', email: 'ayse@example.com', department: 'İnsan Kaynakları', status: 'Katıldı' },
          { attendeeId: 3, userId: 3, userName: 'Mehmet Kaya', email: 'mehmet@example.com', department: 'Finans', status: 'Katılmadı' },
        ];
        
        const mockAvailableUsers = [
          { userId: 4, userName: 'Zeynep Şahin', email: 'zeynep@example.com', department: 'Eğitim' },
          { userId: 5, userName: 'Ali Öztürk', email: 'ali@example.com', department: 'Planlama' },
          { userId: 6, userName: 'Fatma Yıldız', email: 'fatma@example.com', department: 'Hukuk' },
        ];
        
        setMeeting(mockMeeting);
        setAttendees(mockAttendees);
        setAvailableUsers(mockAvailableUsers);
        setLoading(false);
      } catch (error) {
        console.error('Toplantı ve katılımcı bilgileri yüklenirken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchMeetingAndAttendees();
  }, [meetingId]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleAddAttendee = () => {
    if (selectedUser) {
      // API'ye katılımcı ekleme isteği gönderilecek
      // Şimdilik sadece state'i güncelliyoruz
      const newAttendee = {
        attendeeId: Date.now(), // Geçici ID
        userId: selectedUser.userId,
        userName: selectedUser.userName,
        email: selectedUser.email,
        department: selectedUser.department,
        status: 'Davet Edildi',
      };
      
      setAttendees([...attendees, newAttendee]);
      setAvailableUsers(availableUsers.filter(user => user.userId !== selectedUser.userId));
      handleCloseDialog();
    }
  };

  const handleRemoveAttendee = (attendeeId) => {
    // API'ye katılımcı silme isteği gönderilecek
    // Şimdilik sadece state'i güncelliyoruz
    const removedAttendee = attendees.find(a => a.attendeeId === attendeeId);
    if (removedAttendee) {
      setAttendees(attendees.filter(a => a.attendeeId !== attendeeId));
      if (removedAttendee.userId) {
        setAvailableUsers([...availableUsers, {
          userId: removedAttendee.userId,
          userName: removedAttendee.userName,
          email: removedAttendee.email,
          department: removedAttendee.department,
        }]);
      }
    }
  };

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
        <Typography variant="h4">Toplantı Katılımcıları</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Katılımcı Ekle
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{meeting.title}</Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Tarih:</strong> {meeting.date} - {meeting.time}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Lokasyon:</strong> {meeting.location}
        </Typography>
        <Typography variant="body1">
          <strong>Açıklama:</strong> {meeting.description}
        </Typography>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Katılımcı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Departman</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Katılımcı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                attendees.map((attendee) => (
                  <TableRow key={attendee.attendeeId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Link to={`/users/${attendee.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {attendee.userName}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>{attendee.email}</TableCell>
                    <TableCell>{attendee.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={attendee.status}
                        color={attendee.status === 'Katıldı' ? 'success' : attendee.status === 'Katılmadı' ? 'error' : 'default'}
                        icon={attendee.status === 'Katıldı' ? <CheckIcon /> : attendee.status === 'Katılmadı' ? <CloseIcon /> : null}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveAttendee(attendee.attendeeId)}
                        title="Katılımcıyı Kaldır"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Katılımcı Ekleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Katılımcı Ekle</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableUsers}
            getOptionLabel={(option) => `${option.userName} (${option.department})`}
            value={selectedUser}
            onChange={(event, newValue) => {
              setSelectedUser(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Kullanıcı Seç"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleAddAttendee}
            color="primary"
            disabled={!selectedUser}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingAttendees;