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
  Rating,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi, Booking } from '../../api/bookings';
import { techniciansApi, Technician } from '../../api/technicians';
import { categoriesApi, Category } from '../../api/categories';
import { normalizeImageUrl } from '../../utils/imageUrl';
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
import StarIcon from '@mui/icons-material/Star';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [topTechnicians, setTopTechnicians] = useState<Technician[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Category[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadTopTechnicians();
    loadFeaturedServices();
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

  const loadTopTechnicians = async () => {
    try {
      console.log('Loading top technicians...');
      const data = await techniciansApi.getAvailable();
      console.log('Technicians loaded:', data.length);
      // Sort by rating and take top 3
      const sorted = data
        .filter(t => t.verificationStatus === 'APPROVED')
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);
      console.log('Top 3 technicians:', sorted);
      setTopTechnicians(sorted);
    } catch (error) {
      console.error('Failed to load top technicians:', error);
    } finally {
      setLoadingTechs(false);
    }
  };

  const loadFeaturedServices = async () => {
    try {
      console.log('Loading featured services...');
      const data = await categoriesApi.getAll();
      console.log('Categories loaded:', data.length);
      // Get top 3 most popular services
      const popularServices = ['Plomberie', 'Électricité', 'Climatisation'];
      const filtered = data
        .filter(cat => popularServices.includes(cat.name))
        .slice(0, 3);
      console.log('Featured services:', filtered);
      setFeaturedServices(filtered);
    } catch (error) {
      console.error('Failed to load featured services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const getServiceIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Plomberie': <PlumbingIcon sx={{ fontSize: 24, color: '#032B5A' }} />,
      'Électricité': <ElectricalServicesIcon sx={{ fontSize: 24, color: '#032B5A' }} />,
      'Climatisation': <AcUnitIcon sx={{ fontSize: 24, color: '#032B5A' }} />,
    };
    return iconMap[name] || <BuildIcon sx={{ fontSize: 24, color: '#032B5A' }} />;
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
    <Box sx={{ bgcolor: '#fafbfc', minHeight: '100vh', py: 3, position: 'relative' }}>
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
        {/* Left Side - Services and Technicians */}
        <Grid item xs={12} lg={8}>
          {/* Top Services Section */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#F4C542',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BuildIcon sx={{ fontSize: 28, color: '#032B5A' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.25rem' }}>
                  Top Services
                </Typography>
              </Box>
              {loadingServices ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#032B5A' }} />
                </Box>
              ) : featuredServices.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucun service disponible
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {featuredServices.map((service, index) => (
                    <Grid item xs={12} sm={4} key={service.id}>
                      <Card
                        onClick={() => navigate(`/search?category=${service.id}`)}
                        sx={{
                          height: '100%',
                          borderRadius: 2,
                          border: '1px solid #e8eaed',
                          bgcolor: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            borderColor: '#F4C542',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: 2,
                              bgcolor: '#F4C542',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            {getServiceIcon(service.name)}
                          </Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: '#032B5A',
                              mb: 1,
                              fontSize: '1rem',
                            }}
                          >
                            {service.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.8rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {service.description || 'Service professionnel'}
                          </Typography>
                          <Box
                            sx={{
                              mt: 1.5,
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: '#032B5A',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              mx: 'auto',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Top Technicians Section */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#F4C542',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon sx={{ fontSize: 28, color: '#032B5A' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.25rem' }}>
                  Top Techniciens
                </Typography>
              </Box>
              {loadingTechs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#032B5A' }} />
                </Box>
              ) : topTechnicians.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucun technicien disponible
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {topTechnicians.map((technician, index) => {
                    const imageIndex = (technician.id?.charCodeAt(0) || 1) % 8 + 1;
                    const technicianImage = `/images/technicians/technician_${imageIndex}.svg`;

                    return (
                      <Grid item xs={12} sm={4} key={technician.id}>
                        <Card
                          onClick={() => navigate(`/technician/view/${technician.id}`)}
                          sx={{
                            height: '100%',
                            borderRadius: 2,
                            border: '1px solid #e8eaed',
                            bgcolor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              borderColor: '#F4C542',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                            <Avatar
                              src={normalizeImageUrl(technician.profilePictureUrl || technicianImage)}
                              sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: '#032B5A',
                                color: '#F4C542',
                                fontWeight: 700,
                                fontSize: '2rem',
                              }}
                            >
                              {technician.user?.name?.charAt(0).toUpperCase() || 'T'}
                            </Avatar>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                color: '#032B5A',
                                mb: 1,
                                fontSize: '1rem',
                              }}
                            >
                              {technician.user?.name || 'Technicien'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                              <Rating
                                value={technician.averageRating}
                                readOnly
                                size="small"
                                precision={0.5}
                                sx={{ fontSize: '0.9rem' }}
                              />
                              <Typography variant="body2" sx={{ color: '#032B5A', fontWeight: 700, fontSize: '0.9rem' }}>
                                {technician.averageRating.toFixed(1)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                              <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                {technician.user?.city || 'Ville'}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#F4C542',
                                color: '#032B5A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                mx: 'auto',
                              }}
                            >
                              {index + 1}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
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

        {/* Right Sidebar - Mini Dashboard */}
        <Grid item xs={12} lg={4}>
          <Box
            sx={{
              position: { lg: 'sticky' },
              top: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Notifications */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <NotificationsIcon sx={{ color: '#032B5A', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1rem' }}>
                    Notifications
                  </Typography>
                </Box>
                {notifications.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1.5, fontSize: '0.85rem' }}>
                    Aucune notification
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {notifications.map((notification, index) => (
                      <Alert key={index} severity="info" sx={{ borderRadius: 2, py: 1 }}>
                        {notification.message}
                      </Alert>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 2.5, fontSize: '1rem' }}>
                  Statistiques
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                      Total des réservations
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '2rem' }}>
                      {bookings.length}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                      Réservations terminées
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', fontSize: '2rem' }}>
                      {bookings.filter((b) => b.status === 'COMPLETED').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;

