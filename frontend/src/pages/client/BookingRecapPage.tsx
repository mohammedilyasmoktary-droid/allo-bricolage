import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Paper,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi, Booking } from '../../api/bookings';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MessageIcon from '@mui/icons-material/Message';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { bgcolor: '#ff9800', color: 'white' };
    case 'ACCEPTED':
      return { bgcolor: '#4caf50', color: 'white' };
    case 'IN_PROGRESS':
      return { bgcolor: '#2196f3', color: 'white' };
    case 'COMPLETED':
      return { bgcolor: '#4caf50', color: 'white' };
    case 'CANCELLED':
      return { bgcolor: '#f44336', color: 'white' };
    default:
      return { bgcolor: '#9e9e9e', color: 'white' };
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
    AWAITING_PAYMENT: 'En attente de paiement',
  };
  return labels[status] || status;
};

const BookingRecapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('ID de réservation manquant');
      setLoading(false);
      return;
    }
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const data = await bookingsApi.getById(bookingId!);
      setBooking(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec du chargement de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    // Navigate to payment page after confirmation
    navigate(`/payment/${bookingId}`);
  };

  const handleEdit = () => {
    // Navigate back to edit booking
    navigate(`/client/bookings/create?bookingId=${bookingId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#F4C542' }} />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: { xs: 2, md: 0 } }}>
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          {error || 'Réservation non trouvée'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/client/bookings')}
          sx={{
            bgcolor: '#032B5A',
            '&:hover': { bgcolor: '#021d3f' },
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Retour aux réservations
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/client/bookings')}
          sx={{
            bgcolor: '#f5f5f5',
            '&:hover': { bgcolor: '#e0e0e0' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A' }}>
          Récapitulatif de votre réservation
        </Typography>
      </Box>

      {/* Info Alert */}
      {booking.status === 'PENDING' && (
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: '#fff3e0',
            border: '1px solid #ff9800',
            '& .MuiAlert-icon': {
              color: '#ff9800',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A' }}>
            Votre réservation est en attente d'acceptation par le technicien. Vous recevrez une notification une fois qu'elle sera acceptée.
          </Typography>
        </Alert>
      )}
      {booking.status === 'AWAITING_PAYMENT' && (
        <Alert
          severity="success"
          icon={<InfoIcon />}
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: '#e8f5e9',
            border: '1px solid #4caf50',
            '& .MuiAlert-icon': {
              color: '#4caf50',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A' }}>
            Le service a été complété. Veuillez procéder au paiement.
          </Typography>
        </Alert>
      )}
      {booking.status === 'ACCEPTED' && (
        <Alert
          severity="success"
          icon={<InfoIcon />}
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: '#e8f5e9',
            border: '1px solid #4caf50',
            '& .MuiAlert-icon': {
              color: '#4caf50',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A' }}>
            Votre réservation a été acceptée par le technicien. Le technicien vous contactera bientôt.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Panel - Details */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header with Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  Détails de la réservation
                </Typography>
                <Chip
                  label={getStatusLabel(booking.status)}
                  sx={{
                    ...getStatusColor(booking.status),
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    px: 1,
                    py: 0.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

              {/* Service */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BuildIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Service
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', ml: 4 }}>
                  {booking.category?.name || 'N/A'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#f0f0f0' }} />

              {/* Technician */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Technicien
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 4 }}>
                  {booking.technicianProfile?.profilePictureUrl && (
                    <Avatar
                      src={booking.technicianProfile.profilePictureUrl}
                      sx={{ width: 40, height: 40, border: '2px solid #F4C542' }}
                    >
                      {booking.technician?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A' }}>
                    {booking.technician?.name || 'À assigner'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#f0f0f0' }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DescriptionIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Description
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    ml: 4,
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#032B5A', lineHeight: 1.8 }}>
                    {booking.description}
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#f0f0f0' }} />

              {/* Address */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Adresse
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A', ml: 4 }}>
                  {booking.address}, {booking.city}
                </Typography>
              </Box>

              {/* Scheduled Date */}
              {booking.scheduledDateTime && (
                <>
                  <Divider sx={{ my: 2, borderColor: '#f0f0f0' }} />
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarTodayIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Date et heure prévues
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A', ml: 4 }}>
                      {format(new Date(booking.scheduledDateTime), 'PPpp')}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Photos */}
              {booking.photos && booking.photos.length > 0 && (
                <>
                  <Divider sx={{ my: 3, borderColor: '#f0f0f0' }} />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PhotoLibraryIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Photos jointes ({booking.photos.length})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', ml: 4 }}>
                      {booking.photos.map((photo, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          sx={{
                            width: { xs: '100%', sm: 140 },
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: '2px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              borderColor: '#F4C542',
                              boxShadow: '0 4px 12px rgba(244, 197, 66, 0.3)',
                            },
                          }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Summary */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              position: { md: 'sticky' },
              top: { md: 100 },
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 3 }}>
                Résumé
              </Typography>

              <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />

              {/* Service Summary */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Service
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {booking.category?.name || 'N/A'}
                </Typography>
              </Box>

              {/* Technician Summary */}
              {booking.technician && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Technicien
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                    {booking.technician.name}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 24 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {booking.status === 'AWAITING_PAYMENT' && booking.finalPrice ? 'Montant à payer' : 'Prix estimé'}
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: (booking.finalPrice || booking.estimatedPrice) ? '#F4C542' : '#9e9e9e',
                    ml: 4,
                  }}
                >
                  {booking.status === 'AWAITING_PAYMENT' && booking.finalPrice
                    ? `${booking.finalPrice} MAD`
                    : booking.estimatedPrice
                    ? `${booking.estimatedPrice} MAD`
                    : 'À déterminer'}
                </Typography>
                {booking.status === 'AWAITING_PAYMENT' && booking.finalPrice && booking.estimatedPrice && booking.finalPrice !== booking.estimatedPrice && (
                  <Typography variant="caption" sx={{ color: '#666', ml: 4, display: 'block', mt: 0.5 }}>
                    Prix estimé: {booking.estimatedPrice} MAD
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

              {/* Status Steps */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                  Statut de la réservation
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#032B5A', fontWeight: 500 }}>
                      Réservation confirmée
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED'].includes(booking.status) ? (
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    ) : (
                      <CircularProgress size={20} sx={{ color: '#ff9800' }} />
                    )}
                    <Typography variant="body2" sx={{ color: '#032B5A', fontWeight: 500 }}>
                      {['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED'].includes(booking.status)
                        ? 'Acceptée par le technicien'
                        : 'En attente d\'acceptation par le technicien'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {booking.status === 'AWAITING_PAYMENT' || booking.status === 'COMPLETED' ? (
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    ) : booking.status === 'PENDING' || booking.status === 'ACCEPTED' || booking.status === 'ON_THE_WAY' || booking.status === 'IN_PROGRESS' ? (
                      <CircularProgress size={20} sx={{ color: '#ff9800' }} />
                    ) : null}
                    <Typography variant="body2" sx={{ color: '#032B5A', fontWeight: 500 }}>
                      {booking.status === 'AWAITING_PAYMENT' || booking.status === 'COMPLETED'
                        ? 'Service complété - Paiement requis'
                        : 'Service en cours'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Show payment button only when status is AWAITING_PAYMENT */}
                {booking.status === 'AWAITING_PAYMENT' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PaymentIcon />}
                    onClick={handleConfirm}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      '&:hover': { bgcolor: '#e0b038' },
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: 2,
                    }}
                  >
                    Procéder au paiement
                  </Button>
                )}

                {/* Show edit button only for PENDING status */}
                {booking.status === 'PENDING' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
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
                    Modifier la réservation
                  </Button>
                )}

                {/* Show message button when technician is assigned */}
                {booking.status !== 'PENDING' && booking.technicianId && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    onClick={() => navigate(`/messages?bookingId=${booking.id}`)}
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
                    Contacter le technicien
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingRecapPage;
