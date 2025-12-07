import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  InputAdornment,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Rating,
  TextareaAutosize,
} from '@mui/material';
import { bookingsApi, Booking } from '../../api/bookings';
import { reviewsApi, CreateReviewData } from '../../api/reviews';
import { useAuth } from '../../contexts/AuthContext';
import { generateBookingPDF, BookingPDFData } from '../../utils/pdfGenerator';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import StarIcon from '@mui/icons-material/Star';

const TechnicianJobs: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string, finalPrice?: number) => {
    try {
      await bookingsApi.updateStatus(bookingId, { status, finalPrice });
      loadJobs();
      if (status === 'COMPLETED') {
        setCompleteDialogOpen(false);
        setSelectedBooking(null);
        setFinalPrice('');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    try {
      await bookingsApi.confirmPayment(bookingId);
      loadJobs();
      setError('');
    } catch (error: any) {
      console.error('Failed to confirm payment:', error);
      setError(error.response?.data?.error || 'Erreur lors de la confirmation du paiement');
    }
  };

  const handleCompleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setFinalPrice(booking.finalPrice?.toString() || booking.estimatedPrice?.toString() || '');
    setCompleteDialogOpen(true);
    setError('');
  };

  const handleCompleteSubmit = () => {
    if (!selectedBooking) return;
    const price = parseFloat(finalPrice);
    if (isNaN(price) || price <= 0) {
      setError('Veuillez entrer un prix valide');
      return;
    }
    updateStatus(selectedBooking.id, 'COMPLETED', price);
  };

  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
    
    // Load existing review if payment is paid
    if (booking.paymentStatus === 'PAID' && booking.reviews && booking.reviews.length > 0) {
      const technicianReview = booking.reviews.find((r: any) => r.reviewerId === user?.id);
      if (technicianReview) {
        setExistingReview(technicianReview);
        setReviewRating(technicianReview.rating);
        setReviewComment(technicianReview.comment || '');
      } else {
        setExistingReview(null);
        setReviewRating(5);
        setReviewComment('');
      }
    } else {
      setExistingReview(null);
      setReviewRating(5);
      setReviewComment('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedBooking) return;
    
    const pdfData: BookingPDFData = {
      bookingId: selectedBooking.id,
      clientName: selectedBooking.client?.name || 'N/A',
      clientEmail: selectedBooking.client?.email || 'N/A',
      clientPhone: selectedBooking.client?.phone || 'N/A',
      technicianName: selectedBooking.technician?.name || 'N/A',
      technicianPhone: selectedBooking.technician?.phone || 'N/A',
      serviceCategory: selectedBooking.category?.name || 'N/A',
      description: selectedBooking.description,
      address: selectedBooking.address,
      city: selectedBooking.city,
      scheduledDate: selectedBooking.scheduledDateTime,
      status: selectedBooking.status,
      estimatedPrice: selectedBooking.estimatedPrice,
      finalPrice: selectedBooking.finalPrice,
      paymentMethod: selectedBooking.paymentMethod,
      paymentStatus: selectedBooking.paymentStatus,
      receiptUrl: selectedBooking.receiptUrl,
      transactionId: selectedBooking.transactionId,
      createdAt: selectedBooking.createdAt,
      review: existingReview ? {
        rating: existingReview.rating,
        comment: existingReview.comment,
        createdAt: existingReview.createdAt,
      } : undefined,
    };
    
    await generateBookingPDF(pdfData);
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking || !selectedBooking.clientId) return;
    
    setSubmittingReview(true);
    try {
      const reviewData: CreateReviewData = {
        bookingId: selectedBooking.id,
        revieweeId: selectedBooking.clientId,
        rating: reviewRating,
        comment: reviewComment || undefined,
      };
      
      await reviewsApi.create(reviewData);
      setReviewSuccess(true);
      
      // Reload booking to get updated review
      const updated = await bookingsApi.getById(selectedBooking.id);
      setSelectedBooking(updated);
      const technicianReview = updated.reviews?.find((r: any) => r.reviewerId === user?.id);
      if (technicianReview) {
        setExistingReview(technicianReview);
      }
      
      // Reload all jobs
      loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec de la soumission de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
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

  const getStatusLabel = (status: Booking['status']) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      ACCEPTED: 'Accepté',
      ON_THE_WAY: 'En route',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé',
      AWAITING_PAYMENT: 'En attente de paiement',
      DECLINED: 'Refusé',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
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
        return <AccessTimeIcon sx={{ fontSize: 18 }} />;
    }
  };

  // Filter and categorize bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.category?.name?.toLowerCase().includes(query) ||
          b.client?.name?.toLowerCase().includes(query) ||
          b.address?.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }

    // Status filter based on tab
    const statusMap = [
      ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'], // Active
      ['AWAITING_PAYMENT'], // Payment
      ['COMPLETED'], // Completed
    ];
    const allowedStatuses = statusMap[tabValue] || [];
    if (tabValue === 0 && statusFilter !== 'all') {
      // If using dropdown filter on active tab
      filtered = filtered.filter((b) => b.status === statusFilter);
    } else if (allowedStatuses.length > 0) {
      filtered = filtered.filter((b) => allowedStatuses.includes(b.status));
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [bookings, tabValue, statusFilter, searchQuery]);

  const activeCount = bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status)).length;
  const paymentCount = bookings.filter((b) => b.status === 'AWAITING_PAYMENT').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#032B5A' }}>
          Mes travaux
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos missions et suivez l'avancement de vos interventions
        </Typography>
      </Box>

      {/* Search and Tabs */}
      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher par client, service, adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => {
                  setTabValue(newValue);
                  setStatusFilter('all');
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 140,
                  },
                }}
              >
                <Tab
                  label={
                    <Badge badgeContent={activeCount} color="primary">
                      En cours
                    </Badge>
                  }
                />
                <Tab
                  label={
                    <Badge badgeContent={paymentCount} color="warning">
                      Paiement
                    </Badge>
                  }
                />
                <Tab
                  label={
                    <Badge badgeContent={completedCount} color="success">
                      Terminés
                    </Badge>
                  }
                />
              </Tabs>
            </Grid>
          </Grid>
          {tabValue === 0 && (
            <Box sx={{ mt: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrer par statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrer par statut"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="ACCEPTED">Acceptés</MenuItem>
                  <MenuItem value="ON_THE_WAY">En route</MenuItem>
                  <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                {searchQuery
                  ? 'Aucun travail trouvé'
                  : tabValue === 0
                  ? 'Aucun travail en cours'
                  : tabValue === 1
                  ? 'Aucun paiement en attente'
                  : 'Aucun travail terminé'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les nouveaux travaux apparaîtront ici'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const isUrgent = booking.estimatedPrice && booking.technicianProfile?.basePrice && 
                            booking.estimatedPrice === (booking.technicianProfile.basePrice || 0) + 100;

            return (
              <Grid item xs={12} key={booking.id}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
                              Mission #{booking.id.slice(0, 8).toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
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
                        {isUrgent && (
                          <Chip
                            label="Urgent"
                            size="small"
                            sx={{
                              bgcolor: '#fff3e0',
                              color: '#ff9800',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              border: '2px solid #ff9800',
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

                    <Grid container spacing={3}>
                      {/* Left Column - Details */}
                      <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                          {/* Client */}
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Client
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: '#F4C542',
                                  color: '#032B5A',
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                }}
                              >
                                {booking.client?.name?.charAt(0).toUpperCase() || 'C'}
                              </Avatar>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                {booking.client?.name || 'Client'}
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
                          {(booking.estimatedPrice || booking.finalPrice) && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Prix
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#F4C542', ml: 4 }}>
                                {booking.finalPrice || booking.estimatedPrice} MAD
                                {booking.finalPrice && booking.estimatedPrice && booking.finalPrice !== booking.estimatedPrice && (
                                  <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                                    (estimé: {booking.estimatedPrice} MAD)
                                  </Typography>
                                )}
                              </Typography>
                            </Grid>
                          )}

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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DescriptionIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                  Description:
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#032B5A', lineHeight: 1.8, ml: 4 }}>
                                {booking.description}
                              </Typography>
                            </Paper>
                          </Grid>

                          {/* Photos */}
                          {booking.photos && booking.photos.length > 0 && (
                            <Grid item xs={12}>
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <PhotoLibraryIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                    Photos ({booking.photos.length}):
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 4 }}>
                                  {booking.photos.slice(0, 4).map((photo, index) => (
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
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          borderColor: '#F4C542',
                                          transform: 'scale(1.05)',
                                        },
                                      }}
                                      onClick={() => window.open(photo, '_blank')}
                                    />
                                  ))}
                                  {booking.photos.length > 4 && (
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
                                      onClick={() => handleViewDetails(booking)}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                        +{booking.photos.length - 4}
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
                            Actions
                          </Typography>

                          {booking.status === 'ACCEPTED' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<DirectionsCarIcon />}
                              onClick={() => updateStatus(booking.id, 'ON_THE_WAY')}
                              sx={{
                                bgcolor: '#2196f3',
                                color: 'white',
                                '&:hover': { bgcolor: '#1976d2' },
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.25,
                                fontWeight: 600,
                              }}
                            >
                              En route
                            </Button>
                          )}

                          {booking.status === 'ON_THE_WAY' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<BuildIcon />}
                              onClick={() => updateStatus(booking.id, 'IN_PROGRESS')}
                              sx={{
                                bgcolor: '#03a9f4',
                                color: 'white',
                                '&:hover': { bgcolor: '#0288d1' },
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.25,
                                fontWeight: 600,
                              }}
                            >
                              Arrivé - Commencer
                            </Button>
                          )}

                          {booking.status === 'IN_PROGRESS' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleCompleteClick(booking)}
                              sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                '&:hover': { bgcolor: '#388e3c' },
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.25,
                                fontWeight: 600,
                                boxShadow: 2,
                              }}
                            >
                              Terminer le travail
                            </Button>
                          )}

                          {booking.status === 'AWAITING_PAYMENT' && booking.paymentStatus === 'PENDING' && (
                            <>
                              <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  Paiement en attente de confirmation
                                </Typography>
                                <Typography variant="caption">
                                  {booking.paymentMethod === 'CASH'
                                    ? 'Le client a sélectionné le paiement en espèces. Confirmez lorsque vous recevez le paiement.'
                                    : booking.paymentMethod === 'WAFACASH' || booking.paymentMethod === 'BANK_TRANSFER'
                                    ? 'Le client a uploadé un reçu. Vérifiez et confirmez le paiement.'
                                    : 'Le client a initié un paiement. Vérifiez et confirmez.'}
                                </Typography>
                              </Alert>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PaymentIcon />}
                                onClick={() => handleConfirmPayment(booking.id)}
                                sx={{
                                  bgcolor: '#4caf50',
                                  color: 'white',
                                  '&:hover': { bgcolor: '#388e3c' },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1.25,
                                  fontWeight: 600,
                                  boxShadow: 2,
                                }}
                              >
                                Confirmer le paiement
                              </Button>
                            </>
                          )}

                          {booking.status === 'AWAITING_PAYMENT' && booking.paymentStatus !== 'PENDING' && (
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                              En attente du paiement du client
                            </Alert>
                          )}

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(booking)}
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

                          <Divider sx={{ my: 1 }} />

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

      {/* Complete Work Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
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
            bgcolor: '#4caf50',
            color: 'white',
            fontWeight: 700,
          }}
        >
          Finaliser le travail
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Veuillez entrer le prix final facturé au client. Ce montant sera utilisé pour le paiement.
          </Alert>
          <TextField
            fullWidth
            label="Prix final (MAD)"
            type="number"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon sx={{ color: '#F4C542' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            helperText={selectedBooking?.estimatedPrice ? `Prix estimé: ${selectedBooking.estimatedPrice} MAD` : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => {
              setCompleteDialogOpen(false);
              setFinalPrice('');
            }}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCompleteSubmit}
            variant="contained"
            sx={{
              bgcolor: '#4caf50',
              color: 'white',
              '&:hover': { bgcolor: '#388e3c' },
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Détails de la mission
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {selectedBooking && (selectedBooking.paymentStatus === 'PAID' || selectedBooking.paymentStatus === 'PENDING') && (
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPDF}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#F4C542',
                    bgcolor: 'rgba(244, 197, 66, 0.1)',
                  },
                }}
              >
                PDF
              </Button>
            )}
            <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem disableGutters>
                    <PersonIcon sx={{ mr: 2, color: '#F4C542' }} />
                    <ListItemText
                      primary="Client"
                      secondary={selectedBooking.client?.name || 'N/A'}
                      primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <BuildIcon sx={{ mr: 2, color: '#F4C542' }} />
                    <ListItemText
                      primary="Service"
                      secondary={selectedBooking.category?.name || 'N/A'}
                      primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <LocationOnIcon sx={{ mr: 2, color: '#F4C542' }} />
                    <ListItemText
                      primary="Adresse"
                      secondary={`${selectedBooking.address}, ${selectedBooking.city}`}
                      primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                    />
                  </ListItem>
                  {selectedBooking.scheduledDateTime && (
                    <ListItem disableGutters>
                      <CalendarTodayIcon sx={{ mr: 2, color: '#F4C542' }} />
                      <ListItemText
                        primary="Date prévue"
                        secondary={format(new Date(selectedBooking.scheduledDateTime), 'PPp')}
                        primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                      />
                    </ListItem>
                  )}
                  {(selectedBooking.estimatedPrice || selectedBooking.finalPrice) && (
                    <ListItem disableGutters>
                      <AttachMoneyIcon sx={{ mr: 2, color: '#F4C542' }} />
                      <ListItemText
                        primary="Prix"
                        secondary={`${selectedBooking.finalPrice || selectedBooking.estimatedPrice} MAD`}
                        primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    {selectedBooking.description}
                  </Typography>
                </Paper>
                {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                      Photos ({selectedBooking.photos.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedBooking.photos.map((photo, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box
                            component="img"
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 120,
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
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* Review Section */}
          {selectedBooking && selectedBooking.paymentStatus === 'PAID' && selectedBooking.status === 'COMPLETED' && (
            <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <StarIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  Évaluer le client
                </Typography>
              </Box>
              {reviewSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Votre avis a été soumis avec succès!
                </Alert>
              )}
              {existingReview ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Rating value={existingReview.rating} readOnly size="large" sx={{ color: '#F4C542' }} />
                  </Box>
                  {existingReview.comment && (
                    <Typography variant="body1" sx={{ color: '#032B5A', mb: 2 }}>
                      {existingReview.comment}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Publié le {new Date(existingReview.createdAt).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#032B5A' }}>
                      Note
                    </Typography>
                    <Rating
                      value={reviewRating}
                      onChange={(_, newValue) => setReviewRating(newValue || 5)}
                      size="large"
                      sx={{ color: '#F4C542' }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#032B5A' }}>
                      Commentaire (optionnel)
                    </Typography>
                    <TextareaAutosize
                      minRows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Partagez votre expérience avec ce client..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        resize: 'vertical',
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    startIcon={!submittingReview && <StarIcon />}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      '&:hover': { bgcolor: '#e0b038' },
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 700,
                    }}
                  >
                    {submittingReview ? 'Envoi...' : 'Soumettre l\'avis'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => {
              setDetailDialogOpen(false);
              setReviewSuccess(false);
            }}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicianJobs;
