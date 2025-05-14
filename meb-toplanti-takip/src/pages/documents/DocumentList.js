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
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import meetingService from '../../services/meetingService';
import fileService from '../../services/fileService';
// Dosyanın en üstündeki import kısmına ekleyin (zaten var)
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

// Dosyanın sonuna ekleyin (DocumentList bileşeninin dışına)
const formatDate = (dateString, formatStr) => {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    // Geçerli bir tarih olup olmadığını kontrol et
    if (isNaN(date.getTime())) return '-';
    return format(date, formatStr, { locale: tr });
  } catch (error) {
    console.warn('Geçersiz tarih formatı:', dateString);
    return '-';
  }
};

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Tüm toplantıları getir
        const meetings = await meetingService.getAllMeetings();
        
        // Toplantılardan dokümanları çıkar
        const allDocuments = [];
        meetings.forEach(meeting => {
          if (meeting.documents && meeting.documents.length > 0) {
            meeting.documents.forEach(doc => {
              allDocuments.push({
                ...doc,
                meetingId: meeting.meetingId,
                meetingTitle: meeting.title,
                meetingDate: meeting.startDate,
              });
            });
          }
        });
        
        setDocuments(allDocuments);
      } catch (error) {
        console.error('Dokümanlar yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  const handleDownload = async (documentId, fileName) => {
    try {
      await fileService.downloadFile(documentId, fileName);
    } catch (error) {
      console.error('Doküman indirilirken hata oluştu:', error);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Bu dokümanı silmek istediğinize emin misiniz?')) {
      try {
        await fileService.deleteFile(documentId);
        setDocuments(documents.filter(doc => doc.documentId !== documentId));
      } catch (error) {
        console.error('Doküman silinirken hata oluştu:', error);
      }
    }
  };

  const handleBulkDownload = async (meetingId) => {
    try {
      await fileService.downloadFiles(meetingId);
    } catch (error) {
      console.error('Dokümanlar indirilirken hata oluştu:', error);
    }
  };

  // Arama filtrelemesi
  const filteredDocuments = documents.filter(doc =>
    doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.meetingTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sayfalama
  const paginatedDocuments = filteredDocuments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Toplantılara göre gruplandırma
  const groupedByMeeting = {};
  filteredDocuments.forEach(doc => {
    if (!groupedByMeeting[doc.meetingId]) {
      groupedByMeeting[doc.meetingId] = {
        meetingId: doc.meetingId,
        meetingTitle: doc.meetingTitle,
        meetingDate: doc.meetingDate,
        documents: [],
      };
    }
    groupedByMeeting[doc.meetingId].documents.push(doc);
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dokümanlar
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Doküman veya toplantı adı ara..."
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

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredDocuments.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Doküman bulunamadı
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.values(groupedByMeeting).map((group) => (
              <Box key={group.meetingId} mb={3}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="h6">{group.meetingTitle}</Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <EventIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                      <Typography variant="body2">
                        {group.meetingDate
                          ? format(parseISO(group.meetingDate), 'PPP', {
                              locale: tr,
                            })
                          : '-'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleBulkDownload(group.meetingId)}
                  >
                    Tümünü İndir
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doküman Adı</TableCell>
                        <TableCell>Boyut</TableCell>
                        <TableCell>Tür</TableCell>
                        <TableCell>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.documents.map((doc) => (
                        <TableRow key={doc.documentId}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                              {doc.fileName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={doc.fileType || 'Bilinmiyor'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleDownload(doc.documentId, doc.fileName)}
                              title="İndir"
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(doc.documentId)}
                              title="Sil"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDocuments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına satır:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count}`
              }
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DocumentList;