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
        background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 40%, #032B5A 100%)',
        borderRadius: { xs: 3, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 5 },
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(3, 43, 90, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(244, 197, 66, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(244, 197, 66, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)
          `,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 1000, mx: 'auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 900,
            color: 'white',
            mb: 2,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          Besoin d'un Technicien ?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#F4C542',
            mb: { xs: 4, md: 5 },
            fontWeight: 500,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            lineHeight: 1.6,
            maxWidth: 700,
            mx: 'auto',
            letterSpacing: '0.01em',
            textShadow: '0 2px 10px rgba(244, 197, 66, 0.2)',
          }}
        >
          Trouvez un professionnel certifié en quelques clics.
        </Typography>

        {/* CTA Buttons */}
        <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 800, mx: 'auto' }}>
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
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 16px 40px rgba(244, 197, 66, 0.5)',
                },
                textTransform: 'none',
                py: { xs: 2, md: 2.5 },
                px: 4,
                fontWeight: 800,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                borderRadius: 4,
                boxShadow: '0 10px 30px rgba(244, 197, 66, 0.4), 0 0 0 1px rgba(244, 197, 66, 0.1) inset',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.02em',
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
                borderColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 3,
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                '&:hover': {
                  borderColor: '#F4C542',
                  bgcolor: 'rgba(244, 197, 66, 0.2)',
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 16px 40px rgba(244, 197, 66, 0.3)',
                },
                textTransform: 'none',
                py: { xs: 2, md: 2.5 },
                px: 4,
                fontWeight: 800,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                borderRadius: 4,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.02em',
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





