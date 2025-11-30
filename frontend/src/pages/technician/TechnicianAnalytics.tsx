import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi, Booking } from '../../api/bookings';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

const TechnicianAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'TECHNICIAN') {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');
  const totalRevenue = completedJobs.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
  const averageRating = user?.technicianProfile?.averageRating || 0;

  // Monthly performance
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  const currentMonthBookings = completedJobs.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    return bookingDate >= startOfMonth(currentMonth) && bookingDate <= endOfMonth(currentMonth);
  });
  const lastMonthBookings = completedJobs.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    return bookingDate >= startOfMonth(lastMonth) && bookingDate <= endOfMonth(lastMonth);
  });

  const currentMonthRevenue = currentMonthBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
  const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
  const revenueChange = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, p: { xs: 2, md: 0 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4, color: '#032B5A' }}>
        Statistiques & Performance
      </Typography>

      <Grid container spacing={3}>
        {/* Jobs Completed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#032B5A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WorkIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    {completedJobs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Travaux terminés
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((completedJobs.length / 100) * 100, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#032B5A',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Generated */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#F4C542',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoneyIcon sx={{ fontSize: 30, color: '#032B5A' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    {totalRevenue.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenus totaux (MAD)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon
                  sx={{
                    fontSize: 20,
                    color: revenueChange >= 0 ? '#4caf50' : '#f44336',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: revenueChange >= 0 ? '#4caf50' : '#f44336',
                    fontWeight: 600,
                  }}
                >
                  {revenueChange >= 0 ? '+' : ''}
                  {revenueChange.toFixed(1)}% ce mois
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Performance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    {currentMonthBookings.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ce mois-ci
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {format(startOfMonth(currentMonth), 'MMM yyyy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Rating */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#F4C542',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon sx={{ fontSize: 30, color: '#032B5A' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Note moyenne
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    sx={{
                      fontSize: 16,
                      color: star <= Math.round(averageRating) ? '#F4C542' : '#e0e0e0',
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Revenue Chart */}
      <Card sx={{ mt: 4, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
            Performance Mensuelle
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Revenus ce mois
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  {currentMonthRevenue.toFixed(0)} MAD
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: revenueChange >= 0 ? '#4caf50' : '#f44336',
                    mt: 1,
                  }}
                >
                  {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}% vs mois dernier
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Travaux ce mois
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  {currentMonthBookings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {lastMonthBookings.length} le mois dernier
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TechnicianAnalytics;





