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
    <Box sx={{ mb: { xs: 6, md: 8 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 3, md: 4 }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              color: '#032B5A', 
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            Techniciens Disponibles Maintenant
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
            }}
          >
            {technicians.length} technicien{technicians.length > 1 ? 's' : ''} en ligne dans votre région
          </Typography>
        </Box>
        <Chip
          label="En direct"
          sx={{
            bgcolor: '#4caf50',
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            px: 1.5,
            py: 0.5,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 },
            },
          }}
        />
      </Box>

      {technicians.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            bgcolor: '#e3f2fd',
            '& .MuiAlert-icon': {
              color: '#1976d2',
            },
          }}
        >
          Aucun technicien en ligne pour le moment. Veuillez réessayer plus tard.
        </Alert>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
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
                  border: '1px solid #e8eaed',
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
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
                    top: 16,
                    right: 16,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                    zIndex: 2,
                  }}
                />

                <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
                    <Avatar
                      src={normalizeImageUrl(technician.profilePictureUrl) || technicianImage}
                      alt={technician.user?.name}
                      sx={{
                        width: { xs: 64, md: 72 },
                        height: { xs: 64, md: 72 },
                        bgcolor: '#032B5A',
                        color: '#F4C542',
                        fontSize: { xs: 26, md: 30 },
                        fontWeight: 700,
                        border: '3px solid #F4C542',
                        boxShadow: '0 4px 12px rgba(3, 43, 90, 0.2)',
                      }}
                    >
                      {technician.user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#032B5A',
                          fontSize: { xs: '1rem', md: '1.15rem' },
                          mb: 0.5,
                        }}
                      >
                        {technician.user?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: '#9e9e9e' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                            fontWeight: 500,
                          }}
                        >
                          {technician.user?.city}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Rating 
                        value={technician.averageRating} 
                        readOnly 
                        precision={0.5} 
                        size="small"
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: '#F4C542',
                          },
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#032B5A',
                          fontWeight: 600,
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                        }}
                      >
                        {technician.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                      }}
                    >
                      {technician.yearsOfExperience} ans d'expérience
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    {technician.skills.slice(0, 2).map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        size="small"
                        sx={{
                          mr: 0.75,
                          mb: 0.75,
                          bgcolor: '#f8f9fa',
                          color: '#032B5A',
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          fontWeight: 600,
                          border: '1px solid #e8eaed',
                          borderRadius: 2,
                          height: { xs: 24, md: 28 },
                        }}
                      />
                    ))}
                  </Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#F4C542', 
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.15rem' },
                      }}
                    >
                      {technician.hourlyRate ? `${technician.hourlyRate} MAD/h` : `${technician.basePrice} MAD`}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user?.role === 'CLIENT') {
                          navigate(`/client/bookings/create?technicianId=${technician.id}`);
                        } else {
                          navigate('/login');
                        }
                      }}
                      sx={{
                        bgcolor: '#032B5A',
                        color: 'white',
                        '&:hover': { 
                          bgcolor: '#021d3f',
                          transform: 'scale(1.05)',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        py: 1,
                        borderRadius: 2,
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        boxShadow: '0 2px 8px rgba(3, 43, 90, 0.2)',
                        transition: 'all 0.2s ease',
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

