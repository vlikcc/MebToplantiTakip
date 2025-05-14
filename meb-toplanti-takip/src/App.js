import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

// Kimlik doğrulama
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';

// Toplantı sayfaları
import MeetingList from './pages/meetings/MeetingList';
import MeetingForm from './pages/meetings/MeetingForm';
import MeetingDetail from './pages/meetings/MeetingDetail';

// Lokasyon sayfaları
import LocationList from './pages/locations/LocationList';
import LocationForm from './pages/locations/LocationForm';

// Kullanıcı sayfaları
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';

// Katılımcı sayfaları
import AttendeeList from './pages/attendees/AttendeeList';
import MeetingAttendees from './pages/attendees/MeetingAttendees';
import UserMeetings from './pages/attendees/UserMeetings';

// Yeni sayfaları import edin

import QRCodeList from './pages/qrcode/QRCodeList';       // Bu dosyayı oluşturmanız gerekecek
import Settings from './pages/settings/Settings';         // Bu dosyayı oluşturmanız gerekecek

// QR Kod sayfaları
import MeetingQRCode from './pages/qrcode/MeetingQRCode';

// Raporlama sayfaları
import MeetingStats from './pages/reports/MeetingStats';
import OverallStats from './pages/reports/OverallStats';

// Doküman sayfaları
import DocumentList from './pages/documents/DocumentList';

// Tema oluşturma
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // MEB mavi rengi
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

// Ardından App fonksiyonu devam eder
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Giriş sayfası - korumasız */}
            <Route path="/login" element={<Login />} />
            
            {/* Korumalı rotalar */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/meetings" element={<MeetingList />} />
                {/* Toplantı rotaları */}
                
                <Route path="/meetings/add" element={<MeetingForm />} />
                <Route path="/meetings/edit/:id" element={<MeetingForm />} />
                <Route path="/meetings/:id" element={<MeetingDetail />} />
                
                {/* Lokasyon rotaları */}
                <Route path="/locations" element={<LocationList />} />
                <Route path="/locations/add" element={<LocationForm />} />
                <Route path="/locations/edit/:id" element={<LocationForm />} />
                
                {/* Kullanıcı rotaları */}
                <Route path="/users" element={<UserList />} />
                <Route path="/users/add" element={<UserForm />} />
                <Route path="/users/edit/:id" element={<UserForm />} />
                
                {/* Katılımcı rotaları */}
                <Route path="/attendees" element={<AttendeeList />} />
                <Route path="/meetings/:meetingId/attendees" element={<MeetingAttendees />} />
                <Route path="/users/:userId/meetings" element={<UserMeetings />} />
                
                {/* QR Kod rotaları */}
                <Route path="/qrcodes" element={<QRCodeList />} />
                <Route path="/meetings/:meetingId/qrcode" element={<MeetingQRCode />} />
                
                {/* Ayarlar rotası */}
                <Route path="/settings" element={<Settings />} />
                
                {/* Raporlama rotaları */}
                <Route path="/meetings/:meetingId/stats" element={<MeetingStats />} />
                <Route path="/reports" element={<OverallStats />} />
                
                {/* Doküman rotaları */}
                <Route path="/documents" element={<DocumentList />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
