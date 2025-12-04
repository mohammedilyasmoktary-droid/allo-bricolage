import React, { ReactNode, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  useMediaQuery, 
  useTheme,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BuildIcon from '@mui/icons-material/Build';
import MenuIcon from '@mui/icons-material/Menu';
import ScrollToTop from './ScrollToTop';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavItems = () => {
    if (!user) {
      return [
        { label: 'Accueil', path: '/' },
        { label: 'Rechercher', path: '/search' },
        { label: 'Connexion', path: '/login' },
        { label: 'Inscription', path: '/register' },
      ];
    }

    switch (user.role) {
      case 'CLIENT':
        return [
          { label: 'Accueil', path: '/' },
          { label: 'Rechercher', path: '/search' },
          { label: 'Mes réservations', path: '/client/bookings' },
          { label: 'Profil', path: '/client/profile' },
        ];
      case 'TECHNICIAN':
        return [
          { label: 'Tableau de bord', path: '/technician/dashboard' },
          { label: 'Statistiques', path: '/technician/analytics' },
          { label: 'Demandes', path: '/technician/requests' },
          { label: 'Mes travaux', path: '/technician/jobs' },
          { label: 'Abonnement', path: '/technician/subscription' },
          { label: 'Profil', path: '/technician/profile' },
        ];
      case 'ADMIN':
        return [
          { label: 'Tableau de bord', path: '/admin/dashboard' },
          { label: 'Techniciens', path: '/admin/technicians' },
          { label: 'Réservations', path: '/admin/bookings' },
          { label: 'Profil', path: '/admin/profile' },
        ];
      default:
        return [];
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = getNavItems();

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: '#F4C542',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BuildIcon sx={{ fontSize: 28, color: '#032B5A' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', lineHeight: 1.2 }}>
            Allo Bricolage
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Maintenance au Maroc
          </Typography>
        </Box>
      </Box>
      {user && (
        <>
          <Box sx={{ px: 2, mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mb: 1,
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(244, 197, 66, 0.1)',
                },
              }}
              onClick={() => {
                const profilePath = 
                  user.role === 'CLIENT' ? '/client/profile' :
                  user.role === 'TECHNICIAN' ? '/technician/profile' :
                  '/admin/profile';
                navigate(profilePath);
                handleDrawerToggle();
              }}
            >
              <Avatar
                src={user.profilePictureUrl}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  fontWeight: 700,
                }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {user.name}
                </Typography>
                <Chip
                  label={user.role === 'CLIENT' ? 'Client' : user.role === 'TECHNICIAN' ? 'Technicien' : 'Admin'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    fontWeight: 700,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': { bgcolor: 'rgba(244, 197, 66, 0.1)' },
              }}
            >
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#032B5A',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{
                  '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                }}
              >
                <ListItemText 
                  primary="Déconnexion"
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: '#f44336',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: '#032B5A', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          top: 0, 
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          {/* Logo Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              mr: 4,
              flexShrink: 0,
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: '#F4C542',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(244, 197, 66, 0.3)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <BuildIcon sx={{ fontSize: 26, color: '#032B5A' }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Allo Bricolage
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.7rem',
                  display: { xs: 'none', sm: 'block' },
                  lineHeight: 1,
                }}
              >
                Plateforme de maintenance
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                ml: 'auto',
                color: 'white',
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    textTransform: 'none',
                    color: 'white',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '0.9rem',
                    '&:hover': { 
                      bgcolor: 'rgba(244, 197, 66, 0.15)',
                      color: '#F4C542',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* User Section */}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(244, 197, 66, 0.15)',
                  },
                }}
                onClick={() => {
                  const profilePath = 
                    user.role === 'CLIENT' ? '/client/profile' :
                    user.role === 'TECHNICIAN' ? '/technician/profile' :
                    '/admin/profile';
                  navigate(profilePath);
                }}
              >
                <Avatar
                  src={user.profilePictureUrl}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' }}>
                    {user.role === 'CLIENT' ? 'Client' : user.role === 'TECHNICIAN' ? 'Technicien' : 'Admin'}
                  </Typography>
                </Box>
              </Box>
              <Button 
                onClick={handleLogout}
                sx={{ 
                  textTransform: 'none',
                  color: 'white',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': { 
                    bgcolor: 'rgba(244, 67, 54, 0.2)',
                    borderColor: 'rgba(244, 67, 54, 0.5)',
                  },
                }}
              >
                Déconnexion
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{ 
          flex: 1, 
          py: { xs: 3, md: 4 }, 
          px: 0,
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#032B5A',
          color: 'white',
          py: 3,
          mt: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          © 2024 Allo Bricolage - Plateforme de maintenance au Maroc
        </Typography>
      </Box>
      <ScrollToTop />
      <ChatBot />
    </Box>
  );
};

export default Layout;
