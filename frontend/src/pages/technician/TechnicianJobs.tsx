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
  List,
  ListItem,
  ListItemText,
  Rating,
  TextareaAutosize,
} from '@mui/material';
import { bookingsApi, Booking } from '../../api/bookings';
import { reviewsApi, CreateReviewData } from '../../api/reviews';
import { quotesApi, Quote, CreateQuoteData } from '../../api/quotes';
import { useAuth } from '../../contexts/AuthContext';
import { generateBookingPDF, BookingPDFData, generateQuotePDF, QuotePDFData } from '../../utils/pdfGenerator';
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
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

const TechnicianJobs: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteConditions, setQuoteConditions] = useState('');
  const [quoteEquipment, setQuoteEquipment] = useState('');
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      console.log('🔄 Loading technician jobs...');
      console.log('Current user:', user?.id, user?.role);
      const data = await bookingsApi.getMyBookings();
      console.log('✅ Technician jobs loaded:', data?.length || 0, 'bookings');
      console.log('📦 Jobs data type:', typeof data, 'Is array:', Array.isArray(data));
      console.log('📦 Jobs data:', data);
      
      // Ensure data is an array
      if (!data) {
        console.warn('⚠️ No data returned from API');
        setBookings([]);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('❌ Data is not an array:', typeof data, data);
        setError('Format de données invalide reçu du serveur');
        setBookings([]);
        return;
      }
      
      // Log detailed booking information
      if (data.length > 0) {
        console.log('📋 First booking details:', {
          id: data[0].id,
          status: data[0].status,
          technicianId: data[0].technicianId,
          technicianProfileId: data[0].technicianProfileId,
          hasQuote: !!data[0].quote,
        });
      }
      
      // Log quote information for debugging
      data.forEach((booking: Booking) => {
        if (booking.quote) {
          console.log(`✅ Booking ${booking.id} has quote:`, booking.quote);
        } else {
          console.log(`❌ Booking ${booking.id} has NO quote`);
        }
      });
      
      setBookings(data);
      console.log('✅ Bookings state updated with', data.length, 'items');
    } catch (error: any) {
      console.error('❌ Failed to load jobs:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        code: error.code,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Erreur lors du chargement des missions. Veuillez réessayer.';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Network Error')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer dans quelques instants.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const updateStatus = async (bookingId: string, status: string, finalPrice?: number) => {
    try {
      setError(''); // Clear any previous errors
      await bookingsApi.updateStatus(bookingId, { status, finalPrice });
      loadJobs();
      if (status === 'COMPLETED') {
        setCompleteDialogOpen(false);
        setSelectedBooking(null);
        setFinalPrice('');
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la mise à jour du statut';
      setError(errorMessage);
      throw error; // Re-throw to allow caller to handle it
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

  const handleCreateQuote = (booking: Booking) => {
    setSelectedBooking(booking);
    setQuoteConditions(booking.quote?.conditions || '');
    setQuoteEquipment(booking.quote?.equipment || '');
    setQuotePrice(booking.quote?.price?.toString() || booking.estimatedPrice?.toString() || '');
    setQuoteDialogOpen(true);
    setError('');
  };

  const handleSubmitQuote = async () => {
    if (!selectedBooking) return;
    
    if (!quoteConditions.trim()) {
      setError('Veuillez remplir les conditions');
      return;
    }
    if (!quoteEquipment.trim()) {
      setError('Veuillez remplir la liste d\'équipement');
      return;
    }
    const price = parseFloat(quotePrice);
    if (isNaN(price) || price <= 0) {
      setError('Veuillez entrer un prix valide');
      return;
    }

    setSubmittingQuote(true);
    setError('');
    
    try {
      const quoteData: CreateQuoteData = {
        bookingId: selectedBooking.id,
        conditions: quoteConditions.trim(),
        equipment: quoteEquipment.trim(),
        price,
      };
      
      await quotesApi.create(quoteData);
      setQuoteDialogOpen(false);
      setQuoteConditions('');
      setQuoteEquipment('');
      setQuotePrice('');
      // Reload jobs to get updated quote data
      await loadJobs();
      // If detail dialog is open, reload the booking details
      if (selectedBooking && detailDialogOpen) {
        const updatedBooking = await bookingsApi.getById(selectedBooking.id);
        setSelectedBooking(updatedBooking);
      }
    } catch (err: any) {
      console.error('Failed to create quote:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création du devis');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleDownloadQuotePDF = async (quote: Quote, booking: Booking) => {
    try {
      const pdfData: QuotePDFData = {
        quoteId: quote.id,
        bookingId: booking.id,
        clientName: booking.client?.name || 'Client',
        clientEmail: booking.client?.email || '',
        clientPhone: booking.client?.phone || '',
        technicianName: booking.technician?.name || 'Technicien',
        technicianPhone: booking.technician?.phone || '',
        serviceCategory: booking.category?.name || '',
        description: booking.description || '',
        address: booking.address || '',
        city: booking.city || '',
        conditions: quote.conditions,
        equipment: quote.equipment,
        price: quote.price,
        createdAt: quote.createdAt,
      };
      
      await generateQuotePDF(pdfData);
    } catch (error) {
      console.error('Failed to generate quote PDF:', error);
      setError('Erreur lors de la génération du PDF');
    }
  };

  const handleViewDetails = async (booking: Booking) => {
    try {
      // Reload booking details to get the latest quote and other data
      const fullBooking = await bookingsApi.getById(booking.id);
      setSelectedBooking(fullBooking);
      setDetailDialogOpen(true);
      
      // Load existing review if payment is paid
      if (fullBooking.paymentStatus === 'PAID' && fullBooking.reviews && fullBooking.reviews.length > 0) {
        const technicianReview = fullBooking.reviews.find((r: any) => r.reviewerId === user?.id);
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
    } catch (error: any) {
      console.error('Failed to load booking details:', error);
      setError('Erreur lors du chargement des détails');
      // Fallback to using the booking passed as parameter
      setSelectedBooking(booking);
      setDetailDialogOpen(true);
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
    // Ensure bookings is an array
    if (!bookings || !Array.isArray(bookings)) {
      console.warn('Bookings is not an array:', bookings);
      return [];
    }

    let filtered = [...bookings];
    console.log('Filtering bookings. Total:', bookings.length, 'Status filter:', statusFilter, 'Search:', searchQuery);

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
      console.log('After search filter:', filtered.length);
    }

    // Status filter - show all if 'all' is selected, otherwise filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
      console.log('After status filter:', filtered.length);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('Final filtered bookings:', filtered.length);
    return filtered;
  }, [bookings, statusFilter, searchQuery]);


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

      {/* Global Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

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
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrer par statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrer par statut"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="ACCEPTED">Acceptés</MenuItem>
                  <MenuItem value="ON_THE_WAY">En route</MenuItem>
                  <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                  <MenuItem value="AWAITING_PAYMENT">En attente de paiement</MenuItem>
                  <MenuItem value="COMPLETED">Terminé</MenuItem>
                  <MenuItem value="DECLINED">Refusé</MenuItem>
                  <MenuItem value="CANCELLED">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ mb: 2 }}>
                <BuildIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              </Box>
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                {searchQuery
                  ? 'Aucun travail trouvé'
                  : statusFilter !== 'all'
                  ? 'Aucun travail avec ce statut'
                  : 'Aucun travail'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                {searchQuery
                  ? 'Essayez de modifier vos critères de recherche pour trouver des missions correspondantes.'
                  : statusFilter !== 'all'
                  ? 'Aucune mission ne correspond au filtre sélectionné. Essayez de changer le filtre de statut.'
                  : 'Vous n\'avez actuellement aucune mission. Les nouvelles missions apparaîtront ici.'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Section Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                Toutes les missions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {filteredBookings.length} mission{filteredBookings.length > 1 ? 's' : ''} {statusFilter !== 'all' ? 'avec ce statut' : 'au total'}
              </Typography>
            </Box>
          </Box>

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
                    borderRadius: 4,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'white',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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

                          {/* Status Update Dropdown - Available for all editable statuses */}
                          {(booking.status === 'PENDING' || 
                            booking.status === 'ACCEPTED' || 
                            booking.status === 'ON_THE_WAY' || 
                            booking.status === 'IN_PROGRESS' || 
                            booking.status === 'AWAITING_PAYMENT') && (
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                              <InputLabel>Changer le statut</InputLabel>
                              <Select
                                value={booking.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (newStatus !== booking.status) {
                                    if (newStatus === 'COMPLETED') {
                                      handleCompleteClick(booking);
                                    } else {
                                      updateStatus(booking.id, newStatus);
                                    }
                                  }
                                }}
                                label="Changer le statut"
                                sx={{ borderRadius: 2 }}
                              >
                                {booking.status === 'PENDING' && (
                                  <>
                                    <MenuItem value="ACCEPTED">Accepter</MenuItem>
                                    <MenuItem value="DECLINED">Refuser</MenuItem>
                                  </>
                                )}
                                {booking.status === 'ACCEPTED' && (
                                  <MenuItem value="ON_THE_WAY">En route</MenuItem>
                                )}
                                {booking.status === 'ON_THE_WAY' && (
                                  <>
                                    <MenuItem value="ACCEPTED">Retour à Accepté</MenuItem>
                                    <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                                  </>
                                )}
                                {booking.status === 'IN_PROGRESS' && (
                                  <>
                                    <MenuItem value="ON_THE_WAY">Retour à En route</MenuItem>
                                    <MenuItem value="COMPLETED">Terminer</MenuItem>
                                  </>
                                )}
                                {booking.status === 'AWAITING_PAYMENT' && booking.paymentStatus !== 'PAID' && (
                                  <MenuItem value="IN_PROGRESS">Retour à En cours</MenuItem>
                                )}
                              </Select>
                            </FormControl>
                          )}

                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                onClick={async () => {
                                  try {
                                    await bookingsApi.accept(booking.id);
                                    loadJobs();
                                  } catch (error: any) {
                                    setError(error.response?.data?.error || 'Erreur lors de l\'acceptation');
                                  }
                                }}
                                sx={{
                                  bgcolor: '#4caf50',
                                  color: 'white',
                                  '&:hover': { bgcolor: '#388e3c' },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1.25,
                                  fontWeight: 600,
                                  mb: 1,
                                  boxShadow: 2,
                                }}
                              >
                                Accepter la mission
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<CloseIcon />}
                                onClick={async () => {
                                  try {
                                    await bookingsApi.decline(booking.id);
                                    loadJobs();
                                  } catch (error: any) {
                                    setError(error.response?.data?.error || 'Erreur lors du refus');
                                  }
                                }}
                                sx={{
                                  borderColor: '#dc3545',
                                  color: '#dc3545',
                                  '&:hover': { 
                                    borderColor: '#c82333', 
                                    bgcolor: 'rgba(220, 53, 69, 0.05)' 
                                  },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1.25,
                                  fontWeight: 600,
                                }}
                              >
                                Refuser
                              </Button>
                            </>
                          )}

                          {booking.status === 'ACCEPTED' && (
                            <>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<MessageIcon />}
                                onClick={() => navigate(`/messages?bookingId=${booking.id}`)}
                                sx={{
                                  bgcolor: '#F4C542',
                                  color: '#032B5A',
                                  '&:hover': { bgcolor: '#e0b038' },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1.25,
                                  fontWeight: 600,
                                  mb: 1,
                                  boxShadow: 2,
                                }}
                              >
                                Message
                              </Button>
                              {!booking.quote && (
                                <Button
                                  fullWidth
                                  variant="contained"
                                  startIcon={<DescriptionIcon />}
                                  onClick={() => handleCreateQuote(booking)}
                                  sx={{
                                    bgcolor: '#032B5A',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#021d3f' },
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    py: 1.25,
                                    fontWeight: 600,
                                    mb: 1,
                                  }}
                                >
                                  Créer un devis
                                </Button>
                              )}
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<DirectionsCarIcon />}
                                onClick={async () => {
                                  try {
                                    await updateStatus(booking.id, 'ON_THE_WAY');
                                  } catch (err: any) {
                                    // Error is already set by updateStatus
                                    console.error('Failed to update to ON_THE_WAY:', err);
                                  }
                                }}
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
                            </>
                          )}

                          {booking.status === 'ON_THE_WAY' && (
                            <>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<BuildIcon />}
                                onClick={async () => {
                                  try {
                                    setError(''); // Clear previous errors
                                    console.log('Attempting to update booking to IN_PROGRESS:', booking.id);
                                    console.log('Booking quote status:', booking.quote ? 'Has quote' : 'No quote');
                                    
                                    // Double-check quote exists before attempting update
                                    if (!booking.quote) {
                                      setError('Un devis doit être créé avant de commencer le travail. Veuillez créer un devis d\'abord.');
                                      setSelectedBooking(booking);
                                      handleCreateQuote(booking);
                                      return;
                                    }
                                    
                                    await updateStatus(booking.id, 'IN_PROGRESS');
                                  } catch (err: any) {
                                    console.error('Failed to update to IN_PROGRESS:', err);
                                    const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la mise à jour du statut';
                                    
                                    if (errorMessage.includes('devis') || errorMessage.includes('Devis')) {
                                      setError('Un devis doit être créé avant de commencer le travail. Veuillez créer un devis d\'abord.');
                                      // Open quote dialog if no quote exists
                                      if (!booking.quote) {
                                        setSelectedBooking(booking);
                                        handleCreateQuote(booking);
                                      }
                                    } else {
                                      setError(errorMessage);
                                    }
                                  }
                                }}
                                disabled={!booking.quote}
                                sx={{
                                  bgcolor: '#03a9f4',
                                  color: 'white',
                                  '&:hover': { bgcolor: '#0288d1' },
                                  '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1.25,
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              >
                                {booking.quote ? 'Arrivé - Commencer' : 'Créer un devis d\'abord'}
                              </Button>
                              {!booking.quote && (
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<DescriptionIcon />}
                                  onClick={() => handleCreateQuote(booking)}
                                  sx={{
                                    borderColor: '#F4C542',
                                    color: '#032B5A',
                                    '&:hover': { 
                                      borderColor: '#e0b038', 
                                      bgcolor: 'rgba(244, 197, 66, 0.1)' 
                                    },
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    py: 1,
                                    fontWeight: 600,
                                    mb: 1,
                                  }}
                                >
                                  Créer un devis
                                </Button>
                              )}
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => updateStatus(booking.id, 'ACCEPTED')}
                                sx={{
                                  borderColor: '#9e9e9e',
                                  color: '#666',
                                  '&:hover': { 
                                    borderColor: '#757575', 
                                    bgcolor: 'rgba(158, 158, 158, 0.05)' 
                                  },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1,
                                  fontWeight: 600,
                                }}
                              >
                                Retour à Accepté
                              </Button>
                            </>
                          )}

                          {booking.status === 'IN_PROGRESS' && (
                            <>
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
                                  mb: 1,
                                  boxShadow: 2,
                                }}
                              >
                                Terminer le travail
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => updateStatus(booking.id, 'ON_THE_WAY')}
                                sx={{
                                  borderColor: '#9e9e9e',
                                  color: '#666',
                                  '&:hover': { 
                                    borderColor: '#757575', 
                                    bgcolor: 'rgba(158, 158, 158, 0.05)' 
                                  },
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 1,
                                  fontWeight: 600,
                                }}
                              >
                                Retour à En route
                              </Button>
                            </>
                          )}

                          {booking.status === 'AWAITING_PAYMENT' && booking.paymentStatus === 'PENDING' && (
                            <>
                              <Alert 
                                severity="warning" 
                                icon={<PaymentIcon sx={{ fontSize: 24 }} />}
                                sx={{ 
                                  borderRadius: 3, 
                                  mb: 2,
                                  bgcolor: '#fffbf0',
                                  border: '2px solid #ff9800',
                                  '& .MuiAlert-icon': {
                                    color: '#f57c00',
                                  },
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#f57c00' }}>
                                  💰 Paiement en attente de confirmation
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1.5, color: '#032B5A' }}>
                                  {booking.paymentMethod === 'CASH'
                                    ? 'Le client a sélectionné le paiement en espèces. Confirmez lorsque vous recevez le paiement.'
                                    : booking.paymentMethod === 'WAFACASH' || booking.paymentMethod === 'BANK_TRANSFER'
                                    ? 'Le client a uploadé un reçu. Vérifiez et confirmez le paiement.'
                                    : 'Le client a initié un paiement. Vérifiez et confirmez.'}
                                </Typography>
                                {booking.finalPrice && (
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00', mt: 1 }}>
                                    Montant à recevoir: {booking.finalPrice} MAD
                                  </Typography>
                                )}
                              </Alert>
                              
                              {/* Show receipt if uploaded */}
                              {booking.receiptUrl && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '2px solid #ff9800' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <ReceiptIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                      Reçu de paiement uploadé
                                    </Typography>
                                  </Box>
                                  {booking.receiptUrl.endsWith('.pdf') ? (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      href={booking.receiptUrl}
                                      target="_blank"
                                      startIcon={<ReceiptIcon />}
                                      sx={{
                                        borderColor: '#ff9800',
                                        color: '#f57c00',
                                        '&:hover': { borderColor: '#f57c00', bgcolor: 'rgba(255, 152, 0, 0.1)' },
                                        textTransform: 'none',
                                      }}
                                    >
                                      Voir le reçu PDF
                                    </Button>
                                  ) : (
                                    <Box
                                      component="img"
                                      src={booking.receiptUrl}
                                      alt="Payment Receipt"
                                      onClick={() => window.open(booking.receiptUrl, '_blank')}
                                      sx={{
                                        width: '100%',
                                        maxHeight: 200,
                                        objectFit: 'contain',
                                        borderRadius: 2,
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer',
                                        '&:hover': {
                                          borderColor: '#ff9800',
                                          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                                        },
                                      }}
                                    />
                                  )}
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                                    Cliquez pour agrandir et vérifier
                                  </Typography>
                                </Box>
                              )}
                              
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PaymentIcon />}
                                onClick={() => handleConfirmPayment(booking.id)}
                                sx={{
                                  bgcolor: '#ff9800',
                                  color: 'white',
                                  '&:hover': { 
                                    bgcolor: '#f57c00',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                                  },
                                  textTransform: 'none',
                                  borderRadius: 3,
                                  py: 1.5,
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {booking.receiptUrl ? '✓ Vérifier et confirmer le paiement' : '✓ Confirmer le paiement'}
                              </Button>
                            </>
                          )}
                          
                          {/* Completed section - Show review option */}
                          {booking.paymentStatus === 'PAID' && booking.status === 'COMPLETED' && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #4caf50' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                                ✓ Mission complétée et payée
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#032B5A', display: 'block', mb: 1 }}>
                                Montant reçu: <strong>{booking.finalPrice || booking.estimatedPrice} MAD</strong>
                              </Typography>
                              {booking.paymentMethod && (
                                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                  Méthode: {booking.paymentMethod === 'CASH' ? 'Espèces' : 
                                           booking.paymentMethod === 'CARD' ? 'Carte' :
                                           booking.paymentMethod === 'WAFACASH' ? 'Wafacash' : 'Virement bancaire'}
                                </Typography>
                              )}
                            </Box>
                          )}

                          {booking.status === 'AWAITING_PAYMENT' && booking.paymentStatus === 'UNPAID' && (
                            <Alert severity="info" sx={{ borderRadius: 2, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                En attente du paiement du client
                              </Typography>
                              {booking.finalPrice && (
                                <Typography variant="body2" sx={{ color: '#032B5A', mt: 0.5 }}>
                                  Montant à recevoir: <strong>{booking.finalPrice} MAD</strong>
                                </Typography>
                              )}
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
        </Box>
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
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              💰 Montant à payer par le client
            </Typography>
            <Typography variant="body2">
              Entrez le montant total que le client doit payer pour ce service. Une fois confirmé, le client recevra une notification et pourra procéder au paiement.
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="Montant à payer par le client (MAD)"
            type="number"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            required
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
            helperText={
              selectedBooking?.estimatedPrice 
                ? `Prix estimé initial: ${selectedBooking.estimatedPrice} MAD` 
                : 'Entrez le montant total à facturer au client'
            }
            inputProps={{
              min: 0,
              step: 0.01,
            }}
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
            disabled={!finalPrice || parseFloat(finalPrice) <= 0}
            sx={{
              bgcolor: '#4caf50',
              color: 'white',
              '&:hover': { bgcolor: '#388e3c' },
              '&:disabled': { bgcolor: '#cccccc', color: '#666666' },
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
            }}
          >
            ✓ Confirmer le montant et finaliser
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog
        open={quoteDialogOpen}
        onClose={() => {
          setQuoteDialogOpen(false);
          setError('');
        }}
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
          }}
        >
          {selectedBooking?.quote ? 'Modifier le devis' : 'Créer un devis'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              📋 Informations requises pour le devis
            </Typography>
            <Typography variant="body2">
              Remplissez les conditions, la liste d'équipement nécessaire et le prix. Le client recevra ce devis et pourra le télécharger en PDF.
            </Typography>
          </Alert>
          
          <TextField
            fullWidth
            label="Conditions et termes"
            multiline
            rows={4}
            value={quoteConditions}
            onChange={(e) => setQuoteConditions(e.target.value)}
            required
            placeholder="Ex: Intervention garantie 6 mois, paiement à la réception, etc."
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <DescriptionIcon sx={{ color: '#F4C542' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Équipement nécessaire"
            multiline
            rows={4}
            value={quoteEquipment}
            onChange={(e) => setQuoteEquipment(e.target.value)}
            required
            placeholder="Ex: Multimètre, tournevis, câbles électriques, etc."
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <BuildIcon sx={{ color: '#F4C542' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Prix (MAD)"
            type="number"
            value={quotePrice}
            onChange={(e) => setQuotePrice(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon sx={{ color: '#F4C542' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={() => {
              setQuoteDialogOpen(false);
              setError('');
            }}
            disabled={submittingQuote}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmitQuote}
            variant="contained"
            disabled={submittingQuote || !quoteConditions.trim() || !quoteEquipment.trim() || !quotePrice}
            startIcon={submittingQuote ? <CircularProgress size={20} /> : <DescriptionIcon />}
            sx={{
              bgcolor: '#032B5A',
              color: 'white',
              '&:hover': { bgcolor: '#021d3f' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {submittingQuote ? 'Création...' : selectedBooking?.quote ? 'Modifier' : 'Créer le devis'}
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
                  {selectedBooking.estimatedPrice && (
                    <ListItem disableGutters>
                      <AttachMoneyIcon sx={{ mr: 2, color: '#F4C542' }} />
                      <ListItemText
                        primary="Prix estimé"
                        secondary={`${selectedBooking.estimatedPrice} MAD`}
                        primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                      />
                    </ListItem>
                  )}
                  {selectedBooking.finalPrice && (
                    <ListItem disableGutters>
                      <AttachMoneyIcon sx={{ mr: 2, color: '#4caf50', fontSize: 24 }} />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#032B5A' }}>
                              Prix final
                            </Typography>
                            <Chip 
                              label="Défini par vous" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#4caf50', 
                                color: 'white', 
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 600,
                              }} 
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                              {selectedBooking.finalPrice} MAD
                            </Typography>
                            {selectedBooking.estimatedPrice && selectedBooking.finalPrice !== selectedBooking.estimatedPrice && (
                              <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                                Différence: {selectedBooking.finalPrice > selectedBooking.estimatedPrice ? '+' : ''}
                                {selectedBooking.finalPrice - selectedBooking.estimatedPrice} MAD
                                {selectedBooking.finalPrice > selectedBooking.estimatedPrice ? ' (augmentation)' : ' (réduction)'}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    {selectedBooking.description}
                  </Typography>
                </Paper>
                
                {/* Quote Display */}
                {selectedBooking.quote && (
                  <Paper sx={{ p: 3, bgcolor: '#fff9e6', borderRadius: 2, border: '2px solid #F4C542', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                        📋 Devis
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => {
                          if (selectedBooking.quote) {
                            handleDownloadQuotePDF(selectedBooking.quote, selectedBooking);
                          }
                        }}
                        sx={{
                          bgcolor: '#032B5A',
                          color: 'white',
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#021d3f' },
                        }}
                      >
                        Télécharger PDF
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                        Prix: <span style={{ color: '#F4C542', fontSize: '1.2em', fontWeight: 700 }}>{selectedBooking.quote.price} MAD</span>
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                        Conditions:
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#032B5A', whiteSpace: 'pre-wrap' }}>
                        {selectedBooking.quote.conditions}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                        Équipement nécessaire:
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#032B5A', whiteSpace: 'pre-wrap' }}>
                        {selectedBooking.quote.equipment}
                      </Typography>
                    </Box>
                  </Paper>
                )}
                {/* Payment Receipt Display - Show for all payment statuses if receipt exists */}
                {selectedBooking.receiptUrl && (
                  <Box sx={{ mt: 3 }}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: selectedBooking.paymentStatus === 'PENDING' ? '#fffbf0' : '#f8f9fa',
                        borderRadius: 2, 
                        border: selectedBooking.paymentStatus === 'PENDING' ? '2px solid #ff9800' : '1px solid #e0e0e0'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedBooking.paymentStatus === 'PENDING' ? '#f57c00' : '#032B5A', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon sx={{ fontSize: 20 }} />
                        {selectedBooking.paymentStatus === 'PENDING' ? 'Reçu de Paiement Uploadé' : 'Reçu de Paiement'}
                      </Typography>
                      {selectedBooking.paymentStatus === 'PENDING' && (
                        <Typography variant="body2" sx={{ color: '#032B5A', mb: 2 }}>
                          Le client a uploadé un reçu. Veuillez vérifier et confirmer le paiement.
                        </Typography>
                      )}
                      {selectedBooking.paymentStatus === 'PAID' && (
                        <Typography variant="body2" sx={{ color: '#032B5A', mb: 2 }}>
                          Reçu de paiement confirmé.
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {selectedBooking.receiptUrl.endsWith('.pdf') ? (
                          <>
                            <Button
                              variant="outlined"
                              href={selectedBooking.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<PictureAsPdfIcon />}
                              sx={{
                                borderColor: selectedBooking.paymentStatus === 'PENDING' ? '#ff9800' : '#032B5A',
                                color: selectedBooking.paymentStatus === 'PENDING' ? '#f57c00' : '#032B5A',
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: selectedBooking.paymentStatus === 'PENDING' ? '#f57c00' : '#021d3f',
                                  bgcolor: selectedBooking.paymentStatus === 'PENDING' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(3, 43, 90, 0.05)',
                                },
                              }}
                            >
                              Voir le reçu PDF
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => {
                                fetch(selectedBooking.receiptUrl!)
                                  .then(res => res.blob())
                                  .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `receipt-${selectedBooking.id}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  })
                                  .catch(err => {
                                    console.error('Error downloading receipt:', err);
                                    // Fallback: open in new tab
                                    window.open(selectedBooking.receiptUrl, '_blank');
                                  });
                              }}
                              sx={{
                                bgcolor: '#032B5A',
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                  bgcolor: '#021d3f',
                                },
                              }}
                            >
                              Télécharger
                            </Button>
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                overflow: 'hidden',
                                flex: 1,
                                minWidth: 200,
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: '#F4C542',
                                },
                              }}
                              onClick={() => window.open(selectedBooking.receiptUrl, '_blank')}
                            >
                              <img
                                src={selectedBooking.receiptUrl}
                                alt="Payment Receipt"
                                style={{
                                  width: '100%',
                                  maxHeight: '300px',
                                  objectFit: 'contain',
                                  display: 'block',
                                }}
                              />
                            </Box>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => {
                                fetch(selectedBooking.receiptUrl!)
                                  .then(res => res.blob())
                                  .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `receipt-${selectedBooking.id}.${selectedBooking.receiptUrl!.split('.').pop()}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  })
                                  .catch(err => {
                                    console.error('Error downloading receipt:', err);
                                    // Fallback: open in new tab
                                    window.open(selectedBooking.receiptUrl, '_blank');
                                  });
                              }}
                              sx={{
                                bgcolor: '#032B5A',
                                color: 'white',
                                textTransform: 'none',
                                alignSelf: 'flex-start',
                                '&:hover': {
                                  bgcolor: '#021d3f',
                                },
                              }}
                            >
                              Télécharger
                            </Button>
                          </>
                        )}
                      </Box>
                      {selectedBooking.transactionId && (
                        <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                          ID de transaction: {selectedBooking.transactionId}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}
                
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
