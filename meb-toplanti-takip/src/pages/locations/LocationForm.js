import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import locationService from '../../services/locationService';

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const isEditMode = !!id;

  // Form validasyon şeması
  const validationSchema = Yup.object({
    locationName: Yup.string().required('Lokasyon adı zorunludur'),
    latitude: Yup.number().required('Enlem zorunludur'),
    longitude: Yup.number().required('Boylam zorunludur'),
  });

  // Formik form yönetimi
  const formik = useFormik({
    initialValues: {
      locationName: '',
      latitude: '',
      longitude: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const locationData = {
          ...values,
        };

        if (isEditMode) {
          // API henüz oluşturulmadıysa bu kısmı yorum satırına alabilirsiniz
          // await locationService.updateLocation(id, locationData);
        } else {
          await locationService.addLocation(locationData);
        }

        navigate('/locations');
      } catch (error) {
        console.error('Lokasyon kaydedilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Düzenleme modunda lokasyon bilgilerini yükle
  useEffect(() => {
    if (isEditMode) {
      const fetchLocation = async () => {
        setInitialLoading(true);
        try {
          const location = await locationService.getLocationById(id);
          formik.setValues({
            locationName: location.locationName,
            latitude: location.latitude,
            longitude: location.longitude,
          });
        } catch (error) {
          console.error('Lokasyon bilgileri yüklenirken hata oluştu:', error);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchLocation();
    }
  }, [id, isEditMode]);

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Lokasyon Düzenle' : 'Yeni Lokasyon'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="locationName"
                name="locationName"
                label="Lokasyon Adı"
                value={formik.values.locationName}
                onChange={formik.handleChange}
                error={formik.touched.locationName && Boolean(formik.errors.locationName)}
                helperText={formik.touched.locationName && formik.errors.locationName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="latitude"
                name="latitude"
                label="Enlem"
                type="number"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                helperText={formik.touched.latitude && formik.errors.latitude}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="longitude"
                name="longitude"
                label="Boylam"
                type="number"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                helperText={formik.touched.longitude && formik.errors.longitude}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/locations')}
                >
                  İptal
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LocationForm;