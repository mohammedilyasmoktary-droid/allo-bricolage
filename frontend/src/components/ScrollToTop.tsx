import React, { useState, useEffect } from 'react';
import { Box, Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <Fab
        onClick={scrollToTop}
        size="medium"
        sx={{
          bgcolor: '#F4C542',
          color: '#032B5A',
          '&:hover': {
            bgcolor: '#e0b038',
            transform: 'translateY(-4px)',
          },
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
        }}
        aria-label="scroll to top"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Box>
  );
};

export default ScrollToTop;





