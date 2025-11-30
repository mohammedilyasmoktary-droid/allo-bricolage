import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

// Support both .jpg and .svg (for placeholders)
const getImagePath = (index: number, ext: string = 'jpg'): string => {
  return `/images/technicians/technician_${index}.${ext}`;
};

const technicianImages = [
  getImagePath(1, 'svg'), // Will try .svg first, fallback to .jpg
  getImagePath(2, 'svg'),
  getImagePath(3, 'svg'),
  getImagePath(4, 'svg'),
  getImagePath(5, 'svg'),
  getImagePath(6, 'svg'),
  getImagePath(7, 'svg'),
  getImagePath(8, 'svg'),
];

const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: HeroSlide[] = [
    {
      image: technicianImages[0],
      title: 'Techniciens Professionnels',
      subtitle: 'Des experts qualifiés à votre service',
    },
    {
      image: technicianImages[1],
      title: 'Service Rapide et Fiable',
      subtitle: 'Intervention rapide pour tous vos besoins',
    },
    {
      image: technicianImages[2],
      title: 'Maintenance de Qualité',
      subtitle: 'Des solutions durables pour votre confort',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '400px', md: '600px' },
        overflow: 'hidden',
        borderRadius: 2,
        mb: 6,
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${slides[currentIndex].image}), url(${slides[currentIndex].image.replace('.svg', '.jpg')}), linear-gradient(135deg, #032B5A 0%, #021d3f 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        {/* Dark Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(3, 43, 90, 0.7)', // Dark blue overlay
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            px: 3,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {slides[currentIndex].title}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#F4C542',
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {slides[currentIndex].subtitle}
          </Typography>
          {!user && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': { bgcolor: '#e0b038' },
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
                onClick={() => navigate('/register')}
              >
                Commencer maintenant
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
            </Box>
          )}
          {user && user.role === 'CLIENT' && (
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#F4C542',
                color: '#032B5A',
                '&:hover': { bgcolor: '#e0b038' },
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
              onClick={() => navigate('/client/search')}
            >
              Rechercher un technicien
            </Button>
          )}
        </Box>
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={goToPrevious}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.2)',
          color: 'white',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          zIndex: 2,
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <IconButton
        onClick={goToNext}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.2)',
          color: 'white',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          zIndex: 2,
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Dots Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 2,
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: currentIndex === index ? 32 : 12,
              height: 12,
              borderRadius: 6,
              bgcolor: currentIndex === index ? '#F4C542' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: currentIndex === index ? '#F4C542' : 'rgba(255,255,255,0.7)' },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroCarousel;

