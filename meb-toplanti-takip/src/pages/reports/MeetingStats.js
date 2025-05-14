import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Button, // Button bileşenini ekleyin
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PeopleAlt as PeopleIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
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
import meetingService from '../../services/meetingService';
import attendeeService from '../../services/attendeeService';

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MeetingStats = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttendees: 0,
    institutionStats: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Toplantı bilgilerini getir
        const meetingData = await meetingService.getMeetingById(meetingId);
        setMeeting(meetingData);

        // Katılımcıları getir
        const attendeesData = await attendeeService.getMeetingAttendees(meetingId);
        setAttendees(attendeesData);

        // İstatistikleri hesapla
        calculateStats(attendeesData);
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId]);

  // İstatistikleri hesapla
  const calculateStats = (attendeesData) => {
    // Toplam katılımcı sayısı
    const totalAttendees = attendeesData.length;

    // Kurumlara göre katılımcı dağılımı
    const institutionMap = {};
    attendeesData.forEach(attendee => {
      const institution = attendee.institutionName || 'Belirtilmemiş';
      institutionMap[institution] = (institutionMap[institution] || 0) + 1;
    });

    const institutionStats = Object.keys(institutionMap).map(institution => ({
      name: institution,
      value: institutionMap[institution],
    }));

    setStats({
      totalAttendees,
      institutionStats,
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!meeting) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Toplantı bulunamadı
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/meetings"
          sx={{ mt: 2 }}
        >
          Toplantı Listesine Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton
          color="primary"
          component={Link}
          to={`/meetings/${meetingId}`}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Toplantı İstatistikleri</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {meeting.title}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Box display="flex" alignItems="center">
            <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              {meeting.startDate
                ? format(parseISO(meeting.startDate), 'PPP', {
                    locale: tr,
                  })
                : '-'}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              {meeting.startDate
                ? format(parseISO(meeting.startDate), 'p', {
                    locale: tr,
                  })
                : '-'}
              {meeting.endDate ? ' - ' : ''}
              {meeting.endDate
                ? format(parseISO(meeting.endDate), 'p', {
                    locale: tr,
                  })
                : ''}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              {meeting.location?.locationName || '-'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Katılımcı Sayısı" />
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h3">{stats.totalAttendees}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Kurumlara Göre Katılım" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.institutionStats}
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
            <CardHeader title="Kurum Dağılımı" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.institutionStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.institutionStats.map((entry, index) => (
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
    </Box>
  );
};

export default MeetingStats;