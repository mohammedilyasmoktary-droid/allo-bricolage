import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { adminApi, AdminStats } from '../../api/admin';
import { bookingsApi, Booking } from '../../api/bookings';
import { generateBookingPDF, BookingPDFData } from '../../utils/pdfGenerator';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<'UNPAID' | 'PENDING' | 'PAID'>('PAID');
  const [paymentReason, setPaymentReason] = useState('');

  useEffect(() => {
    loadBookings();
    loadStats();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [statusFilter, paymentFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;
      const data = await adminApi.getBookings(params);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handlePaymentStatusChange = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewPaymentStatus(booking.paymentStatus);
    setPaymentReason('');
    setPaymentDialogOpen(true);
  };

  const confirmPaymentStatusUpdate = async () => {
    if (!selectedBooking) {
      return;
    }

    // Only require reason when marking as PAID
    if (newPaymentStatus === 'PAID' && !paymentReason.trim()) {
      return;
    }

    setUpdatingPayment(true);
    try {
      await adminApi.updatePaymentStatus(
        selectedBooking.id,
        newPaymentStatus,
        newPaymentStatus === 'PAID' ? paymentReason : paymentReason || 'Status update'
      );
      await loadBookings();
      await loadStats();
      setPaymentDialogOpen(false);
      setSelectedBooking(null);
      setPaymentReason('');
    } catch (error: any) {
      console.error('Failed to update payment status:', error);
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour du statut de paiement');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    // Load full booking details with reviews
    try {
      const fullBooking = await bookingsApi.getById(booking.id);
      setSelectedBooking(fullBooking);
    } catch (error) {
      console.error('Failed to load full booking details:', error);
    }
    setDetailsOpen(true);
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
      review: selectedBooking.reviews && selectedBooking.reviews.length > 0 ? {
        rating: selectedBooking.reviews[0].rating,
        comment: selectedBooking.reviews[0].comment,
        createdAt: selectedBooking.reviews[0].createdAt,
      } : undefined,
    };
    
    await generateBookingPDF(pdfData);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
      PENDING: 'warning',
      ACCEPTED: 'primary',
      ON_THE_WAY: 'primary',
      IN_PROGRESS: 'primary',
      AWAITING_PAYMENT: 'warning',
      COMPLETED: 'success',
      DECLINED: 'error',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      ACCEPTED: 'Accepté',
      ON_THE_WAY: 'En route',
      IN_PROGRESS: 'En cours',
      AWAITING_PAYMENT: 'En attente de paiement',
      COMPLETED: 'Terminé',
      DECLINED: 'Refusé',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  const getPaymentLabel = (status: string) => {
    const labels: Record<string, string> = {
      UNPAID: 'Non payé',
      PENDING: 'En attente',
      PAID: 'Payé',
    };
    return labels[status] || status;
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;

    const query = searchQuery.toLowerCase();
    return bookings.filter(
      (booking) =>
        booking.client?.name?.toLowerCase().includes(query) ||
        booking.technician?.name?.toLowerCase().includes(query) ||
        booking.category?.name?.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query) ||
        booking.city?.toLowerCase().includes(query)
    );
  }, [bookings, searchQuery]);

  const totalRevenue = useMemo(() => {
    return filteredBookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0);
  }, [filteredBookings]);

  const pendingPayments = useMemo(() => {
    return filteredBookings.filter((b) => b.paymentStatus === 'PENDING').length;
  }, [filteredBookings]);

  if (loading && bookings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
          Gestion des réservations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez et suivez toutes les réservations de la plateforme
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Total réservations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.totalBookings || bookings.length}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Terminées
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.completedBookings || filteredBookings.filter((b) => b.status === 'COMPLETED').length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              background: 'linear-gradient(135deg, #F4C542 0%, #e0b038 100%)',
              color: '#032B5A',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5, fontWeight: 600 }}>
                    Paiements en attente
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {pendingPayments}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Revenus totaux
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalRevenue.toFixed(0)} MAD
                  </Typography>
                </Box>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par client, technicien, catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#F4C542' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon />
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrer par statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrer par statut"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="ACCEPTED">Accepté</MenuItem>
                  <MenuItem value="ON_THE_WAY">En route</MenuItem>
                  <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                  <MenuItem value="AWAITING_PAYMENT">En attente de paiement</MenuItem>
                  <MenuItem value="COMPLETED">Terminé</MenuItem>
                  <MenuItem value="DECLINED">Refusé</MenuItem>
                  <MenuItem value="CANCELLED">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrer par paiement</InputLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  label="Filtrer par paiement"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tous les paiements</MenuItem>
                  <MenuItem value="UNPAID">Non payé</MenuItem>
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="PAID">Payé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <Card sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
              {searchQuery ? 'Aucune réservation trouvée' : 'Aucune réservation'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les réservations apparaîtront ici une fois créées'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Technicien</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Prix</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Paiement</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#032B5A', textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    sx={{
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setDetailsOpen(true);
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#666' }}>
                        {booking.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#032B5A',
                            fontSize: '0.875rem',
                          }}
                        >
                          {booking.client?.name?.charAt(0).toUpperCase() || 'C'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {booking.client?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {booking.technician ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#F4C542',
                              color: '#032B5A',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {booking.technician.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {booking.technician.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.category?.name || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: '#f5f5f5',
                          color: '#032B5A',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(booking.createdAt), 'dd/MM/yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(booking.createdAt), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: booking.finalPrice || booking.estimatedPrice ? '#032B5A' : 'text.secondary',
                        }}
                      >
                        {booking.finalPrice || booking.estimatedPrice
                          ? `${booking.finalPrice || booking.estimatedPrice} MAD`
                          : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentLabel(booking.paymentStatus)}
                        color={
                          booking.paymentStatus === 'PAID'
                            ? 'success'
                            : booking.paymentStatus === 'PENDING'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Voir les détails">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(booking)}
                            sx={{
                              color: '#032B5A',
                              '&:hover': { bgcolor: '#f5f5f5' },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={booking.paymentStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value as 'UNPAID' | 'PENDING' | 'PAID';
                              handlePaymentStatusChange({ ...booking, paymentStatus: newStatus });
                            }}
                            sx={{ borderRadius: 1 }}
                          >
                            <MenuItem value="UNPAID">Non payé</MenuItem>
                            <MenuItem value="PENDING">En attente</MenuItem>
                            <MenuItem value="PAID">Payé</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedBooking(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#032B5A',
            color: 'white',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon />
            <Typography variant="h6">Détails de la réservation</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {selectedBooking && (
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
            <IconButton
              onClick={() => {
                setDetailsOpen(false);
                setSelectedBooking(null);
              }}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedBooking && (
            <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Client
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                  {selectedBooking.client?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {selectedBooking.client?.email || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {selectedBooking.client?.phone || ''}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BuildIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Technicien
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                  {selectedBooking.technician?.name || 'Non assigné'}
                </Typography>
                {selectedBooking.technician?.email && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {selectedBooking.technician.email}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CategoryIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Catégorie
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                  {selectedBooking.category?.name || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Date de création
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, ml: 4 }}>
                  {format(new Date(selectedBooking.createdAt), 'dd MMMM yyyy à HH:mm')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Adresse
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, ml: 4 }}>
                  {selectedBooking.address}, {selectedBooking.city}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Prix
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#F4C542', ml: 4 }}>
                  {selectedBooking.finalPrice || selectedBooking.estimatedPrice || 'N/A'} MAD
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DescriptionIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                    Description
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    ml: 4,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#032B5A', lineHeight: 1.8 }}>
                    {selectedBooking.description}
                  </Typography>
                </Paper>
              </Grid>

              {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhotoLibraryIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase' }}>
                      Photos ({selectedBooking.photos.length})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 4 }}>
                    {selectedBooking.photos.map((photo, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        sx={{
                          width: 100,
                          height: 100,
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
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Statut: ${getStatusLabel(selectedBooking.status)}`}
                    color={getStatusColor(selectedBooking.status)}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={`Paiement: ${getPaymentLabel(selectedBooking.paymentStatus)}`}
                    color={
                      selectedBooking.paymentStatus === 'PAID'
                        ? 'success'
                        : selectedBooking.paymentStatus === 'PENDING'
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ fontWeight: 600 }}
                  />
                  {selectedBooking.paymentMethod && (
                    <Chip
                      label={`Méthode: ${selectedBooking.paymentMethod}`}
                      sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Payment Receipt Display */}
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
                      Le client a uploadé un reçu. En attente de confirmation par le technicien.
                    </Typography>
                  )}
                  {selectedBooking.paymentStatus === 'PAID' && (
                    <Typography variant="body2" sx={{ color: '#032B5A', mb: 2 }}>
                      Reçu de paiement confirmé.
                    </Typography>
                  )}
                  {selectedBooking.receiptUrl.endsWith('.pdf') ? (
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
                  ) : (
                    <Box
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mt: 1,
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
                  )}
                  {selectedBooking.transactionId && (
                    <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                      ID de transaction: {selectedBooking.transactionId}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={() => {
              setDetailsOpen(false);
              setSelectedBooking(null);
            }}
            sx={{
              textTransform: 'none',
              color: '#666',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setSelectedBooking(null);
          setPaymentReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#032B5A',
            color: 'white',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PaymentIcon />
          Modifier le statut de paiement
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedBooking && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  ⚠️ Attention: Modification du statut de paiement
                </Typography>
                <Typography variant="body2">
                  Cette action modifie le statut de paiement de la réservation. Veuillez fournir une raison pour
                  cette modification.
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                  Réservation
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Client: {selectedBooking.client?.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Catégorie: {selectedBooking.category?.name}
                </Typography>
                <Typography variant="body1">
                  Prix: {selectedBooking.finalPrice || selectedBooking.estimatedPrice || 'N/A'} MAD
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Nouveau statut de paiement</InputLabel>
                <Select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as 'UNPAID' | 'PENDING' | 'PAID')}
                  label="Nouveau statut de paiement"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="UNPAID">Non payé</MenuItem>
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="PAID">Payé</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={newPaymentStatus === 'PAID' ? 'Raison de la modification *' : 'Raison de la modification (optionnel)'}
                value={paymentReason}
                onChange={(e) => setPaymentReason(e.target.value)}
                multiline
                rows={3}
                required={newPaymentStatus === 'PAID'}
                placeholder="Expliquez pourquoi vous modifiez le statut de paiement..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              {newPaymentStatus === 'PAID' && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Une raison est requise pour marquer le paiement comme payé. Cela garantit une vérification appropriée.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={() => {
              setPaymentDialogOpen(false);
              setSelectedBooking(null);
              setPaymentReason('');
            }}
            disabled={updatingPayment}
            sx={{
              textTransform: 'none',
              color: '#666',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmPaymentStatusUpdate}
            disabled={(newPaymentStatus === 'PAID' && !paymentReason.trim()) || updatingPayment}
            variant="contained"
            sx={{
              bgcolor: '#032B5A',
              '&:hover': { bgcolor: '#021d3f' },
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {updatingPayment ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Mise à jour...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookings;
