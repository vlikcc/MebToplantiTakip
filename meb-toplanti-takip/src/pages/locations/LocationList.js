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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import locationService from '../../services/locationService';

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationService.getAllLocations();
        setLocations(data);
        setLoading(false);
      } catch (error) {
        console.error('Lokasyonlar yüklenirken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchLocations();
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
    if (window.confirm('Bu lokasyonu silmek istediğinize emin misiniz?')) {
      try {
        // API henüz oluşturulmadıysa bu kısmı yorum satırına alabilirsiniz
        // await locationService.deleteLocation(id);
        setLocations(locations.filter(location => location.locationId !== id));
      } catch (error) {
        console.error('Lokasyon silinirken hata oluştu:', error);
      }
    }
  };

  // Arama filtrelemesi
  const filteredLocations = locations.filter(location =>
    location.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sayfalama
  const paginatedLocations = filteredLocations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lokasyonlar</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/locations/add"
        >
          Yeni Lokasyon
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Lokasyon ara..."
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
                <TableCell>Lokasyon Adı</TableCell>
                <TableCell>Enlem</TableCell>
                <TableCell>Boylam</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : paginatedLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Lokasyon bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLocations.map((location) => (
                  <TableRow key={location.locationId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {location.locationName}
                      </Box>
                    </TableCell>
                    <TableCell>{location.latitude}</TableCell>
                    <TableCell>{location.longitude}</TableCell>
                    <TableCell>
                      <IconButton
                        component={Link}
                        to={`/locations/edit/${location.locationId}`}
                        color="secondary"
                        size="small"
                        title="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(location.locationId)}
                        title="Sil"
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLocations.length}
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

export default LocationList;