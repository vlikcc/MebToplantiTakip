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
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import attendeeService from '../../services/attendeeService';
import meetingService from '../../services/meetingService';
import userService from '../../services/userService';

const AttendeeList = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tüm toplantıları getir
        const meetings = await meetingService.getAllMeetings();
        
        if (meetings && meetings.length > 0) {
          // Her toplantı için katılımcıları getir
          const attendeesList = [];
          
          for (const meeting of meetings) {
            try {
              const meetingAttendees = await attendeeService.getMeetingAttendees(meeting.meetingId);
              
              // Her katılımcı için detaylı bilgi oluştur
              const attendeesWithDetails = meetingAttendees.map(attendee => ({
                attendeeId: `${meeting.meetingId}-${attendee.userId}`, // Benzersiz ID oluştur
                userId: attendee.userId,
                meetingId: meeting.meetingId,
                userName: attendee.userName,
                institutionName: attendee.institutionName,
                meetingTitle: meeting.title,
                attendanceDate: meeting.startDate,
              }));
              
              attendeesList.push(...attendeesWithDetails);
            } catch (error) {
              console.error(`${meeting.meetingId} ID'li toplantının katılımcıları alınırken hata:`, error);
            }
          }
          
          setAttendees(attendeesList);
        } else {
          setAttendees([]);
        }
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleCloseError = () => {
    setError(null);
  };

  // Arama filtrelemesi
  const filteredAttendees = attendees.filter(attendee =>
    (attendee.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (attendee.meetingTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (attendee.institutionName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
            placeholder="Katılımcı, kurum veya toplantı ara..."
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
                <TableCell>Kurum</TableCell>
                <TableCell>Toplantı</TableCell>
                <TableCell>Katılım Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedAttendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {error ? (
                      <Typography color="error">{error}</Typography>
                    ) : (
                      'Katılımcı bulunamadı'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAttendees.map((attendee) => (
                  <TableRow key={attendee.attendeeId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Link to={`/users/${attendee.userId}/meetings`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {attendee.userName || 'İsimsiz Katılımcı'}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>{attendee.institutionName || '-'}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <EventIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Link to={`/meetings/${attendee.meetingId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {attendee.meetingTitle || 'İsimsiz Toplantı'}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {attendee.attendanceDate ? new Date(attendee.attendanceDate).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
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

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendeeList;