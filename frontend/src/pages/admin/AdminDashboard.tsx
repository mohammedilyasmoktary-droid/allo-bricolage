import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Collapse,
} from '@mui/material';
import { adminApi } from '../../api/admin';
import { bookingsApi } from '../../api/bookings';
import { techniciansApi } from '../../api/technicians';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import StarIcon from '@mui/icons-material/Star';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalSpent: number;
  averageBookingValue: number;
}

interface TechnicianStats {
  totalTechnicians: number;
  approvedTechnicians: number;
  pendingTechnicians: number;
  onlineTechnicians: number;
  totalJobsCompleted: number;
  totalRevenue: number;
  averageRating: number;
  averageJobsPerTechnician: number;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordersPanelOpen, setOrdersPanelOpen] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0,
    averageBookingValue: 0,
  });
  const [technicianStats, setTechnicianStats] = useState<TechnicianStats>({
    totalTechnicians: 0,
    approvedTechnicians: 0,
    pendingTechnicians: 0,
    onlineTechnicians: 0,
    totalJobsCompleted: 0,
    totalRevenue: 0,
    averageRating: 0,
    averageJobsPerTechnician: 0,
  });
  const [overallStats, setOverallStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    platformGrowth: 0,
  });
  const [availableTechnicians, setAvailableTechnicians] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load bookings for orders panel
      const bookingsData = await adminApi.getBookings();
      setBookings(bookingsData.slice(0, 20)); // Show latest 20 bookings
      
      // Get overall stats
      const stats = await adminApi.getStats();
      setOverallStats({
        totalUsers: stats.totalUsers,
        totalBookings: stats.totalBookings,
        totalRevenue: stats.totalRevenue,
        platformGrowth: 0, // Calculate from previous month
      });

      // Get all bookings for client stats
      const allBookings = await adminApi.getBookings({});
      
      // Get all technicians for technician stats
      const allTechnicians = await adminApi.getTechnicians();

      // Calculate client-side statistics
      const clients = new Set(allBookings.map((b: any) => b.clientId));
      const activeClients = new Set(
        allBookings
          .filter((b: any) => 
            ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(b.status)
          )
          .map((b: any) => b.clientId)
      );
      
      const completedBookings = allBookings.filter((b: any) => b.status === 'COMPLETED');
      const pendingBookings = allBookings.filter((b: any) => b.status === 'PENDING');
      const paidBookings = allBookings.filter((b: any) => b.paymentStatus === 'PAID');
      const totalSpent = paidBookings.reduce((sum: number, b: any) => sum + (b.finalPrice || 0), 0);
      
      setClientStats({
        totalClients: clients.size,
        activeClients: activeClients.size,
        totalBookings: allBookings.length,
        completedBookings: completedBookings.length,
        pendingBookings: pendingBookings.length,
        totalSpent,
        averageBookingValue: paidBookings.length > 0 ? totalSpent / paidBookings.length : 0,
      });

      // Calculate technician-side statistics
      const approvedTechs = allTechnicians.filter((t: any) => t.verificationStatus === 'APPROVED');
      const pendingTechs = allTechnicians.filter((t: any) => t.verificationStatus === 'PENDING');
      const onlineTechs = allTechnicians.filter((t: any) => t.isOnline);
      
      const techCompletedJobs = allBookings.filter(
        (b: any) => b.status === 'COMPLETED' && b.technicianId
      );
      const techRevenue = techCompletedJobs.reduce(
        (sum: number, b: any) => sum + (b.finalPrice || 0),
        0
      );
      
      const allRatings = approvedTechs
        .map((t: any) => t.averageRating)
        .filter((r: number) => r > 0);
      const avgRating = allRatings.length > 0
        ? allRatings.reduce((sum: number, r: number) => sum + r, 0) / allRatings.length
        : 0;

      setTechnicianStats({
        totalTechnicians: allTechnicians.length,
        approvedTechnicians: approvedTechs.length,
        pendingTechnicians: pendingTechs.length,
        onlineTechnicians: onlineTechs.length,
        totalJobsCompleted: techCompletedJobs.length,
        totalRevenue: techRevenue,
        averageRating: avgRating,
        averageJobsPerTechnician: approvedTechs.length > 0
          ? techCompletedJobs.length / approvedTechs.length
          : 0,
      });

      // Set available technicians (approved and online)
      const available = allTechnicians.filter(
        (t: any) => t.verificationStatus === 'APPROVED' && t.isOnline
      );
      setAvailableTechnicians(available.slice(0, 10)); // Show top 10
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', py: 4, p: { xs: 2, md: 0 } }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Panel - Orders Management */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={ordersPanelOpen}
          sx={{
            width: ordersPanelOpen ? 380 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 380,
              boxSizing: 'border-box',
              position: 'relative',
              height: 'auto',
              borderRight: '1px solid #e0e0e0',
              bgcolor: '#fafbfc',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#032B5A', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Gestion des Commandes
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOrdersPanelOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {bookings.length} commandes récentes
            </Typography>
          </Box>
          <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
            <List sx={{ p: 1 }}>
              {bookings.map((booking) => (
                <ListItem key={booking.id} disablePadding sx={{ mb: 1 }}>
                  <Paper
                    sx={{
                      width: '100%',
                      p: 2,
                      borderRadius: 2,
                      border: selectedBooking?.id === booking.id ? '2px solid #F4C542' : '1px solid #e0e0e0',
                      bgcolor: selectedBooking?.id === booking.id ? '#fffbf0' : 'white',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#F4C542',
                        bgcolor: '#fffbf0',
                      },
                    }}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#032B5A' }}>
                        {booking.category?.name || 'Service'}
                      </Typography>
                      <Chip
                        label={booking.status === 'PENDING' ? 'En attente' : 
                               booking.status === 'ACCEPTED' ? 'Accepté' :
                               booking.status === 'COMPLETED' ? 'Terminé' : booking.status}
                        size="small"
                        color={booking.status === 'COMPLETED' ? 'success' : 
                               booking.status === 'PENDING' ? 'warning' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {booking.client?.name || 'Client'} • {booking.city}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#F4C542' }}>
                      {booking.finalPrice || booking.estimatedPrice || 0} MAD
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#032B5A' }}>
                Tableau de Bord Administrateur
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vue d'ensemble complète de la plateforme Allo Bricolage
              </Typography>
            </Box>
            {!ordersPanelOpen && (
              <Button
                variant="contained"
                onClick={() => setOrdersPanelOpen(true)}
                sx={{
                  bgcolor: '#032B5A',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                }}
              >
                Ouvrir les commandes
              </Button>
            )}
          </Box>

      {/* Overall Platform Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: '#032B5A', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {overallStats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Utilisateurs totaux
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: '#F4C542', color: '#032B5A' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(3, 43, 90, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WorkIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {overallStats.totalBookings}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Réservations totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: '#4caf50', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoneyIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {overallStats.totalRevenue.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Revenus (MAD)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, border: '2px solid #032B5A' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#032B5A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    {overallStats.platformGrowth > 0 ? '+' : ''}
                    {overallStats.platformGrowth}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Croissance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Client-Side Dashboard */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <PersonIcon sx={{ fontSize: 32, color: '#032B5A' }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#032B5A' }}>
            Tableau de Bord - Côté Client
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#032B5A' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {clientStats.totalClients}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clients totaux
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(clientStats.activeClients / clientStats.totalClients) * 100 || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#032B5A',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {clientStats.activeClients} actifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: '#F4C542' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {clientStats.totalBookings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Réservations
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip
                    label={`${clientStats.completedBookings} terminées`}
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{ bgcolor: '#4caf50', color: 'white' }}
                  />
                  <Chip
                    label={`${clientStats.pendingBookings} en attente`}
                    size="small"
                    icon={<PendingIcon />}
                    sx={{ bgcolor: '#F4C542', color: '#032B5A' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {clientStats.totalSpent.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total dépensé (MAD)
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Moyenne: {clientStats.averageBookingValue.toFixed(0)} MAD/booking
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#032B5A' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {clientStats.totalBookings > 0
                        ? ((clientStats.completedBookings / clientStats.totalBookings) * 100).toFixed(1)
                        : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux de complétion
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    clientStats.totalBookings > 0
                      ? (clientStats.completedBookings / clientStats.totalBookings) * 100
                      : 0
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4caf50',
                    },
                    mt: 2,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Technician-Side Dashboard */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <BuildIcon sx={{ fontSize: 32, color: '#032B5A' }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#032B5A' }}>
            Tableau de Bord - Côté Technicien
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <BuildIcon sx={{ fontSize: 40, color: '#032B5A' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {technicianStats.totalTechnicians}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Techniciens totaux
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip
                    label={`${technicianStats.approvedTechnicians} approuvés`}
                    size="small"
                    sx={{ bgcolor: '#4caf50', color: 'white' }}
                  />
                  <Chip
                    label={`${technicianStats.pendingTechnicians} en attente`}
                    size="small"
                    sx={{ bgcolor: '#F4C542', color: '#032B5A' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {technicianStats.onlineTechnicians}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En ligne maintenant
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    technicianStats.totalTechnicians > 0
                      ? (technicianStats.onlineTechnicians / technicianStats.totalTechnicians) * 100
                      : 0
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4caf50',
                    },
                    mt: 2,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WorkIcon sx={{ fontSize: 40, color: '#F4C542' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {technicianStats.totalJobsCompleted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Travaux terminés
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Moyenne: {technicianStats.averageJobsPerTechnician.toFixed(1)}/technicien
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 40, color: '#F4C542' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {technicianStats.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Note moyenne
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      sx={{
                        fontSize: 20,
                        color: star <= Math.round(technicianStats.averageRating) ? '#F4C542' : '#e0e0e0',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {technicianStats.totalRevenue.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revenus générés (MAD)
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Par technicien: {technicianStats.approvedTechnicians > 0
                    ? (technicianStats.totalRevenue / technicianStats.approvedTechnicians).toFixed(0)
                    : 0} MAD
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Available Technicians Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 32, color: '#4caf50' }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#032B5A' }}>
            Techniciens Disponibles Maintenant
          </Typography>
          <Chip
            label={`${availableTechnicians.length} en ligne`}
            sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 600 }}
          />
        </Box>

        {availableTechnicians.length === 0 ? (
          <Alert severity="info">
            Aucun technicien disponible pour le moment.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#032B5A' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Technicien</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ville</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Compétences</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Note</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Expérience</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tarif</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableTechnicians.map((technician: any) => {
                  const imageIndex = (technician.user?.id?.charCodeAt(0) || 1) % 8 + 1;
                  const technicianImage = `/images/technicians/technician_${imageIndex}.svg`;

                  return (
                    <TableRow
                      key={technician.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={technician.profilePictureUrl || technicianImage}
                            alt={technician.user?.name}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: '#032B5A',
                            }}
                          >
                            {technician.user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                              {technician.user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {technician.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {technician.user?.city}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {technician.skills?.slice(0, 2).map((skill: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={skill}
                              size="small"
                              sx={{
                                bgcolor: '#f5f5f5',
                                fontSize: '0.7rem',
                                height: 24,
                              }}
                            />
                          ))}
                          {technician.skills?.length > 2 && (
                            <Chip
                              label={`+${technician.skills.length - 2}`}
                              size="small"
                              sx={{
                                bgcolor: '#F4C542',
                                color: '#032B5A',
                                fontSize: '0.7rem',
                                height: 24,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={technician.averageRating || 0}
                            readOnly
                            precision={0.1}
                            size="small"
                            sx={{
                              '& .MuiRating-iconFilled': { color: '#F4C542' },
                              '& .MuiRating-iconEmpty': { color: '#e0e0e0' },
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                            {technician.averageRating?.toFixed(1) || '0.0'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {technician.yearsOfExperience} ans
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F4C542' }}>
                          {technician.hourlyRate
                            ? `${technician.hourlyRate} MAD/h`
                            : technician.basePrice
                            ? `${technician.basePrice} MAD`
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="En ligne"
                          size="small"
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            fontWeight: 600,
                          }}
                          icon={<CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

          {/* Order Edit Dialog */}
          {selectedBooking && (
            <Paper
              sx={{
                position: 'fixed',
                bottom: 20,
                right: ordersPanelOpen ? 400 : 20,
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
                  Modifier la commande
                </Typography>
                <IconButton size="small" onClick={() => setSelectedBooking(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                  Client: {selectedBooking.client?.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                  Service: {selectedBooking.category?.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
                  Prix: {selectedBooking.finalPrice || selectedBooking.estimatedPrice || 0} MAD
                </Typography>
              </Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={selectedBooking.status}
                  label="Statut"
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value })}
                >
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="ACCEPTED">Accepté</MenuItem>
                  <MenuItem value="ON_THE_WAY">En route</MenuItem>
                  <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                  <MenuItem value="AWAITING_PAYMENT">En attente de paiement</MenuItem>
                  <MenuItem value="COMPLETED">Terminé</MenuItem>
                  <MenuItem value="CANCELLED">Annulé</MenuItem>
                  <MenuItem value="DECLINED">Refusé</MenuItem>
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={async () => {
                  try {
                    await bookingsApi.updateStatus(selectedBooking.id, { status: selectedBooking.status });
                    await loadDashboardData();
                    setSelectedBooking(null);
                  } catch (error) {
                    console.error('Failed to update booking status:', error);
                  }
                }}
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': { bgcolor: '#e0b038' },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Enregistrer
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
