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
import userService from '../../services/userService';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const isEditMode = !!id;

  // Form validasyon şeması
  const validationSchema = Yup.object({
    userName: Yup.string().required('Kullanıcı adı zorunludur'),
    deviceId: Yup.string().required('Cihaz ID zorunludur'),
    institutionName: Yup.string().required('Kurum adı zorunludur'),
  });

  // Formik form yönetimi
  const formik = useFormik({
    initialValues: {
      userName: '',
      deviceId: '',
      institutionName: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEditMode) {
          await userService.updateUser(id, values);
        } else {
          await userService.createUser(values);
        }

        navigate('/users');
      } catch (error) {
        console.error('Kullanıcı kaydedilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Düzenleme modunda kullanıcı bilgilerini yükle
  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        setInitialLoading(true);
        try {
          const user = await userService.getUserById(id);
          formik.setValues({
            userName: user.userName,
            deviceId: user.deviceId,
            institutionName: user.institutionName,
          });
        } catch (error) {
          console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchUser();
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
        {isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="userName"
                name="userName"
                label="Kullanıcı Adı"
                value={formik.values.userName}
                onChange={formik.handleChange}
                error={formik.touched.userName && Boolean(formik.errors.userName)}
                helperText={formik.touched.userName && formik.errors.userName}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="deviceId"
                name="deviceId"
                label="Cihaz ID"
                value={formik.values.deviceId}
                onChange={formik.handleChange}
                error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                helperText={formik.touched.deviceId && formik.errors.deviceId}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="institutionName"
                name="institutionName"
                label="Kurum Adı"
                value={formik.values.institutionName}
                onChange={formik.handleChange}
                error={formik.touched.institutionName && Boolean(formik.errors.institutionName)}
                helperText={formik.touched.institutionName && formik.errors.institutionName}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/users')}
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

export default UserForm;