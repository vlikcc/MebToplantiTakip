import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Kullanıcı ayarları
  const [userSettings, setUserSettings] = useState({
    name: 'Admin Kullanıcı',
    email: 'admin@meb.gov.tr',
    phone: '0312 123 4567',
  });

  // Bildirim ayarları
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    meetingReminders: true,
    documentUpdates: true,
  });

  // Güvenlik ayarları
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserSettingsChange = (e) => {
    const { name, value } = e.target;
    setUserSettings({
      ...userSettings,
      [name]: value,
    });
  };

  const handleNotificationSettingsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };

  const handleSecuritySettingsChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: value,
    });
  };

  const handleSaveSettings = () => {
    setLoading(true);
    setSuccess(false);
    setError('');

    // Ayarları kaydetme simülasyonu
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Başarılı mesajını 3 saniye sonra kaldır
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handleChangePassword = () => {
    setLoading(true);
    setSuccess(false);
    setError('');

    // Şifre kontrolü
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setError('Yeni şifre ve onay şifresi eşleşmiyor.');
      setLoading(false);
      return;
    }

    // Şifre değiştirme simülasyonu
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Başarılı mesajını 3 saniye sonra kaldır
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h4">Ayarlar</Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<PersonIcon />} label="Profil" />
          <Tab icon={<NotificationsIcon />} label="Bildirimler" />
          <Tab icon={<SecurityIcon />} label="Güvenlik" />
        </Tabs>

        <Box p={3}>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Ayarlar başarıyla kaydedildi.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Profil Ayarları */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Profil Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ad Soyad"
                    name="name"
                    value={userSettings.name}
                    onChange={handleUserSettingsChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    name="email"
                    type="email"
                    value={userSettings.email}
                    onChange={handleUserSettingsChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    name="phone"
                    value={userSettings.phone}
                    onChange={handleUserSettingsChange}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Box>
          )}

          {/* Bildirim Ayarları */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bildirim Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationSettingsChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="E-posta Bildirimleri"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationSettingsChange}
                    name="smsNotifications"
                    color="primary"
                  />
                }
                label="SMS Bildirimleri"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.meetingReminders}
                    onChange={handleNotificationSettingsChange}
                    name="meetingReminders"
                    color="primary"
                  />
                }
                label="Toplantı Hatırlatıcıları"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.documentUpdates}
                    onChange={handleNotificationSettingsChange}
                    name="documentUpdates"
                    color="primary"
                  />
                }
                label="Doküman Güncellemeleri"
              />
              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Box>
          )}

          {/* Güvenlik Ayarları */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Şifre Değiştir
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Mevcut Şifre"
                name="currentPassword"
                type="password"
                value={securitySettings.currentPassword}
                onChange={handleSecuritySettingsChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Yeni Şifre"
                name="newPassword"
                type="password"
                value={securitySettings.newPassword}
                onChange={handleSecuritySettingsChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Yeni Şifre (Tekrar)"
                name="confirmPassword"
                type="password"
                value={securitySettings.confirmPassword}
                onChange={handleSecuritySettingsChange}
                margin="normal"
              />
              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  Şifreyi Değiştir
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;