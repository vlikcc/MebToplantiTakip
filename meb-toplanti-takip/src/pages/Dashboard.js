import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import meetingService from '../services/meetingService';
import userService from '../services/userService';
import locationService from '../services/locationService';
import attendeeService from '../services/attendeeService';

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = ({ title, value, icon, color, isLoading }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h6" component="div">
                {value}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    meetings: 0,
    locations: 0,
    documents: 0,
    upcomingMeetings: [],
    recentActivities: [],
    meetingsPerMonth: [],
    attendeesPerMeeting: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tüm verileri getir
        const meetingsData = await meetingService.getAllMeetings();
        const usersData = await userService.getAllUsers();
        const locationsData = await locationService.getAllLocations();
        
        // Yaklaşan toplantıları filtrele (bugünden sonraki 7 gün içindeki)
        const now = new Date();
        const nextWeek = addDays(now, 7);
        const upcomingMeetings = meetingsData
          .filter(meeting => {
            const meetingDate = new Date(meeting.startDate);
            return isAfter(meetingDate, now) && isBefore(meetingDate, nextWeek);
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5); // En yakın 5 toplantı
        
        // Son aktiviteler (en son eklenen 5 toplantı)
        const recentActivities = [...meetingsData]
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 5);
        
        // Toplantı başına katılımcı sayısı
        const attendeesPerMeeting = meetingsData
          .slice(0, 5) // İlk 5 toplantı
          .map(meeting => ({
            name: meeting.title.length > 15 ? meeting.title.substring(0, 15) + '...' : meeting.title,
            value: meeting.attendees?.length || 0,
          }));
        
        // Aylara göre toplantı sayısı
        const monthMap = {};
        meetingsData.forEach(meeting => {
          if (meeting.startDate) {
            try {
              const date = new Date(meeting.startDate);
              // Geçerli bir tarih olup olmadığını kontrol et
              if (!isNaN(date.getTime())) {
                const monthYear = format(date, 'MMMM', { locale: tr });
                monthMap[monthYear] = (monthMap[monthYear] || 0) + 1;
              }
            } catch (error) {
              console.warn('Geçersiz tarih formatı:', meeting.startDate);
            }
          }
        });
        
        const meetingsPerMonth = Object.keys(monthMap).map(month => ({
          name: month,
          value: monthMap[month],
        }));
        
        // Doküman sayısını hesapla
        const documentsCount = meetingsData.reduce((count, meeting) => {
          return count + (meeting.documents?.length || 0);
        }, 0);
        
        setStats({
          users: usersData.length,
          meetings: meetingsData.length,
          locations: locationsData.length,
          documents: documentsCount,
          upcomingMeetings,
          recentActivities,
          meetingsPerMonth,
          attendeesPerMeeting,
        });
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.users}
            icon={<PeopleIcon color="primary" />}
            color="primary"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Toplantı"
            value={stats.meetings}
            icon={<EventIcon color="secondary" />}
            color="secondary"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Lokasyon"
            value={stats.locations}
            icon={<LocationIcon color="success" />}
            color="success"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Doküman"
            value={stats.documents}
            icon={<DocumentIcon color="warning" />}
            color="warning"
            isLoading={loading}
          />
        </Grid>

        {/* Yaklaşan Toplantılar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Yaklaşan Toplantılar</Typography>
              <Button 
                component={Link} 
                to="/meetings" 
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                Tümünü Gör
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : stats.upcomingMeetings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Yaklaşan toplantı bulunmuyor.
              </Typography>
            ) : (
              <List>
                {stats.upcomingMeetings.map((meeting, index) => (
                  <React.Fragment key={meeting.meetingId}>
                    <ListItem 
                      component={Link} 
                      to={`/meetings/${meeting.meetingId}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { backgroundColor: 'action.hover' } 
                      }}
                    >
                      <ListItemIcon>
                        <EventIcon style={{ color: meeting.color || '#1976d2' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={meeting.title}
                        secondary={
                          <React.Fragment>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                              {formatDate(meeting.startDate, 'PPP')}
                            </Box>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                              {formatDate(meeting.startDate, 'p')}
                            </Box>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <LocationIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                              {meeting.location?.locationName || '-'}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < stats.upcomingMeetings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Son Aktiviteler */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Son Aktiviteler</Typography>
              <Button 
                component={Link} 
                to="/meetings" 
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                Tümünü Gör
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : stats.recentActivities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Henüz aktivite bulunmuyor.
              </Typography>
            ) : (
              <List>
                {stats.recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.meetingId}>
                    <ListItem 
                      component={Link} 
                      to={`/meetings/${activity.meetingId}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { backgroundColor: 'action.hover' } 
                      }}
                    >
                      <ListItemIcon>
                        <EventIcon style={{ color: activity.color || '#1976d2' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <React.Fragment>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                              {formatDate(activity.startDate, 'PPP')}
                            </Box>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <LocationIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                              {activity.location?.locationName || '-'}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < stats.recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Grafikler */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aylara Göre Toplantı Dağılımı
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : stats.meetingsPerMonth.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Henüz veri bulunmuyor.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.meetingsPerMonth}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Toplantı Sayısı" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Toplantı Başına Katılımcı Sayısı
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : stats.attendeesPerMeeting.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Henüz veri bulunmuyor.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.attendeesPerMeeting}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.attendeesPerMeeting.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

// Yaklaşan toplantılar ve son aktiviteler için tarih formatı işlevi
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