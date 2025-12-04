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
        minHeight: { xs: '600px', md: '720px' },
        background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 50%, #032B5A 100%)',
        borderRadius: { xs: 2, md: 3 },
        mb: { xs: 5, md: 8 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
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
      <Box sx={{ textAlign: 'center', maxWidth: 1000, mx: 'auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            color: 'white',
            mb: 3,
            fontSize: { xs: '2.75rem', sm: '3.5rem', md: '4.5rem' },
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Besoin d'un Technicien ?
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: '#F4C542',
            mb: { xs: 5, md: 7 },
            fontWeight: 500,
            fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.5rem' },
            lineHeight: 1.5,
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          Trouvez un professionnel certifié en quelques clics.
        </Typography>

        {/* CTA Buttons */}
        <Grid container spacing={3} justifyContent="center" sx={{ mb: { xs: 6, md: 8 }, maxWidth: 750, mx: 'auto' }}>
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
                py: { xs: 2.5, md: 3 },
                px: 4,
                fontWeight: 700,
                fontSize: { xs: '1.05rem', md: '1.2rem' },
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
                py: { xs: 2.5, md: 3 },
                px: 4,
                fontWeight: 700,
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                borderRadius: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Je suis un Technicien
            </Button>
          </Grid>
        </Grid>

        {/* Quick Service Icons */}
        <Box sx={{ mt: { xs: 5, md: 6 } }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              mb: 3, 
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              fontWeight: 500,
            }}
          >
            Services populaires:
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 25,
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 1, md: 1.25 },
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '0.95rem' },
                  fontWeight: 500,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(244, 197, 66, 0.25)',
                    borderColor: '#F4C542',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(244, 197, 66, 0.3)',
                  },
                  transition: 'all 0.2s ease',
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





