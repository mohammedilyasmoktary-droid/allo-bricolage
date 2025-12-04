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
        position: 'relative',
        width: '100%',
        minHeight: { xs: '500px', md: '600px' },
        background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 50%, #032B5A 100%)',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 4 },
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, #F4C542 0%, transparent 50%), radial-gradient(circle at 80% 80%, #F4C542 0%, transparent 50%)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            color: 'white',
            mb: 2,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          Besoin d'un Technicien?
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: '#F4C542',
            mb: 4,
            fontWeight: 500,
            fontSize: { xs: '1.1rem', md: '1.5rem' },
          }}
        >
          Trouvez le professionnel qu'il vous faut en quelques clics
        </Typography>

        {/* CTA Buttons */}
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
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
                '&:hover': { bgcolor: '#e0b038', transform: 'translateY(-4px)' },
                textTransform: 'none',
                py: 3,
                fontWeight: 700,
                fontSize: '1.25rem',
                boxShadow: '0 8px 24px rgba(244, 197, 66, 0.4)',
                transition: 'all 0.3s ease',
                borderRadius: 3,
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
                borderWidth: 3,
                color: 'white',
                '&:hover': {
                  borderColor: '#F4C542',
                  bgcolor: 'rgba(244, 197, 66, 0.1)',
                  transform: 'translateY(-4px)',
                },
                textTransform: 'none',
                py: 3,
                fontWeight: 700,
                fontSize: '1.25rem',
                boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                borderRadius: 3,
              }}
            >
              Je suis un Technicien
            </Button>
          </Grid>
        </Grid>

        {/* Quick Service Icons */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            Services populaires:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Plomberie', 'Électricité', 'Peinture', 'Climatisation', 'Petits travaux', 'Serrurerie'].map((service) => (
              <Button
                key={service}
                variant="text"
                size="small"
                onClick={() => {
                  if (user?.role === 'CLIENT') {
                    navigate(`/client/search?service=${service}`);
                  } else if (!user) {
                    navigate('/register');
                  }
                }}
                sx={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
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





