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
        background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 50%, #032B5A 100%)',
        borderRadius: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 5 },
        px: { xs: 3, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(244, 197, 66, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 197, 66, 0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            color: 'white',
            mb: 1.5,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Besoin d'un Technicien ?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#F4C542',
            mb: { xs: 3, md: 3.5 },
            fontWeight: 500,
            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
            lineHeight: 1.5,
            maxWidth: 650,
            mx: 'auto',
          }}
        >
          Trouvez un professionnel certifié en quelques clics.
        </Typography>

        {/* CTA Buttons */}
        <Grid container spacing={2.5} justifyContent="center" sx={{ maxWidth: 700, mx: 'auto' }}>
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
                '&:hover': { 
                  bgcolor: '#e0b038',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(244, 197, 66, 0.4)',
                },
                textTransform: 'none',
                py: { xs: 1.5, md: 2 },
                px: 3,
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1rem' },
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(244, 197, 66, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                borderColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 2.5,
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#F4C542',
                  bgcolor: 'rgba(244, 197, 66, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(255, 255, 255, 0.2)',
                },
                textTransform: 'none',
                py: { xs: 1.5, md: 2 },
                px: 3,
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1rem' },
                borderRadius: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Je suis un Technicien
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HeroBanner;





