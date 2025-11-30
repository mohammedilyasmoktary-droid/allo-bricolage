import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Switch, FormControlLabel, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { techniciansApi } from '../../api/technicians';
import { bookingsApi, Booking } from '../../api/bookings';
import { subscriptionsApi } from '../../api/subscriptions';

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (user?.technicianProfile) {
        setIsOnline(user.technicianProfile.isOnline);
      }

      const [bookings, subscription] = await Promise.all([
        bookingsApi.getMyBookings(),
        subscriptionsApi.getStatus().catch(() => null), // Don't fail if subscription check fails
      ]);

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const today = bookings.filter((b) => {
        if (!b.scheduledDateTime) return false;
        const bookingDate = new Date(b.scheduledDateTime);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === todayDate.getTime();
      });

      const pending = bookings.filter((b) => b.status === 'PENDING');

      setTodayBookings(today);
      setPendingRequests(pending);
      setSubscriptionStatus(subscription);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#032B5A' }}>
          Tableau de bord
        </Typography>
        <FormControlLabel
          control={<Switch checked={isOnline} onChange={handleToggleOnline} />}
          label={isOnline ? 'En ligne' : 'Hors ligne'}
        />
      </Box>

      {/* Subscription Warning */}
      {subscriptionStatus && !subscriptionStatus.canAcceptJobs && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/technician/subscription')}
              sx={{ textTransform: 'none' }}
            >
              Renouveler
            </Button>
          }
        >
          Votre abonnement a expiré. Renouvelez pour continuer à recevoir des missions.
        </Alert>
      )}

      {subscriptionStatus && subscriptionStatus.subscription && subscriptionStatus.daysRemaining <= 7 && subscriptionStatus.daysRemaining > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Votre abonnement expire dans {subscriptionStatus.daysRemaining} jour(s).{' '}
          <Button
            size="small"
            onClick={() => navigate('/technician/subscription')}
            sx={{ textTransform: 'none', ml: 1 }}
          >
            Renouveler maintenant
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#032B5A', fontWeight: 500 }}>
                Demandes en attente
              </Typography>
              <Typography variant="h3" sx={{ color: '#F4C542', fontWeight: 600 }}>
                {pendingRequests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#032B5A', fontWeight: 500 }}>
                Travaux aujourd'hui
              </Typography>
              <Typography variant="h3" sx={{ color: '#F4C542', fontWeight: 600 }}>
                {todayBookings.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#032B5A', fontWeight: 500 }}>
                Statut de vérification
              </Typography>
              <Chip
                label={user?.technicianProfile?.verificationStatus || 'PENDING'}
                color={
                  user?.technicianProfile?.verificationStatus === 'APPROVED'
                    ? 'success'
                    : user?.technicianProfile?.verificationStatus === 'REJECTED'
                    ? 'error'
                    : 'warning'
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TechnicianDashboard;

