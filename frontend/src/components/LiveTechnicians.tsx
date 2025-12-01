import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, Rating, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { techniciansApi, Technician } from '../api/technicians';
import { normalizeImageUrl } from '../utils/imageUrl';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const LiveTechnicians: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLiveTechnicians();
  }, [user]);

  const loadLiveTechnicians = async () => {
    setLoading(true);
    setError('');
    try {
      const city = user?.city || 'Casablanca'; // Default to Casablanca if no user
      const data = await techniciansApi.getAvailable(city, undefined, undefined);
      // Filter only online technicians
      const onlineTechs = data.filter((tech) => tech.isOnline).slice(0, 6);
      setTechnicians(onlineTechs);
    } catch (err: any) {
      // Only show error if it's a real error, not just empty data
      if (err.response?.status !== 404 && err.response?.status !== 200) {
        console.error('Error loading technicians:', err);
        setError(err.response?.data?.error || 'Failed to load technicians');
      }
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

  // Always show section, even if empty (with message)
  // if (technicians.length === 0) {
  //   return null; // Don't show section if no technicians
  // }

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
            Techniciens Disponibles Maintenant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {technicians.length} technicien{technicians.length > 1 ? 's' : ''} en ligne dans votre région
          </Typography>
        </Box>
        <Chip
          label="En direct"
          sx={{
            bgcolor: '#4caf50',
            color: 'white',
            fontWeight: 600,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 },
            },
          }}
        />
      </Box>

      {technicians.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucun technicien en ligne pour le moment. Veuillez réessayer plus tard.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {technicians.map((technician) => {
          const imageIndex = (technician.id?.charCodeAt(0) || 1) % 8 + 1;
          const technicianImage = `/images/technicians/technician_${imageIndex}.svg`;

          return (
            <Grid item xs={12} sm={6} md={4} key={technician.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    borderColor: '#F4C542',
                  },
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => navigate(`/technician/view/${technician.id}`)}
              >
                {/* Online Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={normalizeImageUrl(technician.profilePictureUrl) || technicianImage}
                      alt={technician.user?.name}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#032B5A',
                        fontSize: 24,
                        fontWeight: 600,
                      }}
                    >
                      {technician.user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A' }}>
                        {technician.user?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {technician.user?.city}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={technician.averageRating} readOnly precision={0.5} size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {technician.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {technician.yearsOfExperience} ans d'expérience
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {technician.skills.slice(0, 2).map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        size="small"
                        sx={{
                          mr: 0.5,
                          mb: 0.5,
                          bgcolor: '#f5f5f5',
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h6" sx={{ color: '#F4C542', fontWeight: 700 }}>
                      {technician.hourlyRate ? `${technician.hourlyRate} MAD/h` : `${technician.basePrice} MAD`}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        if (user?.role === 'CLIENT') {
                          navigate(`/client/bookings/create?technicianId=${technician.id}`);
                        } else {
                          navigate('/login');
                        }
                      }}
                      sx={{
                        bgcolor: '#032B5A',
                        color: 'white',
                        '&:hover': { bgcolor: '#021d3f' },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Réserver
                    </Button>
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

export default LiveTechnicians;

