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
        minHeight: { xs: '550px', md: '650px' },
        background: '#032B5A',
        borderRadius: 2,
        mb: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 10 },
        px: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto', width: '100%' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'white',
            mb: 3,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            lineHeight: 1.2,
          }}
        >
          Besoin d'un Technicien?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#F4C542',
            mb: 6,
            fontWeight: 400,
            fontSize: { xs: '1.1rem', md: '1.35rem' },
            lineHeight: 1.5,
          }}
        >
          Trouvez le professionnel qu'il vous faut en quelques clics
        </Typography>

        {/* CTA Buttons */}
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
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
                py: 2.5,
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.15rem' },
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
                py: 2.5,
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.15rem' },
                borderRadius: 2,
              }}
            >
              Je suis un Technicien
            </Button>
          </Grid>
        </Grid>

        {/* Quick Service Icons */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, fontSize: { xs: '0.95rem', md: '1rem' } }}>
            Services populaires:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Plomberie', 'Électricité', 'Peinture', 'Climatisation', 'Petits travaux', 'Serrurerie'].map((service) => (
              <Button
                key={service}
                variant="text"
                size="medium"
                onClick={() => {
                  navigate(`/search?service=${service}`);
                }}
                sx={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '0.95rem' },
                  '&:hover': {
                    bgcolor: 'rgba(244, 197, 66, 0.2)',
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





