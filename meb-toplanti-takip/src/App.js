import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './components/common/SnackbarProvider';

// Kimlik doğrulama
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

// QR Kod sayfaları
import QRCodeList from './pages/qrcode/QRCodeList';
import MeetingQRCode from './pages/qrcode/MeetingQRCode';

// Raporlama sayfaları
import MeetingStats from './pages/reports/MeetingStats';
import OverallStats from './pages/reports/OverallStats';

// Doküman sayfaları
import DocumentList from './pages/documents/DocumentList';

// Ayarlar sayfası
import Settings from './pages/settings/Settings';

function App() {
  return (
    <CustomThemeProvider>
      <SnackbarProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Giriş sayfası - korumasız */}
              <Route path="/login" element={<Login />} />
              
              {/* Korumalı rotalar */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Toplantı rotaları */}
                  <Route path="/meetings" element={<MeetingList />} />
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
                  
                  {/* Raporlama rotaları */}
                  <Route path="/meetings/:meetingId/stats" element={<MeetingStats />} />
                  <Route path="/reports" element={<OverallStats />} />
                  
                  {/* Doküman rotaları */}
                  <Route path="/documents" element={<DocumentList />} />
                  
                  {/* Ayarlar rotası */}
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </CustomThemeProvider>
  );
}

export default App;
