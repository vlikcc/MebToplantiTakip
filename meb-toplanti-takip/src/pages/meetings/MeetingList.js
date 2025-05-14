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
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import meetingService from '../../services/meetingService';
import { ALTERNATIVE_URLS } from '../../config';
import { setApiBaseUrl } from '../../services/api';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [urlMenuAnchor, setUrlMenuAnchor] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'string' || typeof dateString !== 'string') {
      return '-';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      return '-';
    }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('API isteği yapılıyor...');
      const data = await meetingService.getAllMeetings();
      console.log('API yanıtı alındı:', data);
      
      if (!data || data.length === 0) {
        console.log('API yanıtı boş veya dizi değil:', data);
        setError('Hiçbir toplantı bulunamadı. Lütfen daha sonra tekrar deneyin.');
      } else {
        setMeetings(data);
      }
    } catch (error) {
      console.error('Toplantılar yüklenirken hata oluştu:', error);
      console.error('Hata detayları:', error.response || error.message || error);
      setError('Toplantıları yüklerken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
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

  const handleDelete = async (id) => {
    if (window.confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) {
      try {
        await meetingService.deleteMeeting(id);
        setMeetings(meetings.filter(meeting => meeting.meetingId !== id));
      } catch (error) {
        console.error('Toplantı silinirken hata oluştu:', error);
        alert('Toplantı silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  const handleUrlMenuOpen = (event) => {
    setUrlMenuAnchor(event.currentTarget);
  };

  const handleUrlMenuClose = () => {
    setUrlMenuAnchor(null);
  };

  const handleUrlChange = (url) => {
    setApiBaseUrl(url);
    handleUrlMenuClose();
    fetchMeetings();
  };

  // Arama filtrelemesi
  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sayfalama
  const paginatedMeetings = filteredMeetings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Toplantılar</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchMeetings}
            sx={{ mr: 2 }}
          >
            Yenile
          </Button>
          <Button
            variant="outlined"
            color="secondary" 
            startIcon={<SwapHorizIcon />}
            onClick={handleUrlMenuOpen}
            sx={{ mr: 2 }}
          >
            API URL Değiştir
          </Button>
          <Menu
            anchorEl={urlMenuAnchor}
            open={Boolean(urlMenuAnchor)}
            onClose={handleUrlMenuClose}
          >
            {ALTERNATIVE_URLS.map((url, index) => (
              <MenuItem key={index} onClick={() => handleUrlChange(url)}>
                {url}
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/meetings/add"
          >
            Yeni Toplantı
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
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
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Başlangıç Tarihi</TableCell>
                <TableCell>Bitiş Tarihi</TableCell>
                <TableCell>Lokasyon</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Toplantılar yükleniyor...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedMeetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary">
                      {searchTerm ? "Arama kriterine uygun toplantı bulunamadı" : "Henüz toplantı bulunmuyor"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMeetings.map((meeting) => (
                  <TableRow key={meeting.meetingId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: meeting.color || '#1976d2',
                            mr: 1,
                          }}
                        />
                        {meeting.title}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(meeting.startDate)}</TableCell>
                    <TableCell>{formatDate(meeting.endDate)}</TableCell>
                    <TableCell>{meeting.location?.locationName || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        component={Link}
                        to={`/meetings/${meeting.meetingId}`}
                        color="primary"
                        size="small"
                        title="Detaylar"
                      >
                        <DocumentIcon />
                      </IconButton>
                      <IconButton
                        component={Link}
                        to={`/meetings/edit/${meeting.meetingId}`}
                        color="secondary"
                        size="small"
                        title="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(meeting.meetingId)}
                        title="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        component={Link}
                        to={`/meetings/${meeting.meetingId}/qrcode`}
                        color="success"
                        size="small"
                        title="QR Kod"
                      >
                        <QrCodeIcon />
                      </IconButton>
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
          count={filteredMeetings.length}
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

export default MeetingList;