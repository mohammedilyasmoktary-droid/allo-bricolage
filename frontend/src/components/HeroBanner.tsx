import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HeroBanner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: { xs: '450px', md: '550px' },
        background: '#032B5A',
        borderRadius: 2,
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 5, md: 6 },
        px: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'white',
            mb: 2,
            fontSize: { xs: '2.25rem', md: '3rem' },
          }}
        >
          Besoin d'un Technicien?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#F4C542',
            mb: 5,
            fontWeight: 400,
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          Trouvez le professionnel qu'il vous faut en quelques clics
        </Typography>

        {/* CTA Buttons */}
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                navigate('/search');
              }}
              sx={{
                bgcolor: '#F4C542',
                color: '#032B5A',
                '&:hover': { bgcolor: '#e0b038' },
                textTransform: 'none',
                py: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Je suis un Client
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => {
                if (user?.role === 'TECHNICIAN') {
                  navigate('/technician/dashboard');
                } else if (!user) {
                  navigate('/technicien/abonnement');
                } else {
                  navigate('/technicien/abonnement');
                }
              }}
              sx={{
                borderColor: 'white',
                borderWidth: 2,
                color: 'white',
                '&:hover': {
                  borderColor: '#F4C542',
                  bgcolor: 'rgba(244, 197, 66, 0.1)',
                },
                textTransform: 'none',
                py: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Je suis un Technicien
            </Button>
          </Grid>
        </Grid>

        {/* Quick Service Icons */}
        <Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Services populaires:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Plomberie', 'Électricité', 'Peinture', 'Climatisation', 'Petits travaux', 'Serrurerie'].map((service) => (
              <Button
                key={service}
                variant="text"
                size="small"
                onClick={() => {
                  navigate(`/search?service=${service}`);
                }}
                sx={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.75,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    bgcolor: 'rgba(244, 197, 66, 0.15)',
                    borderColor: '#F4C542',
                  },
                }}
              >
                {service}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroBanner;





