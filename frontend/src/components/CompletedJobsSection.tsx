import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, Booking } from '../api/bookings';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CompletedJobsSection: React.FC = () => {
  const navigate = useNavigate();
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompletedJobs();
  }, []);

  const loadCompletedJobs = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch completed bookings
      const allBookings = await bookingsApi.getAll();
      const completed = allBookings
        .filter((b) => b.status === 'COMPLETED')
        .slice(0, 6); // Show latest 6 completed jobs
      setCompletedJobs(completed);
    } catch (err: any) {
      // If getAll fails, try to show mock data or hide section
      console.error('Failed to load completed jobs:', err);
      setCompletedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
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

  // Show section even if empty (with message)

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
            Demandes & Travaux Réalisés
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Découvrez nos réalisations et témoignages de qualité
          </Typography>
        </Box>
        <Chip
          icon={<CheckCircleIcon />}
          label={`${completedJobs.length} travaux`}
          sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 600 }}
        />
      </Box>

      {completedJobs.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucun travail terminé à afficher pour le moment.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {completedJobs.map((job) => {
          const imageIndex = (job.id?.charCodeAt(0) || 1) % 8 + 1;
          const jobImage = job.photos && job.photos.length > 0 
            ? job.photos[0] 
            : `/images/technicians/technician_${imageIndex}.svg`;

          return (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                  overflow: 'hidden',
                }}
                onClick={() => {
                  // Navigate to booking details
                  // Gallery removed - can navigate to booking details if needed
                }}
              >
                <Box sx={{ position: 'relative', height: 200 }}>
                  <CardMedia
                    component="img"
                    image={jobImage}
                    alt={job.category?.name || 'Travail réalisé'}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e: any) => {
                      e.target.src = `/images/technicians/technician_${imageIndex}.svg`;
                    }}
                  />
                  <Chip
                    label={job.category?.name || 'Service'}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: '#032B5A',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Terminé"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: '#4caf50',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A' }}>
                    {job.category?.name || 'Service'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {job.description?.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(job.createdAt), 'dd MMM yyyy')}
                    </Typography>
                    {job.finalPrice && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#F4C542' }}>
                        {job.finalPrice} MAD
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        </Grid>
      )}
    </Box>
  );
};

export default CompletedJobsSection;

