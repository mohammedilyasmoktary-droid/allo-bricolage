import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Badge,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, Booking } from '../../api/bookings';
import { subscriptionsApi } from '../../api/subscriptions';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
import FlashOnIcon from '@mui/icons-material/FlashOn';

const TechnicianRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const bookings = await bookingsApi.getMyBookings();
      setRequests(bookings);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: Booking) => {
    try {
      await bookingsApi.accept(request.id);
      loadRequests();
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      if (error.response?.data?.error === 'SUBSCRIPTION_REQUIRED' || error.response?.data?.error === 'SUBSCRIPTION_EXPIRED' || error.response?.data?.error === 'TRIAL_LIMIT_REACHED') {
        setSubscriptionError(error.response.data.message || 'Votre abonnement a expiré. Renouvelez pour continuer à recevoir des missions.');
        setSubscriptionDialogOpen(true);
      }
    }
  };

  const handleDecline = async (request: Booking) => {
    if (!window.confirm('Êtes-vous sûr de vouloir refuser cette demande?')) return;
    try {
      await bookingsApi.decline(request.id);
      loadRequests();
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      if (status === 'COMPLETED') {
        setSelectedRequest(requests.find(r => r.id === requestId) || null);
        setFinalPrice('');
        setDialogOpen(true);
      } else {
        await bookingsApi.updateStatus(requestId, { status });
        loadRequests();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const submitComplete = async () => {
    if (!selectedRequest) return;
    try {
      await bookingsApi.updateStatus(selectedRequest.id, {
        status: 'COMPLETED',
        finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
      });
      setDialogOpen(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      console.error('Failed to complete booking:', error);
    }
  };

  const handleViewDetails = (request: Booking) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
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

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return <PaymentIcon sx={{ fontSize: 18 }} />;
      case 'ACCEPTED':
        return <CheckCircleIcon sx={{ fontSize: 18 }} />;
      case 'ON_THE_WAY':
        return <DirectionsCarIcon sx={{ fontSize: 18 }} />;
      case 'IN_PROGRESS':
        return <BuildIcon sx={{ fontSize: 18 }} />;
      case 'COMPLETED':
        return <CheckCircleIcon sx={{ fontSize: 18 }} />;
      default:
        return <PaymentIcon sx={{ fontSize: 18 }} />;
    }
  };

  // Filter and categorize requests
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.category?.name?.toLowerCase().includes(query) ||
          r.client?.name?.toLowerCase().includes(query) ||
          r.address?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
      );
    }

    // Status filter based on tab
    const statusMap = [
      ['PENDING'], // New requests
      ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'], // Active
      ['COMPLETED', 'AWAITING_PAYMENT'], // Completed
    ];
    const allowedStatuses = statusMap[tabValue] || [];
    if (allowedStatuses.length > 0) {
      filtered = filtered.filter((r) => allowedStatuses.includes(r.status));
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [requests, tabValue, searchQuery]);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const activeCount = requests.filter((r) => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(r.status)).length;
  const completedCount = requests.filter((r) => ['COMPLETED', 'AWAITING_PAYMENT'].includes(r.status)).length;

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
          Mes demandes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos demandes de service et suivez vos interventions
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
                onChange={(_, newValue) => setTabValue(newValue)}
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
                    <Badge badgeContent={pendingCount} color="error">
                      Nouvelles
                    </Badge>
                  }
                />
                <Tab
                  label={
                    <Badge badgeContent={activeCount} color="primary">
                      En cours
                    </Badge>
                  }
                />
                <Tab
                  label={
                    <Badge badgeContent={completedCount} color="success">
                      Terminées
                    </Badge>
                  }
                />
              </Tabs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                {searchQuery
                  ? 'Aucune demande trouvée'
                  : tabValue === 0
                  ? 'Aucune nouvelle demande'
                  : tabValue === 1
                  ? 'Aucune demande en cours'
                  : 'Aucune demande terminée'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les nouvelles demandes apparaîtront ici'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.map((request) => {
            const statusColor = getStatusColor(request.status);
            const isUrgent = request.estimatedPrice && request.technicianProfile?.basePrice && 
                            request.estimatedPrice === (request.technicianProfile.basePrice || 0) + 100;

            return (
              <Grid item xs={12} key={request.id}>
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
                              {request.category?.name || 'Service'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Demande #{request.id.slice(0, 8).toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          icon={getStatusIcon(request.status)}
                          label={getStatusLabel(request.status)}
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
                            icon={<FlashOnIcon />}
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
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', ml: 4 }}>
                              {request.client?.name || 'Client'}
                            </Typography>
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
                              {request.address}, {request.city}
                            </Typography>
                          </Grid>

                          {/* Date */}
                          {request.scheduledDateTime && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CalendarTodayIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Date prévue
                                </Typography>
                              </Box>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A', ml: 4 }}>
                                {format(new Date(request.scheduledDateTime), 'PPp')}
                              </Typography>
                            </Grid>
                          )}

                          {/* Price */}
                          {(request.estimatedPrice || request.finalPrice) && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  Prix
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#F4C542', ml: 4 }}>
                                {request.finalPrice || request.estimatedPrice} MAD
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
                                {request.description}
                              </Typography>
                            </Paper>
                          </Grid>

                          {/* Photos */}
                          {request.photos && request.photos.length > 0 && (
                            <Grid item xs={12}>
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <PhotoLibraryIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                    Photos ({request.photos.length}):
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 4 }}>
                                  {request.photos.slice(0, 4).map((photo, index) => (
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
                                  {request.photos.length > 4 && (
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
                                      onClick={() => handleViewDetails(request)}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#032B5A' }}>
                                        +{request.photos.length - 4}
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

                          {request.status === 'PENDING' && (
                            <>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleAccept(request)}
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
                                Accepter
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => handleDecline(request)}
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
                                Refuser
                              </Button>
                            </>
                          )}

                          {request.status === 'ACCEPTED' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<DirectionsCarIcon />}
                              onClick={() => handleStatusUpdate(request.id, 'ON_THE_WAY')}
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

                          {request.status === 'ON_THE_WAY' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<BuildIcon />}
                              onClick={() => handleStatusUpdate(request.id, 'IN_PROGRESS')}
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

                          {request.status === 'IN_PROGRESS' && (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleStatusUpdate(request.id, 'COMPLETED')}
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

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(request)}
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
                              {format(new Date(request.createdAt), 'PPp')}
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
            helperText={selectedRequest?.estimatedPrice ? `Prix estimé: ${selectedRequest.estimatedPrice} MAD` : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
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
            onClick={submitComplete}
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
            Terminer
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
          Détails de la demande
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem disableGutters>
                    <PersonIcon sx={{ mr: 2, color: '#F4C542' }} />
                    <ListItemText
                      primary="Client"
                      secondary={selectedRequest.client?.name || 'N/A'}
                      primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <BuildIcon sx={{ mr: 2, color: '#F4C542' }} />
                    <ListItemText
                      primary="Service"
                      secondary={selectedRequest.category?.name || 'N/A'}
                      primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <LocationOnIcon sx={{ mr: 2, color: '#F4C542' }} />
                    <ListItemText
                      primary="Adresse"
                      secondary={`${selectedRequest.address}, ${selectedRequest.city}`}
                      primaryTypographyProps={{ fontWeight: 600, color: '#032B5A' }}
                    />
                  </ListItem>
                  {selectedRequest.scheduledDateTime && (
                    <ListItem disableGutters>
                      <CalendarTodayIcon sx={{ mr: 2, color: '#F4C542' }} />
                      <ListItemText
                        primary="Date prévue"
                        secondary={format(new Date(selectedRequest.scheduledDateTime), 'PPp')}
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
                    {selectedRequest.description}
                  </Typography>
                </Paper>
                {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                      Photos ({selectedRequest.photos.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedRequest.photos.map((photo, index) => (
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
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => setDetailDialogOpen(false)}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
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
          Abonnement Requis
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {subscriptionError || 'Votre abonnement a expiré. Renouvelez pour continuer à recevoir des missions.'}
          </Alert>
          <Typography variant="body1" sx={{ color: '#032B5A' }}>
            Pour continuer à accepter des missions, veuillez renouveler votre abonnement.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => setSubscriptionDialogOpen(false)}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              setSubscriptionDialogOpen(false);
              navigate('/technician/subscription');
            }}
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
            Aller à l'abonnement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicianRequests;
