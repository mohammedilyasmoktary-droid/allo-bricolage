import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Divider,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { subscriptionsApi, SubscriptionStatus, Subscription } from '../../api/subscriptions';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoIcon from '@mui/icons-material/Info';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusData, historyData] = await Promise.all([
        subscriptionsApi.getStatus(),
        subscriptionsApi.getHistory(),
      ]);
      setStatus(statusData);
      setHistory(historyData);
    } catch (err: any) {
      console.error('Failed to load subscription data:', err);
      setError(err.response?.data?.error || 'Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: 'BASIC' | 'PREMIUM') => {
    navigate(`/technician/subscription/payment?plan=${plan}`);
  };

  const handleCancelSubscription = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await subscriptionsApi.cancel();
      setSuccess('Abonnement annulé avec succès');
      setCancelDialogOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.response?.data?.error || 'Échec de l\'annulation');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlanPrice = (plan: string): number => {
    return plan === 'BASIC' ? 99 : plan === 'PREMIUM' ? 199 : 0;
  };

  const getPlanBenefits = (plan: string) => {
    switch (plan) {
      case 'FREE_TRIAL':
        return [
          { icon: <AccessTimeIcon />, text: '7 jours d\'essai gratuit' },
          { icon: <InfoIcon />, text: 'Maximum 3 demandes de service' },
          { icon: <CancelIcon />, text: 'Pas de priorité dans les résultats' },
        ];
      case 'BASIC':
        return [
          { icon: <CheckCircleIcon />, text: 'Demandes illimitées' },
          { icon: <CheckCircleIcon />, text: 'Visibilité normale' },
          { icon: <CheckCircleIcon />, text: 'Support standard' },
        ];
      case 'PREMIUM':
        return [
          { icon: <StarIcon />, text: 'Demandes illimitées' },
          { icon: <TrendingUpIcon />, text: 'Priorité dans les résultats de recherche' },
          { icon: <TrendingUpIcon />, text: 'Accès aux statistiques et analyses' },
          { icon: <StarIcon />, text: 'Support client prioritaire' },
          { icon: <StarIcon />, text: 'Badge "Technicien Premium" visible' },
        ];
      default:
        return [];
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE_TRIAL':
        return { primary: '#9e9e9e', secondary: '#f5f5f5' };
      case 'BASIC':
        return { primary: '#2196f3', secondary: '#e3f2fd' };
      case 'PREMIUM':
        return { primary: '#F4C542', secondary: '#fffbf0' };
      default:
        return { primary: '#032B5A', secondary: '#f5f5f5' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  const currentPlan = status?.subscription?.plan || 'FREE_TRIAL';
  const isActive = status?.isActive || false;
  const daysRemaining = status?.daysRemaining || 0;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#032B5A' }}>
          Mon Abonnement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez votre abonnement et accédez à plus de missions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Current Subscription Status */}
      <Card
        sx={{
          mb: 4,
          boxShadow: 4,
          borderRadius: 3,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          background: isActive
            ? 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)'
            : 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    bgcolor: getPlanColor(currentPlan).secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `3px solid ${getPlanColor(currentPlan).primary}`,
                  }}
                >
                  <StarIcon sx={{ fontSize: 36, color: getPlanColor(currentPlan).primary }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                    Plan Actuel
                  </Typography>
                  <Chip
                    label={
                      currentPlan === 'FREE_TRIAL'
                        ? 'Essai Gratuit'
                        : currentPlan === 'BASIC'
                        ? 'Basique'
                        : 'Premium'
                    }
                    sx={{
                      bgcolor: getPlanColor(currentPlan).primary,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      px: 2,
                      py: 0.5,
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {isActive ? (
                  <>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      Actif - Vous pouvez accepter des missions
                    </Typography>
                  </>
                ) : (
                  <>
                    <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#f44336' }}>
                      Expiré - Renouvelez pour continuer
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            {status?.subscription && (
              <Box
                sx={{
                  textAlign: 'right',
                  p: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 3,
                  border: '2px solid #e0e0e0',
                  minWidth: 150,
                }}
              >
                <Typography variant="h3" sx={{ color: daysRemaining > 7 ? '#032B5A' : '#F4C542', fontWeight: 700, mb: 0.5 }}>
                  {daysRemaining}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  jours restants
                </Typography>
                {daysRemaining <= 7 && daysRemaining > 0 && (
                  <Alert severity="warning" sx={{ mt: 2, fontSize: '0.75rem', py: 0.5 }}>
                    Expire bientôt!
                  </Alert>
                )}
              </Box>
            )}
          </Box>

          {status?.subscription && (
            <>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Date de début
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', mt: 0.5 }}>
                      {format(new Date(status.subscription.startDate), 'dd MMM yyyy')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Date d'expiration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', mt: 0.5 }}>
                      {format(new Date(status.subscription.endDate), 'dd MMM yyyy')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Renouvellement auto
                    </Typography>
                    <Switch checked={status.subscription.autoRenew} disabled size="small" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {status.subscription.status === 'ACTIVE' && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setCancelDialogOpen(true)}
                        disabled={submitting}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Annuler l'abonnement
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card sx={{ mb: 4, boxShadow: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
              Plans Disponibles
            </Typography>
            {!isActive && (
              <Alert severity="info" sx={{ borderRadius: 2, py: 0.5 }}>
                Choisissez un plan pour continuer à recevoir des missions
              </Alert>
            )}
          </Box>
          <Grid container spacing={3}>
            {['FREE_TRIAL', 'BASIC', 'PREMIUM'].map((plan) => {
              const planColor = getPlanColor(plan);
              const isCurrentPlan = currentPlan === plan;
              const isPaidPlan = plan !== 'FREE_TRIAL';

              return (
                <Grid item xs={12} md={4} key={plan}>
                  <Card
                    sx={{
                      height: '100%',
                      border: isCurrentPlan ? `3px solid ${planColor.primary}` : '2px solid #e0e0e0',
                      borderRadius: 3,
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                        borderColor: planColor.primary,
                      },
                      ...(plan === 'PREMIUM' && {
                        border: `3px solid ${planColor.primary}`,
                        boxShadow: `0 4px 20px rgba(244, 197, 66, 0.3)`,
                      }),
                    }}
                  >
                    {plan === 'PREMIUM' && (
                      <Chip
                        label="Populaire"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          bgcolor: '#F4C542',
                          color: '#032B5A',
                          fontWeight: 700,
                          zIndex: 1,
                        }}
                      />
                    )}
                    {isCurrentPlan && (
                      <Chip
                        label="Plan actuel"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          bgcolor: '#4caf50',
                          color: 'white',
                          fontWeight: 700,
                          zIndex: 1,
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 4, pt: isCurrentPlan || plan === 'PREMIUM' ? 6 : 4 }}>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                          {plan === 'FREE_TRIAL' ? 'Essai Gratuit' : plan === 'BASIC' ? 'Basique' : 'Premium'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="h3" sx={{ color: planColor.primary, fontWeight: 700 }}>
                            {getPlanPrice(plan) === 0 ? '0' : getPlanPrice(plan)}
                          </Typography>
                          {isPaidPlan && (
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                              MAD
                            </Typography>
                          )}
                          {isPaidPlan && (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              /mois
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      <Box sx={{ mb: 3 }}>
                        {getPlanBenefits(plan).map((benefit, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 2,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: '#f8f9fa',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: planColor.secondary,
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <Box sx={{ color: planColor.primary }}>{benefit.icon}</Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#032B5A', flexGrow: 1 }}>
                              {benefit.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {isPaidPlan && (
                        <Button
                          fullWidth
                          variant={plan === 'PREMIUM' ? 'contained' : 'outlined'}
                          onClick={() => handleSelectPlan(plan as 'BASIC' | 'PREMIUM')}
                          disabled={isCurrentPlan && isActive}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            bgcolor: plan === 'PREMIUM' ? '#F4C542' : 'transparent',
                            color: plan === 'PREMIUM' ? '#032B5A' : '#032B5A',
                            borderColor: '#032B5A',
                            '&:hover': {
                              bgcolor: plan === 'PREMIUM' ? '#e0b038' : 'rgba(3, 43, 90, 0.05)',
                              borderColor: '#021d3f',
                            },
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            boxShadow: plan === 'PREMIUM' ? 3 : 0,
                          }}
                        >
                          {isCurrentPlan && isActive ? 'Plan actuel' : 'Choisir ce plan'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Payment History */}
      {history.length > 0 && (
        <Card sx={{ boxShadow: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 3 }}>
              Historique des Paiements
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Méthode</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#032B5A' }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((sub) =>
                    sub.payments?.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>{format(new Date(payment.createdAt), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <Chip
                            label={sub.plan}
                            size="small"
                            sx={{
                              bgcolor: getPlanColor(sub.plan).secondary,
                              color: getPlanColor(sub.plan).primary,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#032B5A' }}>{payment.amount} MAD</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {payment.paymentMethod === 'CARD' && <CreditCardIcon sx={{ fontSize: 18, color: '#032B5A' }} />}
                            {payment.paymentMethod === 'WAFACASH' && <PaymentIcon sx={{ fontSize: 18, color: '#032B5A' }} />}
                            {payment.paymentMethod === 'BANK_TRANSFER' && (
                              <AccountBalanceIcon sx={{ fontSize: 18, color: '#032B5A' }} />
                            )}
                            <Typography variant="body2">
                              {payment.paymentMethod === 'CARD'
                                ? 'Carte bancaire'
                                : payment.paymentMethod === 'WAFACASH'
                                ? 'Wafacash'
                                : 'Virement bancaire'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.paymentStatus === 'PAID' ? 'Payé' : 'En attente'}
                            color={payment.paymentStatus === 'PAID' ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Annuler l'abonnement
          <IconButton onClick={() => setCancelDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Êtes-vous sûr de vouloir annuler votre abonnement ?
          </Alert>
          <Typography variant="body1" sx={{ color: '#032B5A', mb: 2 }}>
            Après l'annulation :
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: '#032B5A' }}>
            <li>Vous perdrez l'accès aux missions après la fin de la période actuelle</li>
            <li>Votre profil ne sera plus prioritaire dans les résultats de recherche</li>
            <li>Vous pourrez réactiver votre abonnement à tout moment</li>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            sx={{
              textTransform: 'none',
              color: '#032B5A',
            }}
          >
            Garder l'abonnement
          </Button>
          <Button
            onClick={handleCancelSubscription}
            variant="contained"
            disabled={submitting}
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
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmer l\'annulation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPage;
