import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { techniciansApi, Technician } from '../api/technicians';
import StarIcon from '@mui/icons-material/Star';
import Rating from '@mui/material/Rating';

const TechnicianShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        setLoading(true);
        // Fetch top 8 approved technicians
        const data = await techniciansApi.getAvailable();
        // Take first 8 for showcase
        setTechnicians(data.slice(0, 8));
      } catch (error) {
        console.error('Failed to load technicians:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTechnicians();
  }, []);

  const handleCardClick = (technicianId: string) => {
    navigate(`/technician/view/${technicianId}`);
  };

  return (
    <Box sx={{ my: 8 }}>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 600, mb: 2, color: '#032B5A', textAlign: 'center' }}
      >
        Nos Techniciens Professionnels
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, textAlign: 'center', color: 'text.secondary', maxWidth: 800, mx: 'auto' }}
      >
        Découvrez notre équipe de techniciens qualifiés et vérifiés, prêts à répondre à tous vos besoins de maintenance et réparation.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : technicians.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
          Aucun technicien disponible pour le moment.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {technicians.map((technician) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={technician.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                }}
                onClick={() => handleCardClick(technician.id)}
              >
                <Box sx={{ position: 'relative', height: 140, bgcolor: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                  {technician.profilePictureUrl ? (
                    <Avatar
                      src={technician.profilePictureUrl}
                      alt={technician.user?.name}
                      sx={{
                        width: 100,
                        height: 100,
                        border: '3px solid #F4C542',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      imgProps={{
                        onError: (e: any) => {
                          e.target.style.display = 'none';
                        },
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#032B5A',
                        color: '#F4C542',
                        fontSize: 36,
                        fontWeight: 600,
                        border: '3px solid #F4C542',
                      }}
                    >
                      {technician.user?.name?.charAt(0).toUpperCase() || 'T'}
                    </Avatar>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A' }}>
                    {technician.user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {technician.skills.slice(0, 2).join(' & ')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Rating value={technician.averageRating} readOnly precision={0.5} size="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                      {technician.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      • {technician.yearsOfExperience} ans
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TechnicianShowcase;

