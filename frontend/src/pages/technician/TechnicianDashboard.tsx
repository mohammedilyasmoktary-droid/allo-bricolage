import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  ListItemIcon,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { techniciansApi } from '../../api/technicians';
import { bookingsApi, Booking } from '../../api/bookings';
import { subscriptionsApi } from '../../api/subscriptions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EditIcon from '@mui/icons-material/Edit';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (user?.technicianProfile) {
        setIsOnline(user.technicianProfile.isOnline);
      }

      const [bookingsData, subscription] = await Promise.all([
        bookingsApi.getMyBookings(),
        subscriptionsApi.getStatus().catch(() => null),
      ]);

      // Sort bookings by scheduled date
      bookingsData.sort((a, b) => {
        if (!a.scheduledDateTime && !b.scheduledDateTime) return 0;
        if (!a.scheduledDateTime) return 1;
        if (!b.scheduledDateTime) return -1;
        return new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime();
      });

      setBookings(bookingsData);
      setSubscriptionStatus(subscription);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      await techniciansApi.toggleOnline(!isOnline);
      setIsOnline(!isOnline);
      await refreshUser();
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, { status });
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update booking status:', error);
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

  // Get current/ongoing job
  const currentJob = bookings.find(
    (b) => b.status === 'ON_THE_WAY' || b.status === 'IN_PROGRESS' || b.status === 'ACCEPTED'
  );

  // Get upcoming jobs (next 5)
  const upcomingJobs = bookings
    .filter((b) => {
      if (!b.scheduledDateTime) return false;
      const bookingDate = new Date(b.scheduledDateTime);
      const now = new Date();
      return bookingDate > now && (b.status === 'ACCEPTED' || b.status === 'PENDING');
    })
    .slice(0, 5);

  // Get completed jobs this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedThisMonth = bookings.filter((b) => {
    if (b.status !== 'COMPLETED') return false;
    const completedDate = new Date(b.createdAt);
    return completedDate >= startOfMonth;
  });

  // Calculate earnings (placeholder)
  const totalEarnings = bookings
    .filter((b) => b.paymentStatus === 'PAID' && b.finalPrice)
    .reduce((sum, b) => sum + (b.finalPrice || 0), 0);

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
            Bienvenue, {user?.name} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos missions et suivez vos performances
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={isOnline}
              onChange={handleToggleOnline}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#4caf50',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#4caf50',
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontWeight: 600, color: isOnline ? '#4caf50' : '#666' }}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Typography>
          }
        />
      </Box>

      {/* Subscription Warning */}
      {subscriptionStatus && !subscriptionStatus.canAcceptJobs && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/technician/subscription')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Renouveler
            </Button>
          }
        >
          Votre abonnement a expiré. Renouvelez pour continuer à recevoir des missions.
        </Alert>
      )}

      {subscriptionStatus && subscriptionStatus.subscription && subscriptionStatus.daysRemaining <= 7 && subscriptionStatus.daysRemaining > 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Votre abonnement expire dans {subscriptionStatus.daysRemaining} jour(s).{' '}
          <Button
            size="small"
            onClick={() => navigate('/technician/subscription')}
            sx={{ textTransform: 'none', ml: 1, fontWeight: 600 }}
          >
            Renouveler maintenant
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Job */}
        {currentJob && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed', bgcolor: '#fff3e0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BuildIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.25rem' }}>
                    Mission en cours
                  </Typography>
                </Box>
                <Paper sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                        {currentJob.category?.name || 'Service'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {currentJob.client?.name || 'Client'}
                        </Typography>
                      </Box>
                      {currentJob.scheduledDateTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(currentJob.scheduledDateTime), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {currentJob.address}, {currentJob.city}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={getStatusLabel(currentJob.status)}
                      color={getStatusColor(currentJob.status)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {currentJob.status === 'ACCEPTED' && (
                      <Button
                        variant="contained"
                        startIcon={<DirectionsCarIcon />}
                        onClick={() => handleStatusUpdate(currentJob.id, 'ON_THE_WAY')}
                        sx={{
                          bgcolor: '#032B5A',
                          '&:hover': { bgcolor: '#021d3f' },
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Arrivé
                      </Button>
                    )}
                    {currentJob.status === 'ON_THE_WAY' && (
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStatusUpdate(currentJob.id, 'IN_PROGRESS')}
                        sx={{
                          bgcolor: '#4caf50',
                          '&:hover': { bgcolor: '#388e3c' },
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Commencer
                      </Button>
                    )}
                    {currentJob.status === 'IN_PROGRESS' && (
                      <Button
                        variant="contained"
                        startIcon={<StopIcon />}
                        onClick={() => handleStatusUpdate(currentJob.id, 'COMPLETED')}
                        sx={{
                          bgcolor: '#F4C542',
                          color: '#032B5A',
                          '&:hover': { bgcolor: '#f5b800' },
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Terminer
                      </Button>
                    )}
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Upcoming Jobs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 3, fontSize: '1.25rem' }}>
                Prochaines missions
              </Typography>
              {upcomingJobs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Aucune mission à venir
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {upcomingJobs.map((booking) => (
                    <Paper
                      key={booking.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #e8eaed',
                        bgcolor: 'white',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                        {booking.category?.name || 'Service'}
                      </Typography>
                      {booking.scheduledDateTime && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {format(new Date(booking.scheduledDateTime), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {booking.city}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 2, fontSize: '1.1rem' }}>
                    Missions terminées ce mois
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {completedThisMonth.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 2, fontSize: '1.1rem' }}>
                    Gains totaux
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#F4C542' }}>
                    {totalEarnings.toFixed(2)} MAD
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 3, fontSize: '1.25rem' }}>
                Actions rapides
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate('/technician/profile')}
                    sx={{
                      borderColor: '#032B5A',
                      color: '#032B5A',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#021d3f',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    Modifier profil
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BuildIcon />}
                    onClick={() => navigate('/technician/requests')}
                    sx={{
                      borderColor: '#032B5A',
                      color: '#032B5A',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#021d3f',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    Voir les demandes
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => navigate('/technician/jobs')}
                    sx={{
                      borderColor: '#032B5A',
                      color: '#032B5A',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#021d3f',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    Mes travaux
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => navigate('/technician/subscription')}
                    sx={{
                      borderColor: '#032B5A',
                      color: '#032B5A',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#021d3f',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    Abonnement
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

          {/* Job Actions Dialog */}
          {selectedJob && (
            <Paper
              sx={{
                position: 'fixed',
                bottom: 20,
                right: jobsPanelOpen ? 400 : 20,
                width: 350,
                p: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                zIndex: 1000,
                bgcolor: 'white',
                border: '2px solid #F4C542',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  Actions Mission
                </Typography>
                <IconButton size="small" onClick={() => setSelectedJob(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                  Client: {selectedJob.client?.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                  Service: {selectedJob.category?.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                  Statut: {getStatusLabel(selectedJob.status)}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
                  Prix: {selectedJob.finalPrice || selectedJob.estimatedPrice || 0} MAD
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => {
                  navigate(`/technician/jobs`);
                  setSelectedJob(null);
                }}
                sx={{
                  bgcolor: '#032B5A',
                  color: 'white',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Voir les détails
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={isOnline}
                    onChange={handleToggleOnline}
                    color="primary"
                  />
                }
                label={isOnline ? 'En ligne' : 'Hors ligne'}
                sx={{ mb: 2, width: '100%', justifyContent: 'space-between' }}
              />
              <Button
                fullWidth
                variant="outlined"
                startIcon={isOnline ? <CancelIcon /> : <CheckCircleIcon />}
                onClick={handleToggleOnline}
                sx={{
                  borderColor: isOnline ? '#dc3545' : '#4caf50',
                  color: isOnline ? '#dc3545' : '#4caf50',
                  '&:hover': {
                    borderColor: isOnline ? '#c82333' : '#388e3c',
                    bgcolor: isOnline ? 'rgba(220, 53, 69, 0.05)' : 'rgba(76, 175, 80, 0.05)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {isOnline ? 'Désactiver disponibilité' : 'Activer disponibilité'}
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TechnicianDashboard;
