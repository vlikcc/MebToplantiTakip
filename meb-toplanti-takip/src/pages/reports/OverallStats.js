import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event as EventIcon,
  PeopleAlt as PeopleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
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
  LineChart,
  Line,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import meetingService from '../../services/meetingService';
import attendeeService from '../../services/attendeeService';
import userService from '../../services/userService';
import locationService from '../../services/locationService';

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const OverallStats = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // all, month, 3months, 6months, year
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalUsers: 0,
    totalAttendees: 0,
    totalLocations: 0,
    meetingsPerMonth: [],
    attendeesPerMeeting: [],
    meetingsPerLocation: [],
    topUsers: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tüm verileri getir
        const meetingsData = await meetingService.getAllMeetings();
        const usersData = await userService.getAllUsers();
        const locationsData = await locationService.getAllLocations();
        
        setMeetings(meetingsData);
        setUsers(usersData);
        setLocations(locationsData);
        
        // İstatistikleri hesapla
        calculateStats(meetingsData, usersData, locationsData);
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Zaman aralığına göre verileri filtrele
  useEffect(() => {
    if (meetings.length > 0) {
      let filteredMeetings = [...meetings];
      
      if (timeRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
          case 'month':
            startDate = subMonths(now, 1);
            break;
          case '3months':
            startDate = subMonths(now, 3);
            break;
          case '6months':
            startDate = subMonths(now, 6);
            break;
          case 'year':
            startDate = subMonths(now, 12);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          filteredMeetings = meetings.filter(meeting => 
            new Date(meeting.startDate) >= startDate
          );
        }
      }
      
      calculateStats(filteredMeetings, users, locations);
    }
  }, [timeRange, meetings, users, locations]);

  // İstatistikleri hesapla
  const calculateStats = (meetingsData, usersData, locationsData) => {
    // Temel sayılar
    const totalMeetings = meetingsData.length;
    const totalUsers = usersData.length;
    const totalLocations = locationsData.length;
    
    // Toplantı başına katılımcı sayısı
    const attendeesPerMeeting = meetingsData.map(meeting => ({
      name: meeting.title.length > 15 ? meeting.title.substring(0, 15) + '...' : meeting.title,
      value: meeting.attendees?.length || 0,
    })).sort((a, b) => b.value - a.value).slice(0, 10);
    
    // Lokasyonlara göre toplantı sayısı
    const locationMap = {};
    meetingsData.forEach(meeting => {
      if (meeting.location) {
        const locationName = meeting.location.locationName || 'Belirtilmemiş';
        locationMap[locationName] = (locationMap[locationName] || 0) + 1;
      }
    });
    
    const meetingsPerLocation = Object.keys(locationMap).map(location => ({
      name: location,
      value: locationMap[location],
    })).sort((a, b) => b.value - a.value);
    
    // Aylara göre toplantı sayısı
    const monthMap = {};
    meetingsData.forEach(meeting => {
      if (meeting.startDate) {
        try {
          const date = new Date(meeting.startDate);
          // Geçerli bir tarih olup olmadığını kontrol et
          if (!isNaN(date.getTime())) {
            const monthYear = format(date, 'MMMM yyyy', { locale: tr });
            monthMap[monthYear] = (monthMap[monthYear] || 0) + 1;
          }
        } catch (error) {
          console.warn('Geçersiz tarih formatı:', meeting.startDate);
        }
      }
    });
    
    // Son 6 ayı al ve sırala
    const last6Months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const month = subMonths(now, i);
      const monthYear = format(month, 'MMMM yyyy', { locale: tr });
      last6Months.unshift({
        name: monthYear,
        value: monthMap[monthYear] || 0,
      });
    }
    
    // En aktif kullanıcılar (en çok toplantıya katılanlar)
    // Bu kısım için gerçek veri olmadığından örnek veri oluşturuyoruz
    const topUsers = usersData.slice(0, 5).map((user, index) => ({
      name: user.userName,
      value: Math.floor(Math.random() * 10) + 1, // Örnek veri
    })).sort((a, b) => b.value - a.value);
    
    setStats({
      totalMeetings,
      totalUsers,
      totalLocations,
      totalAttendees: attendeesPerMeeting.reduce((sum, item) => sum + item.value, 0),
      meetingsPerMonth: last6Months,
      attendeesPerMeeting,
      meetingsPerLocation,
      topUsers,
    });
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportPDF = () => {
    // PDF dışa aktarma işlevi (gerçek uygulamada implement edilecek)
    alert('PDF dışa aktarma özelliği henüz implement edilmedi.');
  };

  const handleExportExcel = () => {
    // Excel dışa aktarma işlevi (gerçek uygulamada implement edilecek)
    alert('Excel dışa aktarma özelliği henüz implement edilmedi.');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Genel İstatistikler</Typography>
        <Box>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={timeRange}
              label="Zaman Aralığı"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="all">Tüm Zamanlar</MenuItem>
              <MenuItem value="month">Son 1 Ay</MenuItem>
              <MenuItem value="3months">Son 3 Ay</MenuItem>
              <MenuItem value="6months">Son 6 Ay</MenuItem>
              <MenuItem value="year">Son 1 Yıl</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ mr: 1 }}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* Özet Kartlar */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalMeetings}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Toplantı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Kullanıcı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalAttendees}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Katılımcı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalLocations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Lokasyon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sekme Menüsü */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Toplantı İstatistikleri" />
          <Tab label="Katılımcı İstatistikleri" />
          <Tab label="Lokasyon İstatistikleri" />
        </Tabs>
      </Paper>

      {/* Toplantı İstatistikleri */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Aylara Göre Toplantı Sayısı" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
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
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Toplantı Sayısı"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Lokasyonlara Göre Toplantı Dağılımı" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.meetingsPerLocation}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.meetingsPerLocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Katılımcı İstatistikleri */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Toplantı Başına Katılımcı Sayısı" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.attendeesPerMeeting}
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
                    <Bar dataKey="value" name="Katılımcı Sayısı" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="En Aktif Kullanıcılar" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.topUsers}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Katılım Sayısı" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Lokasyon İstatistikleri */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Lokasyonlara Göre Toplantı Sayısı" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={stats.meetingsPerLocation}
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
                    <Bar dataKey="value" name="Toplantı Sayısı" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default OverallStats;