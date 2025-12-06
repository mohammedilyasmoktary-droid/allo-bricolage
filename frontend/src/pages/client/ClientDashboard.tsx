import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi, Booking } from '../../api/bookings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BuildIcon from '@mui/icons-material/Build';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bookingsData] = await Promise.all([
        bookingsApi.getMyBookings(),
        // TODO: Load notifications when API is ready
      ]);
      setBookings(bookingsData);
      // Sort by date, most recent first
      bookingsData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      ACCEPTED: 'Acceptée',
      DECLINED: 'Refusée',
      ON_THE_WAY: 'En route',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      AWAITING_PAYMENT: 'En attente de paiement',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      PENDING: 'warning',
      ACCEPTED: 'info',
      DECLINED: 'error',
      ON_THE_WAY: 'info',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      AWAITING_PAYMENT: 'warning',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon sx={{ fontSize: 18 }} />;
      case 'IN_PROGRESS':
      case 'ON_THE_WAY':
        return <DirectionsCarIcon sx={{ fontSize: 18 }} />;
      case 'PENDING':
      case 'AWAITING_PAYMENT':
        return <HourglassEmptyIcon sx={{ fontSize: 18 }} />;
      default:
        return undefined;
    }
  };

  const recentBookings = bookings.slice(0, 5);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#032B5A' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafbfc', minHeight: '100vh', py: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
          Bienvenue, {user?.name} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos réservations et suivez vos services en un seul endroit
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* My Orders Section */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.25rem' }}>
                  Mes Réservations
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/client/bookings')}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#032B5A',
                    color: '#032B5A',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#021d3f',
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  Voir toutes les réservations
                </Button>
              </Box>

              {recentBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BuildIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Aucune réservation pour le moment
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/search')}
                    sx={{
                      bgcolor: '#032B5A',
                      '&:hover': { bgcolor: '#021d3f' },
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Réserver un technicien
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentBookings.map((booking) => (
                    <Paper
                      key={booking.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid #e8eaed',
                        bgcolor: 'white',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: '#F4C542',
                        },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/client/bookings`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '1rem' }}>
                              {booking.category?.name || 'Service'}
                            </Typography>
                            <Chip
                              label={getStatusLabel(booking.status)}
                              size="small"
                              color={getStatusColor(booking.status)}
                              icon={getStatusIcon(booking.status) || undefined}
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          </Box>
                          {booking.technicianProfile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {booking.technicianProfile.user?.name || 'Technicien'}
                              </Typography>
                            </Box>
                          )}
                          {booking.scheduledDateTime && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(booking.scheduledDateTime), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {booking.city}
                            </Typography>
                          </Box>
                        </Box>
                        {booking.finalPrice && (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F4C542' }}>
                              {booking.finalPrice} MAD
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 3, fontSize: '1.25rem' }}>
                Actions rapides
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<BuildIcon />}
                    onClick={() => navigate('/search')}
                    sx={{
                      bgcolor: '#032B5A',
                      '&:hover': { bgcolor: '#021d3f' },
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(3, 43, 90, 0.3)',
                    }}
                  >
                    Réserver un technicien
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/client/bookings')}
                    disabled
                    sx={{
                      borderColor: '#e0e0e0',
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    Voir mes factures
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Notifications */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <NotificationsIcon sx={{ color: '#032B5A' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.1rem' }}>
                  Notifications
                </Typography>
              </Box>
              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Aucune notification pour le moment
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {notifications.map((notification, index) => (
                    <Alert key={index} severity="info" sx={{ borderRadius: 2 }}>
                      {notification.message}
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 3, fontSize: '1.1rem' }}>
                Statistiques
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total des réservations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    {bookings.length}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Réservations terminées
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {bookings.filter((b) => b.status === 'COMPLETED').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;

