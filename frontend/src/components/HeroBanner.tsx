import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

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
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<FlashOnIcon />}
              onClick={() => {
                if (user?.role === 'CLIENT') {
                  navigate('/client/search?urgent=true');
                } else if (!user) {
                  navigate('/register?role=CLIENT');
                } else {
                  navigate('/client/search');
                }
              }}
              sx={{
                bgcolor: '#F4C542',
                color: '#032B5A',
                '&:hover': { bgcolor: '#e0b038', transform: 'translateY(-2px)' },
                textTransform: 'none',
                py: 2,
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(244, 197, 66, 0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              Réparation Urgente
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ScheduleIcon />}
              onClick={() => {
                if (user?.role === 'CLIENT') {
                  navigate('/client/search');
                } else if (!user) {
                  navigate('/register?role=CLIENT');
                } else {
                  navigate('/client/search');
                }
              }}
              sx={{
                bgcolor: 'white',
                color: '#032B5A',
                '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)' },
                textTransform: 'none',
                py: 2,
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              Réserver Maintenant
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<RequestQuoteIcon />}
              onClick={() => {
                if (user?.role === 'CLIENT') {
                  navigate('/client/diagnosis');
                } else if (!user) {
                  navigate('/register?role=CLIENT');
                } else {
                  navigate('/client/diagnosis');
                }
              }}
              sx={{
                borderColor: '#F4C542',
                borderWidth: 2,
                color: '#F4C542',
                '&:hover': {
                  borderColor: '#F4C542',
                  bgcolor: 'rgba(244, 197, 66, 0.1)',
                  transform: 'translateY(-2px)',
                },
                textTransform: 'none',
                py: 2,
                fontWeight: 700,
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
              }}
            >
              Demander un Devis
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





