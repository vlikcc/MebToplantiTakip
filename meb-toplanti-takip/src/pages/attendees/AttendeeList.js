import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AttendeeList = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // API'den katılımcıları çek
    const fetchAttendees = async () => {
      try {
        // API henüz bağlanmadığı için örnek veri kullanıyoruz
        const mockData = [
          { attendeeId: 1, userId: 1, meetingId: 1, userName: 'Ahmet Yılmaz', meetingTitle: 'Yıllık Değerlendirme Toplantısı', attendanceDate: '2023-05-15' },
          { attendeeId: 2, userId: 2, meetingId: 1, userName: 'Ayşe Demir', meetingTitle: 'Yıllık Değerlendirme Toplantısı', attendanceDate: '2023-05-15' },
          { attendeeId: 3, userId: 3, meetingId: 2, userName: 'Mehmet Kaya', meetingTitle: 'Proje Planlama Toplantısı', attendanceDate: '2023-06-20' },
          { attendeeId: 4, userId: 1, meetingId: 3, userName: 'Ahmet Yılmaz', meetingTitle: 'Bütçe Toplantısı', attendanceDate: '2023-07-10' },
          { attendeeId: 5, userId: 4, meetingId: 3, userName: 'Zeynep Şahin', meetingTitle: 'Bütçe Toplantısı', attendanceDate: '2023-07-10' },
        ];
        
        setAttendees(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Katılımcılar yüklenirken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchAttendees();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Arama filtrelemesi
  const filteredAttendees = attendees.filter(attendee =>
    attendee.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sayfalama
  const paginatedAttendees = filteredAttendees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tüm Katılımcılar</Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Katılımcı veya toplantı ara..."
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
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Katılımcı</TableCell>
                <TableCell>Toplantı</TableCell>
                <TableCell>Katılım Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedAttendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Katılımcı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAttendees.map((attendee) => (
                  <TableRow key={attendee.attendeeId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Link to={`/users/${attendee.userId}/meetings`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {attendee.userName}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <EventIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Link to={`/meetings/${attendee.meetingId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {attendee.meetingTitle}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>{attendee.attendanceDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/meetings/${attendee.meetingId}/attendees`}
                      >
                        Toplantı Katılımcıları
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAttendees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default AttendeeList;