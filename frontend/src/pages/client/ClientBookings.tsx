import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Paper,
  Alert,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, Booking } from '../../api/bookings';
import { reviewsApi } from '../../api/reviews';
import { format } from 'date-fns';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

const ClientBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });

  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'price'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (booking: Booking) => {
    setReviewDialog({ open: true, booking });
  };

  const submitReview = async () => {
    if (!reviewDialog.booking) return;

    try {
      const technicianId = reviewDialog.booking.technicianId || reviewDialog.booking.technicianProfile?.userId;
      if (!technicianId) return;

      await reviewsApi.create({
        bookingId: reviewDialog.booking.id,
        revieweeId: technicianId,
        rating,
        comment,
      });
      setReviewDialog({ open: false, booking: null });
      setRating(5);
      setComment('');
      loadBookings();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog.booking) return;
    try {
      await bookingsApi.cancel(cancelDialog.booking.id);
      setCancelDialog({ open: false, booking: null });
      loadBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      PENDING: { bg: '#fff3e0', color: '#ff9800' },
      ACCEPTED: { bg: '#e3f2fd', color: '#2196f3' },
      ON_THE_WAY: { bg: '#e1f5fe', color: '#03a9f4' },
      IN_PROGRESS: { bg: '#e8f5e9', color: '#4caf50' },
      COMPLETED: { bg: '#e8f5e9', color: '#4caf50' },
      AWAITING_PAYMENT: { bg: '#fff9c4', color: '#fbc02d' },
      DECLINED: { bg: '#ffebee', color: '#f44336' },
      CANCELLED: { bg: '#fafafa', color: '#9e9e9e' },
    };
    return colors[status] || { bg: '#f5f5f5', color: '#9e9e9e' };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      ACCEPTED: 'Acceptée',
      ON_THE_WAY: 'En route',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      AWAITING_PAYMENT: 'En attente de paiement',
      DECLINED: 'Refusée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <HourglassEmptyIcon sx={{ fontSize: 18 }} />;
      case 'ACCEPTED':
        return <CheckCircleIcon sx={{ fontSize: 18 }} />;
      case 'ON_THE_WAY':
        return <DirectionsCarIcon sx={{ fontSize: 18 }} />;
      case 'IN_PROGRESS':
        return <BuildIcon sx={{ fontSize: 18 }} />;
      case 'COMPLETED':
        return <CheckCircleIcon sx={{ fontSize: 18 }} />;
      case 'AWAITING_PAYMENT':
        return <PaymentIcon sx={{ fontSize: 18 }} />;
      default:
        return <HourglassEmptyIcon sx={{ fontSize: 18 }} />;
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.category?.name?.toLowerCase().includes(query) ||
          b.technician?.name?.toLowerCase().includes(query) ||
          b.address?.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'price':
          const priceA = a.finalPrice || a.estimatedPrice || 0;
          const priceB = b.finalPrice || b.estimatedPrice || 0;
          return priceB - priceA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, statusFilter, searchQuery, sortBy]);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const statusMap = ['all', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED'];
    setStatusFilter(statusMap[newValue] || 'all');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box
        sx={{
          mb: 5,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
          boxShadow: '0 8px 32px rgba(3, 43, 90, 0.15)',
          color: 'white',
        }}
      >
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
          Mes réservations
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Gérez et suivez toutes vos réservations de services
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e8eaed',
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par service, technicien, adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  label="Trier par"
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="date">Date (récent)</MenuItem>
                  <MenuItem value="status">Statut</MenuItem>
                  <MenuItem value="price">Prix</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 120,
                  },
                }}
              >
                <Tab label="Toutes" />
                <Tab label="En attente" />
                <Tab label="Acceptées" />
                <Tab label="En cours" />
                <Tab label="À payer" />
                <Tab label="Terminées" />
              </Tabs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredAndSortedBookings.length === 0 ? (
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e8eaed',
            bgcolor: 'white',
            overflow: 'hidden',
          }}
        >
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Aucune réservation trouvée'
                  : 'Aucune réservation pour le moment'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par réserver un technicien pour vos besoins de maintenance'}
              </Typography>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/client/search')}
                  sx={{
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    '&:hover': { bgcolor: '#e0b038' },
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Rechercher un technicien
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const finalPrice = booking.finalPrice || booking.estimatedPrice;
            const canCancel = ['PENDING', 'ACCEPTED'].includes(booking.status);
            const canRate = booking.status === 'COMPLETED' && booking.paymentStatus === 'PAID' && !booking.reviews?.some((r: any) => r.reviewerId === booking.clientId);

            return (
              <Grid item xs={12} key={booking.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #e8eaed',
                    bgcolor: 'white',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                      borderColor: '#F4C542',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2,
                              bgcolor: '#F4C542',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <BuildIcon sx={{ fontSize: 32, color: '#032B5A' }} />
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                              {booking.category?.name || 'Service'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Réservation #{booking.id.slice(0, 8).toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(booking.status)}
                        label={getStatusLabel(booking.status)}
                        sx={{
                          bgcolor: statusColor.bg,
                          color: statusColor.color,
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          border: `2px solid ${statusColor.color}`,
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

                    <Grid container spacing={3}>
                      {/* Left Column - Details */}
                      <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                          {/* Technician */}
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Technicien
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 4 }}>
                              {booking.technicianProfile?.profilePictureUrl && (
                                <Avatar
                                  src={booking.technicianProfile.profilePictureUrl}
                                  sx={{ width: 32, height: 32, border: '2px solid #F4C542' }}
                                >
                                  {booking.technician?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                              )}
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                {booking.technician?.name || 'Non assigné'}
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Address */}
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOnIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Adresse
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A', ml: 4 }}>
                              {booking.address}, {booking.city}
                            </Typography>
                          </Grid>

                          {/* Date */}
                          {booking.scheduledDateTime && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CalendarTodayIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Date prévue
                                </Typography>
                              </Box>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A', ml: 4 }}>
                                {format(new Date(booking.scheduledDateTime), 'PPp')}
                              </Typography>
                            </Grid>
                          )}

                          {/* Price */}
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Prix
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F4C542', ml: 4 }}>
                              {finalPrice ? `${finalPrice} MAD` : 'À déterminer'}
                            </Typography>
                          </Grid>

                          {/* Description */}
                          <Grid item xs={12}>
                            <Paper
                              sx={{
                                p: 2,
                                bgcolor: '#f8f9fa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                mt: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                                Description:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#032B5A', lineHeight: 1.8 }}>
                                {booking.description}
                              </Typography>
                            </Paper>
                          </Grid>

                          {/* Photos */}
                          {booking.photos && booking.photos.length > 0 && (
                            <Grid item xs={12}>
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                                  Photos ({booking.photos.length}):
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {booking.photos.slice(0, 3).map((photo, index) => (
                                    <Box
                                      key={index}
                                      component="img"
                                      src={photo}
                                      alt={`Photo ${index + 1}`}
                                      sx={{
                                        width: 80,
                                        height: 80,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        border: '2px solid #e0e0e0',
                                        cursor: 'pointer',
                                        '&:hover': {
                                          borderColor: '#F4C542',
                                          transform: 'scale(1.05)',
                                        },
                                      }}
                                      onClick={() => window.open(photo, '_blank')}
                                    />
                                  ))}
                                  {booking.photos.length > 3 && (
                                    <Box
                                      sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        border: '2px dashed #e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: '#f5f5f5',
                                        cursor: 'pointer',
                                        '&:hover': {
                                          borderColor: '#F4C542',
                                          bgcolor: '#fffbf0',
                                        },
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                        +{booking.photos.length - 3}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>

                      {/* Right Column - Actions */}
                      <Grid item xs={12} md={4}>
                        <Box
                          sx={{
                            bgcolor: '#f8f9fa',
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid #e0e0e0',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
                            Actions rapides
                          </Typography>

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/client/bookings/recap?bookingId=${booking.id}`)}
                            sx={{
                              borderColor: '#032B5A',
                              color: '#032B5A',
                              '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                              textTransform: 'none',
                              borderRadius: 2,
                              py: 1.25,
                              fontWeight: 600,
                            }}
                          >
                            Voir les détails
                          </Button>

                          {booking.status === 'AWAITING_PAYMENT' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<PaymentIcon />}
                              onClick={() => navigate(`/payment/${booking.id}`)}
                              sx={{
                                bgcolor: '#F4C542',
                                color: '#032B5A',
                                '&:hover': { bgcolor: '#e0b038' },
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.25,
                                fontWeight: 700,
                                boxShadow: 2,
                              }}
                            >
                              Procéder au paiement
                            </Button>
                          )}

                          {canCancel && (
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<CancelIcon />}
                              onClick={() => setCancelDialog({ open: true, booking })}
                              sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244, 67, 54, 0.05)' },
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.25,
                                fontWeight: 600,
                              }}
                            >
                              Annuler la réservation
                            </Button>
                          )}

                          {canRate && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<StarIcon />}
                              onClick={() => handleReview(booking)}
                              sx={{
                                bgcolor: '#032B5A',
                                color: 'white',
                                '&:hover': { bgcolor: '#021d3f' },
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.25,
                                fontWeight: 600,
                              }}
                            >
                              Noter le technicien
                            </Button>
                          )}

                          <Divider sx={{ my: 1 }} />

                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#032B5A', display: 'block', mb: 0.5 }}>
                              Paiement
                            </Typography>
                            <Chip
                              label={booking.paymentStatus === 'PAID' ? 'Payé' : booking.paymentStatus === 'PENDING' ? 'En attente' : 'Non payé'}
                              size="small"
                              sx={{
                                bgcolor: booking.paymentStatus === 'PAID' ? '#e8f5e9' : booking.paymentStatus === 'PENDING' ? '#fff3e0' : '#ffebee',
                                color: booking.paymentStatus === 'PAID' ? '#4caf50' : booking.paymentStatus === 'PENDING' ? '#ff9800' : '#f44336',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                            {booking.paymentMethod && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Méthode: {booking.paymentMethod}
                              </Typography>
                            )}
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#032B5A', display: 'block', mb: 0.5 }}>
                              Date de création
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(booking.createdAt), 'PPp')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, booking: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#032B5A',
            color: 'white',
            fontWeight: 700,
          }}
        >
          Noter le technicien
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
              {reviewDialog.booking?.technician?.name}
            </Typography>
            <Typography component="legend" sx={{ mb: 1, fontWeight: 600, color: '#032B5A' }}>
              Note
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 5)}
              size="large"
              sx={{ color: '#F4C542', fontSize: 40 }}
            />
          </Box>
          <TextField
            fullWidth
            label="Commentaire (optionnel)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce technicien..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => setReviewDialog({ open: false, booking: null })}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={submitReview}
            variant="contained"
            sx={{
              bgcolor: '#F4C542',
              color: '#032B5A',
              '&:hover': { bgcolor: '#e0b038' },
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
            }}
          >
            Envoyer l'avis
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, booking: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#f44336',
            color: 'white',
            fontWeight: 700,
          }}
        >
          Annuler la réservation
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Êtes-vous sûr de vouloir annuler cette réservation? Cette action est irréversible.
          </Alert>
          <Typography variant="body1" sx={{ color: '#032B5A' }}>
            Service: <strong>{cancelDialog.booking?.category?.name}</strong>
          </Typography>
          <Typography variant="body1" sx={{ color: '#032B5A', mt: 1 }}>
            Technicien: <strong>{cancelDialog.booking?.technician?.name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => setCancelDialog({ open: false, booking: null })}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Non, garder
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              '&:hover': { bgcolor: '#d32f2f' },
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
            }}
          >
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientBookings;
