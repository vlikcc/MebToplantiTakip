import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import meetingService from '../../services/meetingService';
import locationService from '../../services/locationService';

// Renk seçenekleri
const colorOptions = [
  { value: '#1976d2', label: 'Mavi' },
  { value: '#dc004e', label: 'Kırmızı' },
  { value: '#4caf50', label: 'Yeşil' },
  { value: '#ff9800', label: 'Turuncu' },
  { value: '#9c27b0', label: 'Mor' },
];

const MeetingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [files, setFiles] = useState([]);

  const isEditMode = !!id;

  // Form validasyon şeması
  const validationSchema = Yup.object({
    title: Yup.string().required('Başlık zorunludur'),
    startDate: Yup.date().required('Başlangıç tarihi zorunludur'),
    endDate: Yup.date().required('Bitiş tarihi zorunludur'),
    locationId: Yup.number().required('Lokasyon zorunludur'),
  });

  // Formik form yönetimi
  const formik = useFormik({
    initialValues: {
      title: '',
      startDate: new Date(),
      endDate: new Date(),
      allday: false,
      color: '#1976d2',
      locationId: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const meetingData = {
          ...values,
          startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
          endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
          allday: values.allday ? 'true' : 'false',
          location: {
            locationId: values.locationId,
          },
        };

        if (isEditMode) {
          await meetingService.updateMeeting({
            ...meetingData,
            meetingId: parseInt(id),
          });
        } else {
          await meetingService.createMeeting(meetingData, files);
        }

        navigate('/meetings');
      } catch (error) {
        console.error('Toplantı kaydedilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Lokasyonları yükle
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await locationService.getAllLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error('Lokasyonlar yüklenirken hata oluştu:', error);
        // Hata durumunda boş dizi kullan
        setLocations([]);
      }
    };
  
    fetchLocations();
  }, []);

  // Düzenleme modunda toplantı bilgilerini yükle
  useEffect(() => {
    if (isEditMode) {
      const fetchMeeting = async () => {
        setInitialLoading(true);
        try {
          const meeting = await meetingService.getMeetingById(id);
          formik.setValues({
            title: meeting.title,
            startDate: parseISO(meeting.startDate),
            endDate: parseISO(meeting.endDate),
            allday: meeting.allday === 'true',
            color: meeting.color,
            locationId: meeting.location?.locationId,
          });
        } catch (error) {
          console.error('Toplantı bilgileri yüklenirken hata oluştu:', error);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchMeeting();
    }
  }, [id, isEditMode]);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

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
        {isEditMode ? 'Toplantı Düzenle' : 'Yeni Toplantı'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Toplantı Başlığı"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DateTimePicker
                  label="Başlangıç Tarihi"
                  value={formik.values.startDate}
                  onChange={(value) => formik.setFieldValue('startDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={
                        formik.touched.startDate &&
                        Boolean(formik.errors.startDate)
                      }
                      helperText={
                        formik.touched.startDate && formik.errors.startDate
                      }
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DateTimePicker
                  label="Bitiş Tarihi"
                  value={formik.values.endDate}
                  onChange={(value) => formik.setFieldValue('endDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={
                        formik.touched.endDate && Boolean(formik.errors.endDate)
                      }
                      helperText={formik.touched.endDate && formik.errors.endDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="location-label">Lokasyon</InputLabel>
                <Select
                  labelId="location-label"
                  id="locationId"
                  name="locationId"
                  value={formik.values.locationId}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.locationId &&
                    Boolean(formik.errors.locationId)
                  }
                >
                  {locations.map((location) => (
                    <MenuItem key={location.locationId} value={location.locationId}>
                      {location.locationName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="color-label">Renk</InputLabel>
                <Select
                  labelId="color-label"
                  id="color"
                  name="color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                >
                  {colorOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: option.value,
                            mr: 1,
                          }}
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.allday}
                    onChange={formik.handleChange}
                    name="allday"
                  />
                }
                label="Tüm gün"
              />
            </Grid>

            {!isEditMode && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Dokümanlar
                </Typography>
                <input
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  style={{ display: 'none' }}
                  id="files"
                  multiple
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="files">
                  <Button variant="outlined" component="span">
                    Dosya Seç
                  </Button>
                </label>
                {files.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2">
                      {files.length} dosya seçildi
                    </Typography>
                    <ul>
                      {Array.from(files).map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/meetings')}
                  sx={{ mr: 1 }}
                >
                  İptal
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : isEditMode ? (
                    'Güncelle'
                  ) : (
                    'Kaydet'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default MeetingForm;